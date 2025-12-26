import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  medicines: [{
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    dosage: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: ''
    },
    timing: {
      morning: {
        type: Number,
        default: 0
      },
      noon: {
        type: Number,
        default: 0
      },
      night: {
        type: Number,
        default: 0
      }
    }
  }],
  tests: [{
    test_name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    test_report: {
      type: String,
      default: ''
    },
    report_date: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['suggested', 'completed', 'pending'],
      default: 'suggested'
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  payment_amount: {
    type: Number,
    default: 500  // Default consultation fee
  },
  payment_date: {
    type: Date,
    default: null
  },
  payment_method: {
    type: String,
    enum: ['cash', 'card', 'mobile_banking', 'dummy'],
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);
