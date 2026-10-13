const User = require('../models/User');
const Booking = require('../models/Booking');

// ADMIN: GET ALL REGISTERED USERS
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Fetch booking count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingCount = await Booking.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          bookingCount,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET USER DETAILS AND USER BOOKINGS
exports.getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const bookings = await Booking.find({ user: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: TOGGLE USER STATUS (ACTIVE/INACTIVE)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `User account is now ${user.status}.`,
      status: user.status,
    });
  } catch (error) {
    next(error);
  }
};
