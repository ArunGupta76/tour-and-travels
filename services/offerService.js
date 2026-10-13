const Offer = require('../models/Offer');

class OfferService {
  /**
   * Retrieves all currently active and valid offers
   */
  static async getActiveOffers() {
    const now = new Date();
    return await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('applicablePackages', 'title slug destination coverImage originalPrice discountedPrice')
      .sort({ createdAt: -1 });
  }

  /**
   * Check if a specific offer is valid right now
   */
  static isOfferValid(offer) {
    if (!offer || !offer.isActive) return false;
    const now = new Date();
    return offer.startDate <= now && offer.endDate >= now;
  }
}

module.exports = OfferService;
