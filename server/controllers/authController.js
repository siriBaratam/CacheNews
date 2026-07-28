import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cache_news_secret_key_12345', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email is already registered.' });
    }

    // Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      username,
      email,
      password
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      karma: user.karma,
      token
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      karma: user.karma,
      token
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
