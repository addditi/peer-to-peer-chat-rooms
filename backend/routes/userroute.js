import express from 'express';
import { User } from './authroute.js'; // Adjust import path as needed
import { ChatRoom } from './chatroom.js'; // Import ChatRoom for additional user-related operations
import jwt from 'jsonwebtoken';

// Middleware for JWT Authentication
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin rights required.' });
  }
  next();
};

const router = express.Router();

// User Registration Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'Member'
    });

    await user.save();

    // Generate authentication token
    const token = user.generateAuthToken();

    res.status(201).json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Validate password
    const isMatch = await user.validatePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate authentication token
    const token = user.generateAuthToken();

    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get User Profile Route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Find chat rooms user is a member of
    const chatRooms = await ChatRoom.find({ members: req.user._id });

    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      chatRooms: chatRooms.map(room => ({
        id: room._id,
        name: room.name,
        isActive: room.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Profile Route
router.patch('/profile', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change Password Route
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate current password
    const isMatch = await req.user.validatePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Set new password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get User's Chat Rooms
router.get('/chatrooms', authMiddleware, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ members: req.user._id });
    
    res.json(chatRooms.map(room => ({
      id: room._id,
      name: room.name,
      isActive: room.isActive,
      createdAt: room.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get All Users Route
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete User Route
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove user from all chat rooms
    await ChatRoom.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    res.json({ 
      message: 'User deleted successfully', 
      user: { 
        id: user._id, 
        username: user.username 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;