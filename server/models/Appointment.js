import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['booked', 'completed', 'cancelled', 'treated'], 
    default: 'booked' 
  },
  prescription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
