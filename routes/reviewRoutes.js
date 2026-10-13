const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Public
router.get('/', reviewController.getApprovedReviews);

// User submission (authenticated or guest with details)
router.post('/', (req, res, next) => {
  if (req.headers.authorization || req.headers['x-auth-token']) {
    return authenticate(req, res, next);
  }
  next();
}, reviewController.submitReview);

// Admin
router.get('/admin/all', authenticate, authorizeAdmin, reviewController.adminGetAllReviews);
router.patch('/admin/:id/status', authenticate, authorizeAdmin, reviewController.adminUpdateReviewStatus);
router.delete('/admin/:id', authenticate, authorizeAdmin, reviewController.adminDeleteReview);

module.exports = router;
