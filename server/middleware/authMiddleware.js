import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to check if user is verified (except patients)
export const requireVerified = (req, res, next) => {
  if (req.user.role === 'patient' || req.user.is_verified) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Your account has not been verified by an admin yet.' });
};

// Middleware to check if user is an admin
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Admins only' });
};
