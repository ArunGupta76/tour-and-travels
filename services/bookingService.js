const Booking = require('../models/Booking');

class BookingService {
  /**
   * Generates a unique booking reference code e.g. WL-2026-X9K27
   */
  static async generateUniqueRef() {
    const year = new Date().getFullYear();
    let isUnique = false;
    let ref = '';

    while (!isUnique) {
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      ref = `WL-${year}-${randomStr}`;
      const existing = await Booking.findOne({ bookingRef: ref });
      if (!existing) {
        isUnique = true;
      }
    }
    return ref;
  }
}

module.exports = BookingService;
