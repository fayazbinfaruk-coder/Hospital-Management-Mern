// server/models/BloodRequest.js
import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Request (required fields)
    blood_type: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    units: { type: Number, required: true, min: 1 },
    needed_by: { type: Date, required: true },

    note: { type: String, trim: true },

    // Snapshot of patient info for donors (so UI always has data even if profile is incomplete)
    patient_snapshot: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, default: '' },
      age: { type: Number, min: 0 },
      gender: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },

    status: {
      type: String,
      enum: ['requested', 'accepted', 'completed'],
      default: 'requested',
      index: true,
    },

    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    requested_at: { type: Date, default: Date.now },
    accepted_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
