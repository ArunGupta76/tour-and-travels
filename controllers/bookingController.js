const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const PricingService = require('../services/pricingService');
const BookingService = require('../services/bookingService');

// USER: CALCULATE BOOKING SUMMARY (PREVIEW BEFORE BOOKING)
exports.calculateSummary = async (req, res, next) => {
  try {
    const { packageId, travellerCount, couponCode } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'Package ID is required.' });
    }

    const calc = await PricingService.calculateBookingTotal(
      packageId,
      travellerCount || 1,
      couponCode || ''
    );

    res.json({
      success: true,
      calculation: {
        packageId: calc.package._id,
        packageTitle: calc.package.title,
        pricePerPerson: calc.perPersonPrice,
        travellerCount: calc.travellerCount,
        subtotal: calc.subtotal,
        couponDiscount: calc.couponDiscount,
        totalAmount: calc.totalAmount,
        appliedCoupon: calc.appliedOffer ? calc.appliedOffer.couponCode : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// USER: CREATE NEW BOOKING
exports.createBooking = async (req, res, next) => {
  try {
    const {
      packageId,
      travelDate,
      travellerCount,
      travellers,
      contactDetails,
      couponCode,
    } = req.body;

    if (!packageId || !travelDate || !travellerCount || !contactDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details (packageId, travelDate, travellerCount, contactDetails).',
      });
    }

    // Authoritative server calculation
    const calc = await PricingService.calculateBookingTotal(
      packageId,
      travellerCount,
      couponCode || ''
    );

    const pkg = calc.package;

    // Check package availability
    if (pkg.availabilityStatus === 'Sold Out') {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this tour package is currently sold out.',
      });
    }

    const uniqueRef = await BookingService.generateUniqueRef();

    const booking = new Booking({
      bookingRef: uniqueRef,
      user: req.user._id,
      package: pkg._id,
      packageSnapshot: {
        title: pkg.title,
        destination: pkg.destination,
        category: pkg.category,
        coverImage: pkg.coverImage,
        duration: {
          days: pkg.duration.days,
          nights: pkg.duration.nights,
        },
        pricePerPerson: calc.perPersonPrice,
      },
      travelDate: new Date(travelDate),
      travellerCount: calc.travellerCount,
      travellers: Array.isArray(travellers) && travellers.length > 0 ? travellers : [
        {
          name: contactDetails.name,
          age: 30,
          gender: 'Male',
        },
      ],
      contactDetails: {
        name: contactDetails.name,
        email: contactDetails.email,
        phone: contactDetails.phone,
        city: contactDetails.city || '',
        specialRequests: contactDetails.specialRequests || '',
      },
      bookingStatus: 'Pending',
      paymentStatus: 'Unpaid',
      totalAmount: calc.totalAmount,
      amountPaid: 0,
      refundAmount: 0,
    });

    await booking.save();

    // Increment booked travellers count
    pkg.bookedTravellers = (pkg.bookedTravellers || 0) + calc.travellerCount;
    await pkg.save();

    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully! Our team will contact you shortly to confirm.',
      bookingRef: booking.bookingRef,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// USER: GET MY BOOKINGS
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('package', 'title destination coverImage duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// USER & ADMIN: GET SINGLE BOOKING DETAILS
exports.getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id).populate('user', 'name email phone');
    } else {
      booking = await Booking.findOne({ bookingRef: id.toUpperCase() }).populate('user', 'name email phone');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Security check: non-admin users can only view their own bookings
    if (!req.isAdmin && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// USER: REQUEST CANCELLATION
exports.requestCancellation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({ _id: id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
    }

    booking.cancellationRequested = true;
    booking.cancellationReason = reason || 'Cancellation requested by customer';
    await booking.save();

    res.json({
      success: true,
      message: 'Cancellation request submitted. Our team will process your refund according to the policy.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL BOOKINGS WITH SEARCH AND FILTERS
exports.adminGetAllBookings = async (req, res, next) => {
  try {
    const { search, bookingStatus, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (bookingStatus && bookingStatus !== 'all') {
      query.bookingStatus = bookingStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { bookingRef: searchRegex },
        { 'contactDetails.name': searchRegex },
        { 'contactDetails.email': searchRegex },
        { 'contactDetails.phone': searchRegex },
        { 'packageSnapshot.title': searchRegex },
        { 'packageSnapshot.destination': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE BOOKING STATUS & ADMIN NOTES
exports.adminUpdateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, adminNotes, amountPaid, refundAmount } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (amountPaid !== undefined) booking.amountPaid = Number(amountPaid);
    if (refundAmount !== undefined) booking.refundAmount = Number(refundAmount);

    // Auto update payment status if amountPaid equals totalAmount
    if (booking.amountPaid >= booking.totalAmount && booking.totalAmount > 0) {
      booking.paymentStatus = 'Paid';
    } else if (booking.amountPaid > 0 && booking.amountPaid < booking.totalAmount) {
      booking.paymentStatus = 'Partially Paid';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking record updated successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: EXPORT BOOKINGS TO CSV
exports.adminExportBookingsCSV = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    let csv = 'Booking Reference,Customer Name,Email,Phone,Package,Destination,Travel Date,Travellers,Total Amount,Amount Paid,Booking Status,Payment Status,Created At\n';

    bookings.forEach((b) => {
      const travelDateStr = b.travelDate ? new Date(b.travelDate).toISOString().split('T')[0] : '';
      const createdAtStr = b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '';
      const safePackageTitle = (b.packageSnapshot?.title || '').replace(/"/g, '""');
      const safeCustomerName = (b.contactDetails?.name || '').replace(/"/g, '""');

      csv += `"${b.bookingRef}","${safeCustomerName}","${b.contactDetails?.email}","${b.contactDetails?.phone}","${safePackageTitle}","${b.packageSnapshot?.destination}","${travelDateStr}",${b.travellerCount},${b.totalAmount},${b.amountPaid},"${b.bookingStatus}","${b.paymentStatus}","${createdAtStr}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`wanderlust-bookings-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
