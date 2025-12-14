// server/routes/doctorRoutes.js
import express from 'express';
import {
  getDoctorDashboard,
  addAvailableSlot,
  updateSpecialization,
  deleteSlot  
} from '../controllers/doctorController.js';
import { requireAuth, requireVerified } from '../middleware/authMiddleware.js'; // assuming the folder is 'middlewares'

const router = express.Router();

// Dashboard view (doctor info + appointments)
router.get('/dashboard', requireAuth, requireVerified, getDoctorDashboard);

// Add available slots (date + time)
router.post('/slots', requireAuth, requireVerified, addAvailableSlot);

// Update specialization
router.put('/specialization', requireAuth, requireVerified, updateSpecialization);

// DELETE /api/doctor/slots
router.delete('/slots', requireAuth, requireVerified, deleteSlot);


export default router;
