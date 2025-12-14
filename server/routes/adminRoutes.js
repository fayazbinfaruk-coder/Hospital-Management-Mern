import express from 'express';
import {
  getAllUsersByRole,
  verifyUser,
  deleteUser
} from '../controllers/adminController.js';

import {
  requireAuth,
  requireAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login AND admin access
router.get('/users/:role', requireAuth, requireAdmin, getAllUsersByRole);
router.patch('/verify/:id', requireAuth, requireAdmin, verifyUser);
router.delete('/user/:id', requireAuth, requireAdmin, deleteUser);

export default router;
