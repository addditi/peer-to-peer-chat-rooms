import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 


const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});


UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


UserSchema.methods.validatePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};


UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      role: this.role,
      username: this.username,
    },
    JWT_SECRET,
    { expiresIn: '7d' } 
  );
  return token;
};


const User = mongoose.model('User', UserSchema);

export { User };
