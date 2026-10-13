const TourPackage = require('../models/TourPackage');
const PricingService = require('../services/pricingService');
const slugify = require('slugify');

// PUBLIC: GET ALL PUBLISHED PACKAGES WITH ADVANCED FILTERS
exports.getAllPackages = async (req, res, next) => {
  try {
    const {
      search,
      destination,
      category,
      minPrice,
      maxPrice,
      duration,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { destination: searchRegex },
        { startingLocation: searchRegex },
        { description: searchRegex },
      ];
    }

    if (destination && destination.trim()) {
      query.destination = new RegExp(destination.trim(), 'i');
    }

    if (category && (category === 'Domestic' || category === 'International')) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }

    if (duration) {
      const days = parseInt(duration, 10);
      if (!isNaN(days)) {
        if (days >= 10) {
          query['duration.days'] = { $gte: 10 };
        } else {
          query['duration.days'] = days;
        }
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { discountedPrice: 1 };
    else if (sort === 'price-desc') sortOption = { discountedPrice: -1 };
    else if (sort === 'duration-asc') sortOption = { 'duration.days': 1 };
    else if (sort === 'duration-desc') sortOption = { 'duration.days': -1 };
    else if (sort === 'popular') sortOption = { bookedTravellers: -1, isFeatured: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const total = await TourPackage.countDocuments(query);
    const packages = await TourPackage.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: packages.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

// PUBLIC: GET FEATURED PACKAGES
exports.getFeaturedPackages = async (req, res, next) => {
  try {
    const packages = await TourPackage.find({ isPublished: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

// PUBLIC: GET POPULAR DESTINATIONS
exports.getDestinations = async (req, res, next) => {
  try {
    const domestic = await TourPackage.distinct('destination', { category: 'Domestic', isPublished: true });
    const international = await TourPackage.distinct('destination', { category: 'International', isPublished: true });

    res.json({
      success: true,
      domestic,
      international,
    });
  } catch (error) {
    next(error);
  }
};

// PUBLIC: GET SINGLE PACKAGE BY ID OR SLUG
exports.getPackageBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let pkg = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      pkg = await TourPackage.findById(identifier);
    } else {
      pkg = await TourPackage.findOne({ slug: identifier });
    }

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Tour package not found.' });
    }

    res.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: GET ALL PACKAGES (INCLUDING UNPUBLISHED)
exports.adminGetAllPackages = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { destination: searchRegex }];
    }

    if (category) {
      query.category = category;
    }

    if (status === 'published') query.isPublished = true;
    if (status === 'unpublished') query.isPublished = false;

    const packages = await TourPackage.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: CREATE NEW PACKAGE
exports.createPackage = async (req, res, next) => {
  try {
    const {
      title,
      destination,
      category,
      startingLocation,
      description,
      coverImage,
      images,
      durationDays,
      durationNights,
      originalPrice,
      discountPercentage,
      discountedPrice,
      availableDates,
      itinerary,
      inclusions,
      exclusions,
      accommodationDetails,
      transportDetails,
      mealsInfo,
      cancellationPolicy,
      importantInstructions,
      availabilityStatus,
      maxTravellers,
      isPublished,
      isFeatured,
    } = req.body;

    if (!title || !destination || !startingLocation || !description || !coverImage || !originalPrice || !durationDays) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (title, destination, startingLocation, description, coverImage, originalPrice, durationDays).',
      });
    }

    const priceCalc = PricingService.calculatePackagePrice(
      originalPrice,
      discountPercentage,
      discountedPrice
    );

    let parsedItinerary = [];
    if (typeof itinerary === 'string') {
      try { parsedItinerary = JSON.parse(itinerary); } catch (e) { parsedItinerary = []; }
    } else if (Array.isArray(itinerary)) {
      parsedItinerary = itinerary;
    }

    let parsedInclusions = Array.isArray(inclusions) ? inclusions : (typeof inclusions === 'string' ? inclusions.split('\n').filter(Boolean) : []);
    let parsedExclusions = Array.isArray(exclusions) ? exclusions : (typeof exclusions === 'string' ? exclusions.split('\n').filter(Boolean) : []);
    let parsedImages = Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').map(s => s.trim()).filter(Boolean) : []);

    const newPackage = new TourPackage({
      title: title.trim(),
      destination: destination.trim(),
      category: category || 'Domestic',
      startingLocation: startingLocation.trim(),
      description,
      coverImage,
      images: parsedImages,
      duration: {
        days: Number(durationDays),
        nights: Number(durationNights || Number(durationDays) - 1),
      },
      originalPrice: priceCalc.originalPrice,
      discountedPrice: priceCalc.discountedPrice,
      discountPercentage: priceCalc.discountPercentage,
      availableDates: Array.isArray(availableDates) ? availableDates : [],
      itinerary: parsedItinerary,
      inclusions: parsedInclusions,
      exclusions: parsedExclusions,
      accommodationDetails: accommodationDetails || undefined,
      transportDetails: transportDetails || undefined,
      mealsInfo: mealsInfo || undefined,
      cancellationPolicy: cancellationPolicy || undefined,
      importantInstructions: importantInstructions || undefined,
      availabilityStatus: availabilityStatus || 'Available',
      maxTravellers: Number(maxTravellers) || 20,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
    });

    await newPackage.save();

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully!',
      package: newPackage,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE PACKAGE
exports.updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await TourPackage.findById(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Tour package not found.' });
    }

    const data = req.body;

    if (data.originalPrice !== undefined || data.discountPercentage !== undefined || data.discountedPrice !== undefined) {
      const orig = data.originalPrice !== undefined ? data.originalPrice : pkg.originalPrice;
      const pct = data.discountPercentage !== undefined ? data.discountPercentage : pkg.discountPercentage;
      const customDisc = data.discountedPrice !== undefined ? data.discountedPrice : null;
      const priceCalc = PricingService.calculatePackagePrice(orig, pct, customDisc);
      pkg.originalPrice = priceCalc.originalPrice;
      pkg.discountedPrice = priceCalc.discountedPrice;
      pkg.discountPercentage = priceCalc.discountPercentage;
    }

    if (data.title) {
      pkg.title = data.title.trim();
      pkg.slug = `${slugify(pkg.title, { lower: true, strict: true })}-${pkg._id.toString().slice(-4)}`;
    }
    if (data.destination) pkg.destination = data.destination.trim();
    if (data.category) pkg.category = data.category;
    if (data.startingLocation) pkg.startingLocation = data.startingLocation.trim();
    if (data.description) pkg.description = data.description;
    if (data.coverImage) pkg.coverImage = data.coverImage;
    if (data.images) {
      pkg.images = Array.isArray(data.images) ? data.images : data.images.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (data.durationDays) pkg.duration.days = Number(data.durationDays);
    if (data.durationNights !== undefined) pkg.duration.nights = Number(data.durationNights);
    if (data.itinerary) {
      pkg.itinerary = typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary;
    }
    if (data.inclusions) {
      pkg.inclusions = Array.isArray(data.inclusions) ? data.inclusions : data.inclusions.split('\n').filter(Boolean);
    }
    if (data.exclusions) {
      pkg.exclusions = Array.isArray(data.exclusions) ? data.exclusions : data.exclusions.split('\n').filter(Boolean);
    }
    if (data.accommodationDetails) pkg.accommodationDetails = data.accommodationDetails;
    if (data.transportDetails) pkg.transportDetails = data.transportDetails;
    if (data.mealsInfo) pkg.mealsInfo = data.mealsInfo;
    if (data.cancellationPolicy) pkg.cancellationPolicy = data.cancellationPolicy;
    if (data.importantInstructions) pkg.importantInstructions = data.importantInstructions;
    if (data.availabilityStatus) pkg.availabilityStatus = data.availabilityStatus;
    if (data.maxTravellers) pkg.maxTravellers = Number(data.maxTravellers);
    if (data.isPublished !== undefined) pkg.isPublished = Boolean(data.isPublished);
    if (data.isFeatured !== undefined) pkg.isFeatured = Boolean(data.isFeatured);
    if (data.availableDates) {
      pkg.availableDates = Array.isArray(data.availableDates) ? data.availableDates : [];
    }

    await pkg.save();

    res.json({
      success: true,
      message: 'Tour package updated successfully!',
      package: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: DELETE PACKAGE
exports.deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await TourPackage.findById(id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    // Notice: Historical bookings preserve snapshot data even when package is deleted
    await TourPackage.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Package deleted successfully. Historical bookings remain safely preserved.',
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: TOGGLE PUBLISHED STATUS
exports.togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await TourPackage.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    pkg.isPublished = !pkg.isPublished;
    await pkg.save();

    res.json({
      success: true,
      message: `Package ${pkg.isPublished ? 'published' : 'unpublished'} successfully!`,
      isPublished: pkg.isPublished,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: TOGGLE FEATURED STATUS
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await TourPackage.findById(id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    pkg.isFeatured = !pkg.isFeatured;
    await pkg.save();

    res.json({
      success: true,
      message: `Package featured status updated to ${pkg.isFeatured ? 'Featured' : 'Standard'}.`,
      isFeatured: pkg.isFeatured,
    });
  } catch (error) {
    next(error);
  }
};
