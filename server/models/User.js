import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  phone: String,
  location: String,
  blood_type: String,

  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient', 'donor', 'ambulance_driver'],
    required: true
  },

  // Role-specific fields
  is_verified: { type: Boolean, default: false },           // manually verified for doctors, donors, drivers
  // is_active_donor: { type: Boolean, default: false },       // donor status toggle
  // is_active_driver: { type: Boolean, default: false },      // driver status toggle

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
