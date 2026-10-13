const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Credit/Debit Card', 'Cash', 'Net Banking', 'Cheque'],
      default: 'UPI',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentReference: {
      type: String,
      required: [true, 'Transaction/Reference number is required'],
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    recordedBy: {
      type: String,
      default: 'Admin Manual Entry',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
