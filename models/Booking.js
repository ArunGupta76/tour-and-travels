const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourPackage',
      required: true,
    },
    // Snapshot of package at time of booking to preserve history
    packageSnapshot: {
      title: { type: String, required: true },
      destination: { type: String, required: true },
      category: { type: String, default: 'Domestic' },
      coverImage: { type: String },
      duration: {
        days: { type: Number },
        nights: { type: Number },
      },
      pricePerPerson: { type: Number, required: true },
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    travellerCount: {
      type: Number,
      required: [true, 'Traveller count is required'],
      min: [1, 'Must have at least 1 traveller'],
    },
    travellers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
        idProof: { type: String, default: '' },
      },
    ],
    contactDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, default: '' },
      specialRequests: { type: String, default: '' },
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Refunded'],
      default: 'Unpaid',
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancellationRequested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
