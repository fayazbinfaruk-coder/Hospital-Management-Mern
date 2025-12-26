// server/routes/ambulanceRoutes.js
import express from 'express';
import {
  requestAmbulance,
  getMyAmbulanceRequests,
  acceptFareProposal
} from '../controllers/ambulanceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patient requests an ambulance
router.post('/request', requireAuth, requestAmbulance);

// Patient fetches their own ambulance request status
router.get('/my-requests', requireAuth, getMyAmbulanceRequests);

// Patient accepts a fare proposal
router.post('/accept-fare/:id', requireAuth, acceptFareProposal);

export default router;
