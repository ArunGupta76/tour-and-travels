const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    applicablePackages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TourPackage',
      },
    ],
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    termsAndConditions: {
      type: String,
      default: 'Limited time promotional offer. Applicable on selected departure dates only.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
