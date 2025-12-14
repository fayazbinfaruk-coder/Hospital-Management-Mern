// server/controllers/doctorController.js
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

export const getDoctorDashboard = async (req, res) => {
  try {
    if (!req.user.is_verified) {
      return res.status(403).json({ message: 'Access denied. Your account is not yet verified by an admin.' });
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const appointments = await Appointment.find({ doctor_id: doctor._id })
      .populate('patient_id', 'name') 
      .sort({ date: 1, time: 1 });

    const formattedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      patient_name: appt.patient_id.name,
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
