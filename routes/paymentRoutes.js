const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

router.post('/admin/record', authenticate, authorizeAdmin, paymentController.recordPayment);
router.get('/booking/:bookingId', authenticate, paymentController.getPaymentsByBooking);

module.exports = router;
