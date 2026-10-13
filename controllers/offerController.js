const Offer = require('../models/Offer');
const OfferService = require('../services/offerService');

// PUBLIC: GET ACTIVE OFFERS
exports.getActiveOffers = async (req, res, next) => {
  try {
    const offers = await OfferService.getActiveOffers();
    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL OFFERS
exports.adminGetAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find()
      .populate('applicablePackages', 'title destination coverImage originalPrice discountedPrice')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: CREATE OFFER
exports.createOffer = async (req, res, next) => {
  try {
    const {
      title,
      description,
      bannerImage,
      applicablePackages,
      discountType,
      discountValue,
      couponCode,
      startDate,
      endDate,
      isActive,
      isFeatured,
      termsAndConditions,
    } = req.body;

    if (!title || !description || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, discountValue, startDate, endDate).',
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    const offer = new Offer({
      title: title.trim(),
      description: description.trim(),
      bannerImage: bannerImage || '',
      applicablePackages: Array.isArray(applicablePackages) ? applicablePackages : (applicablePackages ? [applicablePackages] : []),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      termsAndConditions: termsAndConditions || undefined,
    });

    await offer.save();

    res.status(201).json({
      success: true,
      message: 'Offer created successfully!',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE OFFER
exports.updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const data = req.body;
    if (data.title) offer.title = data.title.trim();
    if (data.description) offer.description = data.description.trim();
    if (data.bannerImage !== undefined) offer.bannerImage = data.bannerImage;
    if (data.applicablePackages !== undefined) {
      offer.applicablePackages = Array.isArray(data.applicablePackages)
        ? data.applicablePackages
        : (data.applicablePackages ? [data.applicablePackages] : []);
    }
    if (data.discountType) offer.discountType = data.discountType;
    if (data.discountValue !== undefined) offer.discountValue = Number(data.discountValue);
    if (data.couponCode !== undefined) offer.couponCode = data.couponCode ? data.couponCode.trim().toUpperCase() : '';
    if (data.startDate) offer.startDate = new Date(data.startDate);
    if (data.endDate) offer.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) offer.isActive = Boolean(data.isActive);
    if (data.isFeatured !== undefined) offer.isFeatured = Boolean(data.isFeatured);
    if (data.termsAndConditions) offer.termsAndConditions = data.termsAndConditions;

    await offer.save();

    res.json({
      success: true,
      message: 'Offer updated successfully!',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: DELETE OFFER
exports.deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    res.json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: TOGGLE OFFER ACTIVE STATUS
exports.toggleOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      success: true,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully!`,
      isActive: offer.isActive,
    });
  } catch (error) {
    next(error);
  }
};
