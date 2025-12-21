// server/controllers/appointmentController.js
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Get all unique specialties from doctors
export const getSpecialties = async (req, res) => {
  try {
    const doctors = await Doctor.find({ specialization: { $ne: null, $ne: '' } }).distinct('specialization');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get doctors by specialty with their user info
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const doctors = await Doctor.find({ specialization: specialty }).populate('user_id', 'name location phone');
    
    const formattedDoctors = doctors.map(doc => ({
      _id: doc._id,
      name: doc.user_id.name,
      location: doc.user_id.location,
      phone: doc.user_id.phone,
      specialization: doc.specialization
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get available slots for a doctor (only slots that aren't fully booked)
export const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get date 7 days from now
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    // Filter slots to only show those within next 7 days and with less than 4 bookings
    const availableSlots = doctor.available_slots.filter(slot => {
      const slotDate = new Date(slot.date);
      const bookedCount = slot.booked_count || 0;
      return slotDate >= today && slotDate <= maxDate && bookedCount < 4;
    }).map(slot => ({
      date: slot.date,
      time: slot.time,
      available_spots: 4 - (slot.booked_count || 0)
    }));

    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get available slots for a specific doctor on a specific date
export const getDoctorSlotsByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Filter slots for the specific date with less than 4 bookings
    const availableSlots = doctor.available_slots.filter(slot => {
      const bookedCount = slot.booked_count || 0;
      return slot.date === date && bookedCount < 4;
    }).map(slot => ({
      date: slot.date,
      time: slot.time,
      available_spots: 4 - (slot.booked_count || 0)
    }));

    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, date, time } = req.body;

    if (!doctor_id || !date || !time) {
      return res.status(400).json({ message: 'Doctor, date, and time are required.' });
    }

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Find the slot
    const slotIndex = doctor.available_slots.findIndex(
      slot => slot.date === date && slot.time === time
    );

    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    const slot = doctor.available_slots[slotIndex];
    const bookedCount = slot.booked_count || 0;

    if (bookedCount >= 4) {
      return res.status(400).json({ message: 'This slot is fully booked.' });
    }

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patient_id: req.user._id,
      doctor_id,
      date,
      time,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an appointment at this time with this doctor.' });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      doctor_id,
      patient_id: req.user._id,
      date,
      time,
      status: 'booked'
    });

    // Increment the booked count for this slot
    doctor.available_slots[slotIndex].booked_count = bookedCount + 1;
    await doctor.save();

    res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get patient's appointments
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.user._id })
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'name phone location' }
      })
      .sort({ date: 1, time: 1 });

    const formattedAppointments = appointments.map(appt => ({
      _id: appt._id,
      doctor_name: appt.doctor_id.user_id.name,
      doctor_phone: appt.doctor_id.user_id.phone,
      doctor_location: appt.doctor_id.user_id.location,
      specialization: appt.doctor_id.specialization,
      date: appt.date,
      time: appt.time,
      status: appt.status
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (appointment.patient_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled.' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    // Decrement the booked count for this slot
    const doctor = await Doctor.findById(appointment.doctor_id);
    if (doctor) {
      const slotIndex = doctor.available_slots.findIndex(
        slot => slot.date === appointment.date && slot.time === appointment.time
      );

      if (slotIndex !== -1 && doctor.available_slots[slotIndex].booked_count > 0) {
        doctor.available_slots[slotIndex].booked_count -= 1;
        await doctor.save();
      }
    }

    res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
