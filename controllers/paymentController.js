const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// ADMIN: RECORD MANUAL PAYMENT
exports.recordPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod, paymentReference, notes } = req.body;

    if (!bookingId || !amount || !paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, amount, and payment reference/transaction ID are required.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const payment = new Payment({
      booking: booking._id,
      amount: paymentAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentReference: paymentReference.trim(),
      paymentStatus: 'Completed',
      recordedBy: req.user.name || 'Admin',
      notes: notes || '',
    });

    await payment.save();

    // Update booking amount paid
    booking.amountPaid = (booking.amountPaid || 0) + paymentAmount;
    if (booking.amountPaid >= booking.totalAmount) {
      booking.paymentStatus = 'Paid';
    } else if (booking.amountPaid > 0) {
      booking.paymentStatus = 'Partially Paid';
    }
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment,
      updatedBooking: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN & USER: GET PAYMENTS FOR BOOKING
exports.getPaymentsByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const payments = await Payment.find({ booking: bookingId }).sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};
