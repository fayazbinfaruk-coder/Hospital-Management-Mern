// server/controllers/doctorController.js
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';

export const getDoctorDashboard = async (req, res) => {
  try {
    if (!req.user.is_verified) {
      return res.status(403).json({ message: 'Access denied. Your account is not yet verified by an admin.' });
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const appointments = await Appointment.find({ 
      doctor_id: doctor._id,
      status: { $nin: ['cancelled'] }
    })
      .populate('patient_id', 'name phone email') 
      .sort({ date: 1, time: 1 });

    const formattedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      patient_name: appt.patient_id.name,
      patient_phone: appt.patient_id.phone,
      patient_email: appt.patient_id.email,
      patient_id: appt.patient_id._id,
      date: appt.date,
      time: appt.time,
      status: appt.status
    }));

    res.status(200).json({
      doctor: {
        id: doctor._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        location: req.user.location,
        is_verified: req.user.is_verified,
        specialization: doctor.specialization || '',
        available_slots: doctor.available_slots || []
      },
      appointments: formattedAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const addAvailableSlot = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required.' });
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }


    const slotExists = doctor.available_slots.some(
      (slot) => slot.date === date && slot.time === time
    );
    if (slotExists) {
      return res.status(400).json({ message: 'This slot already exists.' });
    }

    doctor.available_slots.push({ date, time });
    await doctor.save();

    res.status(200).json({ message: 'Slot added.', available_slots: doctor.available_slots });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const updateSpecialization = async (req, res) => {
  try {
    const { specialization } = req.body;
    if (!specialization) {
      return res.status(400).json({ message: 'Specialization is required.' });
    }

    let doctor = await Doctor.findOne({ user_id: req.user._id });


    if (!doctor) {
      doctor = new Doctor({
        user_id: req.user._id,
        specialization,
        available_slots: []
      });
    } else {
      doctor.specialization = specialization;
    }

    await doctor.save();

    res.status(200).json({ message: 'Specialization updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


export const deleteSlot = async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ message: 'Date and time required.' });

  const doctor = await Doctor.findOne({ user_id: req.user._id });
  doctor.available_slots = doctor.available_slots.filter(
    (slot) => !(slot.date === date && slot.time === time)
  );
  await doctor.save();

  res.status(200).json({ message: 'Slot removed.', available_slots: doctor.available_slots });
};

// @desc    Create prescription for a patient
// @route   POST /api/doctor/prescribe
// @access  Private (Doctor)
export const createPrescription = async (req, res) => {
  try {
    const { appointment_id, notes, medicines } = req.body;

    if (!appointment_id || !medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Appointment ID and at least one medicine are required.' });
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Verify doctor owns this appointment
    if (appointment.doctor_id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to prescribe for this appointment.' });
    }

    // Create prescription
    const prescription = new Prescription({
      appointment_id,
      doctor_id: doctor._id,
      patient_id: appointment.patient_id,
      notes: notes || '',
      medicines: medicines.map(med => ({
        medicine_id: med.medicine_id,
        dosage: med.dosage || '',
        duration: med.duration || '',
        timing: {
          morning: med.timing?.morning || 0,
          noon: med.timing?.noon || 0,
          night: med.timing?.night || 0
        }
      }))
    });

    await prescription.save();

    // Update appointment status to 'treated' and link prescription
    appointment.status = 'treated';
    appointment.prescription_id = prescription._id;
    await appointment.save();

    res.status(201).json({ 
      success: true,
      message: 'Prescription created successfully.',
      prescription 
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all treated patients for a doctor
// @route   GET /api/doctor/treated-patients
// @access  Private (Doctor)
export const getTreatedPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    // Find all treated appointments for this doctor
    const treatedAppointments = await Appointment.find({ 
      doctor_id: doctor._id,
      status: 'treated'
    })
      .populate('patient_id', 'name phone email')
      .populate({
        path: 'prescription_id',
        populate: {
          path: 'medicines.medicine_id',
          select: 'drugName manufacturer dosage'
        }
      })
      .sort({ date: -1, time: -1 });

    // Group appointments by patient
    const patientMap = new Map();

    treatedAppointments.forEach(appt => {
      const patientId = appt.patient_id._id.toString();
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient_id: appt.patient_id._id,
          patient_name: appt.patient_id.name,
          patient_phone: appt.patient_id.phone,
          patient_email: appt.patient_id.email,
          total_visits: 0,
          appointments: []
        });
      }

      const patient = patientMap.get(patientId);
      patient.total_visits += 1;
      patient.appointments.push({
        _id: appt._id,
        date: appt.date,
        time: appt.time,
        status: appt.status,
        prescription: appt.prescription_id
      });
    });

    const treatedPatients = Array.from(patientMap.values());

    res.status(200).json({
      success: true,
      count: treatedPatients.length,
      patients: treatedPatients
    });
  } catch (error) {
    console.error('Error fetching treated patients:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get patient treatment history
// @route   GET /api/doctor/patient-history/:patientId
// @access  Private (Doctor)
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const appointments = await Appointment.find({
      doctor_id: doctor._id,
      patient_id: patientId,
      status: 'treated'
    })
      .populate('patient_id', 'name phone email')
      .populate({
        path: 'prescription_id',
        populate: {
          path: 'medicines.medicine_id',
          select: 'drugName manufacturer category consumeType description'
        }
      })
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
