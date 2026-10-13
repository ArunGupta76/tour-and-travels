const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// User actions
router.post('/calculate-summary', bookingController.calculateSummary);
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.get('/:id', authenticate, bookingController.getBookingDetails);
router.post('/:id/cancel', authenticate, bookingController.requestCancellation);

// Admin actions
router.get('/admin/all', authenticate, authorizeAdmin, bookingController.adminGetAllBookings);
router.get('/admin/export-csv', authenticate, authorizeAdmin, bookingController.adminExportBookingsCSV);
router.put('/admin/:id/status', authenticate, authorizeAdmin, bookingController.adminUpdateBookingStatus);

module.exports = router;
