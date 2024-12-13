import { User } from './authcontroller.js';
import { ChatRoom } from './model/chatroom'; // Import ChatRoom for user-related operations
import jwt from 'jsonwebtoken';


// Controller for user registration
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or username already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'Member',
        });
        await user.save();

        // Generate a JWT token
        const token = user.generateAuthToken();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller for user login
const loginUser = async (req, res) => {
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

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Generate a JWT token
        const token = user.generateAuthToken();

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller for fetching user profile
const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // Authenticated user from auth middleware

        
        const chatRooms = await ChatRoom.find({ members: user._id });

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            chatRooms: chatRooms.map(room => ({
                id: room._id,
                name: room.name,
                isActive: room.isActive,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller for updating user profile
const updateUserProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const user = req.user; 

        
        updates.forEach(update => {
            user[update] = req.body[update];
        });
        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller for changing user password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user; // Authenticated user from auth middleware

        // Validate current password
        const isMatch = await user.validatePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin controller for fetching all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude password from the response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin controller for deleting a user
const deleteUser = async (req, res) => {
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

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsers,
    deleteUser,
};
