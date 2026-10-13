const Review = require('../models/Review');
const TourPackage = require('../models/TourPackage');

// PUBLIC: GET APPROVED REVIEWS
exports.getApprovedReviews = async (req, res, next) => {
  try {
    const { packageId, limit = 10 } = req.query;
    const query = { status: 'approved' };

    if (packageId) {
      query.package = packageId;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// USER: SUBMIT REVIEW
exports.submitReview = async (req, res, next) => {
  try {
    const { packageId, rating, reviewText, userLocation } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    let packageTitle = 'General Tour';
    if (packageId) {
      const pkg = await TourPackage.findById(packageId);
      if (pkg) packageTitle = pkg.title;
    }

    const review = new Review({
      user: req.user ? req.user._id : undefined,
      userName: req.user ? req.user.name : (req.body.userName || 'Verified Traveller'),
      userEmail: req.user ? req.user.email : (req.body.userEmail || ''),
      userLocation: userLocation || 'Traveller',
      package: packageId || undefined,
      packageTitle,
      rating: Number(rating),
      reviewText: reviewText.trim(),
      status: 'pending', // Requires admin approval
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review will be published after verification.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL REVIEWS
exports.adminGetAllReviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE REVIEW STATUS
exports.adminUpdateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.status = status;
    await review.save();

    res.json({
      success: true,
      message: `Review status changed to ${status}.`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: DELETE REVIEW
exports.adminDeleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
