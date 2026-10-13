const mongoose = require('mongoose');
const slugify = require('slugify');

const itineraryItemSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  meals: { type: String, default: 'Breakfast included' },
  accommodation: { type: String, default: '3-Star / 4-Star Hotel' },
});

const tourPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tour title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Domestic', 'International'],
      default: 'Domestic',
      index: true,
    },
    startingLocation: {
      type: String,
      required: [true, 'Starting location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    duration: {
      days: { type: Number, required: true, min: 1 },
      nights: { type: Number, required: true, min: 0 },
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price must be non-negative'],
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: [0, 'Discounted price must be non-negative'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    itinerary: {
      type: [itineraryItemSchema],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    accommodationDetails: {
      type: String,
      default: 'Premium stay in handpicked, certified luxury hotels or resorts.',
    },
    transportDetails: {
      type: String,
      default: 'AC private cab for all transfers and sightseeing as per itinerary.',
    },
    mealsInfo: {
      type: String,
      default: 'Daily buffet breakfast and dinners as specified in itinerary.',
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 7 days before departure. 50% refund between 7 to 3 days. No refund within 72 hours.',
    },
    importantInstructions: {
      type: String,
      default: 'Carry government photo ID (Aadhaar / Passport). Check-in time is standard 12:00 PM.',
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Limited', 'Sold Out'],
      default: 'Available',
    },
    maxTravellers: {
      type: Number,
      default: 20,
    },
    bookedTravellers: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving or validating
tourPackageSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }
  next();
});

module.exports = mongoose.model('TourPackage', tourPackageSchema);
