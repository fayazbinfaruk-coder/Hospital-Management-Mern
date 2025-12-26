// models/AmbulanceCall.js
import mongoose from 'mongoose';

const ambulanceCallSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned only when accepted
  pickup_location: { type: String, required: true },
  pickup_lat: { type: Number },
  pickup_lng: { type: Number },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'processing', 'completed', 'cancelled'],
    default: 'requested'
  },
  fare_proposals: [{
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fare: { type: Number, required: true },
    proposed_at: { type: Date, default: Date.now }
  }],
  requested_at: { type: Date, default: Date.now }
}, { timestamps: true });

const AmbulanceCall = mongoose.model('AmbulanceCall', ambulanceCallSchema);
export default AmbulanceCall;
