// server/controllers/bloodRequestController.js
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import BloodDonor from '../models/BloodDonor.js';

// @desc Create a blood request
// @route POST /api/blood/request
export const createBloodRequest = async (req, res) => {
  try {
    const patient_id = req.user._id;

    const {
      blood_type,
      location,
      hospital,
      units,
      needed_by,
      note,
      patient_snapshot,

      // fallback inputs (only used if user profile is missing them)
      patient_name,
      patient_phone,
      patient_email,
      patient_age,
      patient_gender,
      patient_address,
    } = req.body;

    // required request fields
    const missing = [];
    if (!blood_type) missing.push('blood_type');
    if (!location) missing.push('location');
    if (!hospital) missing.push('hospital');
    if (!units) missing.push('units');
    if (!needed_by) missing.push('needed_by');

    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const patient = await User.findById(patient_id).select(
      'name phone email age gender address'
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Build snapshot (profile first, then fallback inputs)
const snapIn = patient_snapshot || {};

const snapshot = {
  name: snapIn.name || patient.name || patient_name || '',
  phone: snapIn.phone || patient.phone || patient_phone || '',
  email: snapIn.email || patient.email || patient_email || '',
  age: (snapIn.age ?? patient.age) ?? patient_age,
  gender: snapIn.gender || patient.gender || patient_gender || '',
  address: snapIn.address || patient.address || patient_address || '',
};

    // make sure required snapshot fields exist
    const missingPatient = [];
    if (!snapshot.name) missingPatient.push('patient_name');
    if (!snapshot.phone) missingPatient.push('patient_phone');

    if (missingPatient.length) {
      return res.status(400).json({
        message:
          `Missing patient fields (profile is empty): ${missingPatient.join(', ')}. ` +
          `Please provide them in request body.`,
      });
    }

    const request = await BloodRequest.create({
      patient_id,
      blood_type,
      location,
      hospital,
      units,
      needed_by,
      note: note || '',
      patient_snapshot: snapshot,
    });

    const populated = await BloodRequest.findById(request._id)
      .populate('patient_id', 'name phone email age gender address')
      .populate('donor_id', 'name phone');

    return res.status(201).json({ message: 'Blood request created.', request: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc Get all pending requests for available donors
// @route GET /api/blood/requests
// @desc Get all pending requests for available donors
// @route GET /api/blood/requests
export const getPendingRequests = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user_id: req.user._id });
    if (!donor || !donor.available) {
      return res.status(403).json({ message: 'You must be available to view requests.' });
    }

    const requests = await BloodRequest.find({
      $or: [{ status: 'requested' }, { status: 'accepted', donor_id: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('patient_id', 'name phone email age gender address')
      .populate('donor_id', 'name phone');

    const enriched = requests.map((r) => {
      const obj = r.toObject();

      // Prefer snapshot (entered at request time) then fallback to populated user
      const pSnap = obj.patient_snapshot || {};
      const pUser = obj.patient_id || {};

      const patient = {
        name: pSnap.name || pUser.name || 'Unknown',
        phone: pSnap.phone || pUser.phone || 'N/A',
        email: pSnap.email || pUser.email || '',
        age: (pSnap.age ?? pUser.age) ?? '',
        gender: pSnap.gender || pUser.gender || '',
        address: pSnap.address || pUser.address || '',
      };

      return {
        ...obj,
        patient, // <--- use this in UI
        current_user_id: req.user._id,
      };
    });

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


// @desc Donor accepts a blood request
// @route PATCH /api/blood/accept/:id
export const acceptBloodRequest = async (req, res) => {
  try {
    const donor_id = req.user._id;
    const requestId = req.params.id;

    const donorProfile = await BloodDonor.findOne({ user_id: donor_id });
    if (!donorProfile || !donorProfile.available) {
      return res.status(403).json({ message: 'You must be available to accept requests.' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found.' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({ message: 'This request has already been accepted.' });
    }

    request.status = 'accepted';
    request.donor_id = donor_id;
    request.accepted_at = new Date();
    await request.save();

    const today = new Date().toISOString().split('T')[0];
    donorProfile.donation_history.push(today);
    await donorProfile.save();

    const populated = await BloodRequest.findById(requestId)
      .populate('patient_id', 'name phone email age gender address')
      .populate('donor_id', 'name phone');

    return res.status(200).json({ message: 'Request accepted.', request: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc Get all requests for logged-in patient
// @route GET /api/blood/my-requests
export const getMyRequests = async (req, res) => {
  try {
    const patient_id = req.user._id;

    const requests = await BloodRequest.find({ patient_id })
      .sort({ createdAt: -1 })
      .populate('donor_id', 'name phone email blood_type location gender address');


const formatted = requests.map((r) => ({
  id: r._id,
  blood_type: r.blood_type,
  location: r.location,
  hospital: r.hospital,
  units: r.units,
  needed_by: r.needed_by,
  note: r.note,
  status: r.status,
  requested_at: r.requested_at,
  accepted_at: r.accepted_at,
  completed_at: r.completed_at,
  createdAt: r.createdAt,

  donor: r.donor_id
    ? {
        id: r.donor_id._id,
        name: r.donor_id.name,
        phone: r.donor_id.phone,
        email: r.donor_id.email,
        blood_type: r.donor_id.blood_type,
        location: r.donor_id.location,
        gender: r.donor_id.gender,
        address: r.donor_id.address,
      }
    : null,
}));


    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc Mark a blood request as completed (donor only)
// @route PATCH /api/blood/complete/:id
export const completeDonation = async (req, res) => {
  try {
    const donor_id = req.user._id;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found.' });
    }

    if (!request.donor_id || request.donor_id.toString() !== donor_id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this request.' });
    }

    request.status = 'completed';
    request.completed_at = new Date();
    await request.save();

    const populated = await BloodRequest.findById(request._id)
      .populate('patient_id', 'name phone email age gender address')
      .populate('donor_id', 'name phone');

    return res.status(200).json({ message: 'Donation marked as completed.', request: populated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
