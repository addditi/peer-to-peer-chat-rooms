import jwt from 'jsonwebtoken';


const generateToken = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET || 'your_jwt_secret', 
        { expiresIn: '1h' } 
    );
};

export { generateToken };
