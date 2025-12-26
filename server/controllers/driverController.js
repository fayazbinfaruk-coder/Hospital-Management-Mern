// server/controllers/driverController.js
import User from '../models/User.js';
import AmbulanceCall from '../models/AmbulanceCall.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';

export const getDriverDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }
    // Find or create driver profile
    let driverProfile = await AmbulanceDriver.findOne({ user_id: req.user._id });
    if (!driverProfile) {
      driverProfile = await AmbulanceDriver.create({ user_id: req.user._id });
    }

    // Get all available requests (unassigned)
    const pendingRequests = await AmbulanceCall.find({ status: 'requested' })
      .populate('patient_id', 'name location');

    // Get accepted, processing, or completed requests assigned to this driver
    const assignedRequests = await AmbulanceCall.find({
      driver_id: req.user._id,
      status: { $in: ['accepted', 'processing', 'completed'] }
    }).populate('patient_id', 'name location');

    res.status(200).json({
      message: `Welcome, ${req.user.name}`,
      completed_requests: driverProfile.completed_requests,
      pending_requests: pendingRequests,
      assigned_requests: assignedRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }
    const call = await AmbulanceCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Request not found' });
    if (call.status !== 'requested') {
      return res.status(400).json({ message: 'This request has already been accepted' });
    }

    call.status = 'accepted';
    call.driver_id = req.user._id;
    await call.save();

    res.status(200).json({ message: 'Request accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const proposeFare = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }
    const { fare } = req.body;
    const call = await AmbulanceCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Request not found' });
    if (call.status !== 'requested') {
      return res.status(400).json({ message: 'Can only propose fare for pending requests' });
    }

    // Check if driver already proposed
    const existingProposal = call.fare_proposals.find(p => p.driver_id.toString() === req.user._id.toString());
    if (existingProposal) {
      return res.status(400).json({ message: 'You have already proposed a fare for this request' });
    }

    call.fare_proposals.push({
      driver_id: req.user._id,
      fare: parseFloat(fare)
    });
    await call.save();

    res.status(200).json({ message: 'Fare proposed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const startProcessing = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }
    const call = await AmbulanceCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Request not found' });
    if (call.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this request' });
    }
    if (call.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted first' });
    }

    call.status = 'processing';
    await call.save();

    res.status(200).json({ message: 'Request marked as processing' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const completeRequest = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }
    const call = await AmbulanceCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Request not found' });
    if (call.driver_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this request' });
    }

    call.status = 'completed';
    await call.save();

    const driver = await AmbulanceDriver.findOne({ user_id: req.user._id });
    if (driver) {
      driver.completed_requests += 1;
      await driver.save();
    }

    res.status(200).json({ message: 'Request marked as completed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const getDriverProfile = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }

    const driverProfile = await AmbulanceDriver.findOne({ user_id: req.user._id }).populate('user_id', 'name email phone location');
    if (!driverProfile) return res.status(404).json({ message: 'Driver profile not found' });

    res.status(200).json({ driver: driverProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const updateDriverProfile = async (req, res) => {
  try {
    if (req.user.role !== 'ambulance_driver') {
      return res.status(403).json({ message: 'Forbidden: Ambulance drivers only' });
    }

    const {
      vehicle_no,
      vehicle_type,
      license_number,
      fare_per_km,
      is_available,
      current_lat,
      current_lng
    } = req.body;

    let driverProfile = await AmbulanceDriver.findOne({ user_id: req.user._id });
    if (!driverProfile) {
      driverProfile = new AmbulanceDriver({ user_id: req.user._id });
    }

    if (typeof vehicle_no !== 'undefined') driverProfile.vehicle_no = vehicle_no;
    if (typeof vehicle_type !== 'undefined') driverProfile.vehicle_type = vehicle_type;
    if (typeof license_number !== 'undefined') driverProfile.license_number = license_number;
    if (typeof fare_per_km !== 'undefined') driverProfile.fare_per_km = parseFloat(fare_per_km) || 0;
    if (typeof is_available !== 'undefined') driverProfile.is_available = !!is_available;
    if (typeof current_lat !== 'undefined') driverProfile.current_lat = parseFloat(current_lat);
    if (typeof current_lng !== 'undefined') driverProfile.current_lng = parseFloat(current_lng);

    await driverProfile.save();

    res.status(200).json({ message: 'Driver profile updated', driver: driverProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
