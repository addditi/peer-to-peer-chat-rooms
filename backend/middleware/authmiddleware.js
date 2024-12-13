import jwt from 'jsonwebtoken';
import { User } from './model/user'; 

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Extract the token 
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user 
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach the user and token to objt
        req.user = user;
        req.token = token;

        next(); 
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Admin Middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin rights required.' });
    }
    next(); 
};

export { authMiddleware, adminMiddleware };
