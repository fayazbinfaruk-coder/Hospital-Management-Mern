import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyUserInfo,
  resetPassword
} from '../controllers/userController.js';

import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/register
router.post('/register', registerUser);

// @route   POST /api/users/login
router.post('/login', loginUser);

// @route   GET /api/users/profile
router.get('/profile', requireAuth, getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', requireAuth, updateUserProfile);

router.post('/verify-user', verifyUserInfo);

router.post('/reset-password', resetPassword);


export default router;
