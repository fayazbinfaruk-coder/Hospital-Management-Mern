// server/routes/appointmentRoutes.js
import express from 'express';
import {
  getSpecialties,
  getDoctorsBySpecialty,
  getDoctorSlots,
  getDoctorSlotsByDate,
  bookAppointment,
  getMyAppointments,
  cancelAppointment
} from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/appointment/specialties
router.get('/specialties', requireAuth, getSpecialties);

// @route   GET /api/appointment/doctors/:specialty
router.get('/doctors/:specialty', requireAuth, getDoctorsBySpecialty);

// @route   GET /api/appointment/doctor/:doctorId/slots
router.get('/doctor/:doctorId/slots', requireAuth, getDoctorSlots);

// @route   GET /api/appointment/doctor/:doctorId/slots/:date
router.get('/doctor/:doctorId/slots/:date', requireAuth, getDoctorSlotsByDate);

// @route   POST /api/appointment/book
router.post('/book', requireAuth, bookAppointment);

// @route   GET /api/appointment/my
router.get('/my', requireAuth, getMyAppointments);

// @route   PUT /api/appointment/:appointmentId/cancel
router.put('/:appointmentId/cancel', requireAuth, cancelAppointment);

export default router;
