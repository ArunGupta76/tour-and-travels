const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Wanderlust Tours & Travels',
    },
    logoUrl: {
      type: String,
      default: '/images/logo.png',
    },
    tagline: {
      type: String,
      default: 'Discover the World, Craft Unforgettable Journeys',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    whatsappNumber: {
      type: String,
      default: '919876543210',
    },
    email: {
      type: String,
      default: 'contact@wanderlusttravels.com',
    },
    address: {
      type: String,
      default: 'Suite 402, Horizon Tower, MG Road, Bengaluru, Karnataka, India - 560001',
    },
    googleMapsEmbedUrl: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9855848245595!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin',
    },
    heroHeadline: {
      type: String,
      default: 'Explore Premium Handcrafted Journeys Around The Globe',
    },
    heroSubtitle: {
      type: String,
      default: 'Curated luxury tours, unforgettable experiences, seamless bookings, and 24/7 dedicated travel concierge.',
    },
    heroBannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1920&auto=format&fit=crop',
    },
    heroCtaText: {
      type: String,
      default: 'Explore Packages',
    },
    promoBannerText: {
      type: String,
      default: '🎉 Special Festive Season Offer: Up to 35% OFF on select International & Domestic Packages!',
    },
    aboutIntro: {
      type: String,
      default: 'At Wanderlust Tours & Travels, we turn dream getaways into effortless, cherished memories. With over 15 years of industry excellence, we offer luxury group departures, bespoke family vacations, and exhilarating adventure escapes.',
    },
    aboutStory: {
      type: String,
      default: 'Founded by passionate explorers in 2011, Wanderlust was built on a simple promise: travel should be enriching, transparent, and seamlessly orchestrated from the moment you book until you return home.',
    },
    aboutMission: {
      type: String,
      default: 'To empower travellers worldwide with reliable, authentic, and unforgettable travel experiences backed by transparent pricing and dedicated local destination experts.',
    },
    aboutVision: {
      type: String,
      default: 'To become the leading tech-enabled sustainable travel partner known for customer delight, safety, and sustainable tourism.',
    },
    whyChooseUs: [
      {
        icon: { type: String, default: 'fa-gem' },
        title: { type: String, default: 'Handcrafted Itineraries' },
        description: { type: String, default: 'Customized itineraries designed by local travel specialists.' },
      },
      {
        icon: { type: String, default: 'fa-shield-halved' },
        title: { type: String, default: '100% Safe & Verified' },
        description: { type: String, default: 'Certified hotels, vetted chauffeurs, and 24/7 emergency support.' },
      },
      {
        icon: { type: String, default: 'fa-hand-holding-dollar' },
        title: { type: String, default: 'Best Price Guarantee' },
        description: { type: String, default: 'Transparent pricing with no hidden charges and flexible payment plans.' },
      },
      {
        icon: { type: String, default: 'fa-headset' },
        title: { type: String, default: '24/7 Concierge Support' },
        description: { type: String, default: 'Dedicated travel manager available before, during, and after your trip.' },
      },
    ],
    faqs: [
      {
        question: { type: String, default: 'How do I book a tour package?' },
        answer: { type: String, default: 'Simply browse our packages, select your preferred travel date and traveller count, fill in passenger details, and submit the booking request. Our team will verify availability and assist you with confirmation.' },
      },
      {
        question: { type: String, default: 'What payment methods do you accept?' },
        answer: { type: String, default: 'We accept UPI, Net Banking, Credit/Debit Cards, Bank Transfers, and Cheque payments with instant digital receipts.' },
      },
      {
        question: { type: String, default: 'What is the package cancellation policy?' },
        answer: { type: String, default: 'Cancellations made 7+ days prior to travel receive up to 90% refund. Cancellations 3 to 7 days prior receive a 50% refund. Please check each tour package details for custom policies.' },
      },
      {
        question: { type: String, default: 'Are flights included in the package price?' },
        answer: { type: String, default: 'Certain international tours include return economy flights, while domestic packages typically start from arrival airports/stations. Check the specific package Inclusions tab for details.' },
      },
    ],
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      instagram: { type: String, default: 'https://instagram.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      youtube: { type: String, default: 'https://youtube.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
    },
    policies: {
      cancellation: {
        type: String,
        default: 'Cancellations requested 15 days before departure incur a 10% fee. 7-14 days incur a 25% fee. 3-6 days incur 50% fee. Within 72 hours, bookings are non-refundable.',
      },
      booking: {
        type: String,
        default: 'A booking request is held for 48 hours awaiting payment confirmation. Final travel vouchers are issued once full payment is cleared.',
      },
      terms: {
        type: String,
        default: 'All travellers must possess valid identity proofs. Itineraries are subject to weather conditions and local regulatory guidelines.',
      },
      privacy: {
        type: String,
        default: 'Your personal data is encrypted and securely stored. We never sell your personal information to third parties.',
      },
    },
    footerText: {
      type: String,
      default: '© 2026 Wanderlust Tours & Travels Pvt. Ltd. All Rights Reserved. Crafted with excellence.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
