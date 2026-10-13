const TourPackage = require('../models/TourPackage');
const Offer = require('../models/Offer');

class PricingService {
  /**
   * Calculates pricing details for a package
   * @param {number} originalPrice
   * @param {number} discountPercentage
   * @param {number} customDiscountedPrice
   */
  static calculatePackagePrice(originalPrice, discountPercentage = 0, customDiscountedPrice = null) {
    const orig = Number(originalPrice) || 0;
    let discPct = Number(discountPercentage) || 0;
    let discPrice = orig;

    if (customDiscountedPrice !== null && customDiscountedPrice !== undefined && Number(customDiscountedPrice) > 0) {
      discPrice = Math.min(orig, Number(customDiscountedPrice));
      discPct = orig > 0 ? Math.round(((orig - discPrice) / orig) * 100) : 0;
    } else if (discPct > 0) {
      discPct = Math.min(100, Math.max(0, discPct));
      discPrice = Math.round(orig * (1 - discPct / 100));
    }

    return {
      originalPrice: orig,
      discountedPrice: discPrice,
      discountPercentage: discPct,
    };
  }

  /**
   * Authoritative calculation of booking total on the server
   * @param {string} packageId
   * @param {number} travellerCount
   * @param {string} couponCode
   */
  static async calculateBookingTotal(packageId, travellerCount, couponCode = '') {
    const pkg = await TourPackage.findById(packageId);
    if (!pkg) {
      throw new Error('Specified tour package does not exist.');
    }

    const travellers = Math.max(1, parseInt(travellerCount, 10) || 1);
    let perPersonPrice = pkg.discountedPrice || pkg.originalPrice;
    let subtotal = perPersonPrice * travellers;
    let couponDiscount = 0;
    let appliedOffer = null;

    if (couponCode && couponCode.trim()) {
      const now = new Date();
      const offer = await Offer.findOne({
        couponCode: couponCode.trim().toUpperCase(),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      if (offer) {
        // Check if package is eligible
        const isEligible =
          !offer.applicablePackages ||
          offer.applicablePackages.length === 0 ||
          offer.applicablePackages.some((p) => p.toString() === packageId.toString());

        if (isEligible) {
          if (offer.discountType === 'percentage') {
            couponDiscount = Math.round((subtotal * offer.discountValue) / 100);
          } else {
            couponDiscount = offer.discountValue;
          }
          appliedOffer = offer;
        }
      }
    }

    couponDiscount = Math.min(subtotal, Math.max(0, couponDiscount));
    const totalAmount = Math.max(0, subtotal - couponDiscount);

    return {
      package: pkg,
      travellerCount: travellers,
      perPersonPrice,
      subtotal,
      couponDiscount,
      totalAmount,
      appliedOffer,
    };
  }
}

module.exports = PricingService;
