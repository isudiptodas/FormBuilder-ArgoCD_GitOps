import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'prod',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createToken = (user) => {
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Please login to continue' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User session is no longer valid' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Please login again' });
  }
};

router.post('/signup', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = createToken(user);

    res.cookie('token', token, cookieOptions);
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      message: 'Account created successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    res.cookie('token', token, cookieOptions);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      message: 'Logged in successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not login' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: 'Could not verify session' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not logout' });
  }
});

export default router;
