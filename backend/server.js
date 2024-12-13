import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';


import { errorMiddleware } from './middleware/errorMiddleware.js';


dotenv.config();

const app = express();


app.use(express.json());


app.use(cors());


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
};


app.use('/api/auth', authRoutes);  
app.use('/api/chat', chatRoutes);  
app.use('/api/users', userRoutes); 


app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB(); 
});