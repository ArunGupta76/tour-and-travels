const TourPackage = require('../models/TourPackage');
const Offer = require('../models/Offer');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Enquiry = require('../models/Enquiry');

// GET ADMIN DASHBOARD ANALYTICS & STATS
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Package metrics
    const totalPackages = await TourPackage.countDocuments();
    const publishedPackages = await TourPackage.countDocuments({ isPublished: true });
    const domesticPackages = await TourPackage.countDocuments({ category: 'Domestic' });
    const internationalPackages = await TourPackage.countDocuments({ category: 'International' });

    // Active offers
    const activeOffers = await Offer.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Registered users
    const totalUsers = await User.countDocuments();

    // Bookings breakdown
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'Cancelled' });
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'Completed' });

    // Confirmed booking value (sum of totalAmount for Confirmed and Completed)
    const confirmedValueAgg = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const confirmedBookingValue = confirmedValueAgg.length > 0 ? confirmedValueAgg[0].total : 0;

    // Actual payments received (sum of completed payments from Payment model or amountPaid from bookings)
    const receivedRevenueAgg = await Payment.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const actualPaymentsReceived = receivedRevenueAgg.length > 0 ? receivedRevenueAgg[0].total : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 customer enquiries
    const recentEnquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly booking analytics (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStatsAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          bookingsCount: { $sum: 1 },
          confirmedRevenue: {
            $sum: {
              $cond: [
                { $in: ['$bookingStatus', ['Confirmed', 'Completed']] },
                '$totalAmount',
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyLabels = [];
    const monthlyBookings = [];
    const monthlyRevenues = [];

    // Build timeline for 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y}`;
      monthlyLabels.push(label);

      const found = monthlyStatsAgg.find((item) => item._id.year === y && item._id.month === m);
      if (found) {
        monthlyBookings.push(found.bookingsCount);
        monthlyRevenues.push(found.confirmedRevenue);
      } else {
        monthlyBookings.push(0);
        monthlyRevenues.push(0);
      }
    }

    res.json({
      success: true,
      stats: {
        totalPackages,
        publishedPackages,
        domesticPackages,
        internationalPackages,
        activeOffers,
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        confirmedBookingValue,
        actualPaymentsReceived,
      },
      recentBookings,
      recentEnquiries,
      charts: {
        monthlyLabels,
        monthlyBookings,
        monthlyRevenues,
        categoryDistribution: [domesticPackages, internationalPackages],
      },
    });
  } catch (error) {
    next(error);
  }
};
