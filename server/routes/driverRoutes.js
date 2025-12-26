// server/routes/driverRoutes.js
import express from 'express';
import {
  getDriverDashboard,
  acceptRequest,
  startProcessing,
  completeRequest,
  proposeFare,
  getDriverProfile,
  updateDriverProfile
} from '../controllers/driverController.js';
import { requireAuth, requireVerified } from '../middleware/authMiddleware.js';

const router = express.Router();

// View driver dashboard
router.get('/dashboard', requireAuth, getDriverDashboard);

// Driver profile (allow access without admin verification)
router.get('/profile', requireAuth, getDriverProfile);
router.put('/profile', requireAuth, updateDriverProfile);

// Propose fare for an ambulance request
router.post('/propose-fare/:id', requireAuth, proposeFare);

// Accept an ambulance request
router.patch('/accept/:id', requireAuth, acceptRequest);

// Start processing an ambulance request
router.patch('/start-processing/:id', requireAuth, startProcessing);

// Complete an ambulance request
router.patch('/complete/:id', requireAuth, completeRequest);

export default router;
