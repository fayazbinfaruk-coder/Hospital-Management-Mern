// server/controllers/ambulanceController.js
import AmbulanceCall from '../models/AmbulanceCall.js';

export const requestAmbulance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pickup_location, pickup_lat, pickup_lng } = req.body;

    if (!pickup_location || typeof pickup_location !== 'string') {
      return res.status(400).json({ message: 'Pickup location is required as a string' });
    }

    const newCall = new AmbulanceCall({
      patient_id: userId,
      pickup_location,
      pickup_lat: pickup_lat ? parseFloat(pickup_lat) : undefined,
      pickup_lng: pickup_lng ? parseFloat(pickup_lng) : undefined,
      status: 'requested'
    });

    await newCall.save();
    res.status(201).json({ message: 'Ambulance requested successfully.' });
  } catch (error) {
    console.error('Ambulance request error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// NEW: Get ambulance requests made by the logged-in patient
export const getMyAmbulanceRequests = async (req, res) => {
  try {
    const patientId = req.user._id;

    const requests = await AmbulanceCall.find({ patient_id: patientId })
      .populate('fare_proposals.driver_id', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Fetch ambulance requests error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const acceptFareProposal = async (req, res) => {
  try {
    const { driverId } = req.body;
    const call = await AmbulanceCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Request not found' });
    if (call.patient_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this request' });
    }
    if (call.status !== 'requested') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }

    const proposal = call.fare_proposals.find(p => p.driver_id.toString() === driverId);
    if (!proposal) {
      return res.status(404).json({ message: 'Fare proposal not found' });
    }

    call.driver_id = driverId;
    call.status = 'accepted';
    await call.save();

    res.status(200).json({ message: 'Fare proposal accepted, driver assigned' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
