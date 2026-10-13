const Enquiry = require('../models/Enquiry');

// PUBLIC: SUBMIT CONTACT ENQUIRY
exports.submitEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, phone, subject, message).',
      });
    }

    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'New',
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our travel concierge will get in touch with you shortly.',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL ENQUIRIES
exports.adminGetAllEnquiries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE ENQUIRY STATUS & NOTES
exports.adminUpdateEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    if (status) enquiry.status = status;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;

    await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: DELETE ENQUIRY
exports.adminDeleteEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
