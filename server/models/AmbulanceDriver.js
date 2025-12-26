// models/AmbulanceDriver.js
import mongoose from 'mongoose';

const ambulanceDriverSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed_requests: { type: Number, default: 0 },
  vehicle_no: { type: String },
  vehicle_type: { type: String },
  license_number: { type: String },
  fare_per_km: { type: Number, default: 0 },
  is_available: { type: Boolean, default: true },
  current_lat: { type: Number },
  current_lng: { type: Number }
});

const AmbulanceDriver = mongoose.model('AmbulanceDriver', ambulanceDriverSchema);
export default AmbulanceDriver;
