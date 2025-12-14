import User from '../models/User.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


export const registerUser = async (req, res) => {
  const { name, email, password, phone, location, blood_type, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const validRoles = ['admin', 'doctor', 'patient', 'donor', 'ambulance_driver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const autoVerified = role === 'patient';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      blood_type,
      role,
      is_verified: autoVerified
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};




export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, location, password, is_active_donor } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional toggle for donor availability (doesn't require password)
    if (typeof is_active_donor !== 'undefined') {
      user.is_active_donor = is_active_donor;
    }

    // If user is updating profile info (name, phone, location), verify password
    if (name || phone || location) {
      if (!password) {
        return res.status(400).json({ message: 'Password confirmation is required' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.location = location || user.location;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        blood_type: updatedUser.blood_type,
        role: updatedUser.role,
        is_verified: updatedUser.is_verified,
        is_active_donor: updatedUser.is_active_donor
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
export const verifyUserInfo = async (req, res) => {
  const { email, phone, name } = req.body;

  const user = await User.findOne({ email, phone, name });
  if (!user) return res.status(404).json({ message: 'User not found with provided details' });

  res.json({ success: true });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
};
