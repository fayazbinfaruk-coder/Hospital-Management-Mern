import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  available_slots: [{
    date: String,
    time: String
  }]
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
