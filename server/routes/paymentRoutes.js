import express from 'express';
import { 
  processPrescriptionPayment, 
  getPrescriptionPaymentStatus,
  getPatientPrescriptionsWithPayment 
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all prescriptions with payment info
router.get('/my-prescriptions', getPatientPrescriptionsWithPayment);

// Process payment for a prescription
router.post('/process', processPrescriptionPayment);

// Get payment status for a specific prescription
router.get('/status/:prescription_id', getPrescriptionPaymentStatus);

export default router;
