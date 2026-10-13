require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const TourPackage = require('../models/TourPackage');
const Offer = require('../models/Offer');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');
const SiteSetting = require('../models/SiteSetting');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tour_and_travels';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Admin.deleteMany({});
    await User.deleteMany({});
    await TourPackage.deleteMany({});
    await Offer.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Enquiry.deleteMany({});
    await SiteSetting.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Admin
    const admin = await Admin.create({
      name: 'System Administrator',
      email: 'admin@wanderlust.com',
      password: 'Admin@12345',
      role: 'superadmin',
      status: 'active',
    });
    console.log('[Seed] Created default admin: admin@wanderlust.com / Admin@12345');

    // 2. Create Demo User
    const user = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 98765 12345',
      password: 'User@12345',
      status: 'active',
      role: 'user',
    });
    console.log('[Seed] Created demo user: rahul@example.com / User@12345');

    // 3. Create Tour Packages
    const samplePackages = [
      {
        title: 'Manali Adventure & Solang Snow Valley Tour',
        destination: 'Manali, Himachal Pradesh',
        category: 'Domestic',
        startingLocation: 'New Delhi / Chandigarh',
        description: 'Immerse yourself in snow-capped Himalayan peaks, roaring Beas river rapids, apple orchards, and heart-pounding adventure sports in Solang Valley and Atal Tunnel.',
        coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 5, nights: 4 },
        originalPrice: 16500,
        discountedPrice: 12999,
        discountPercentage: 21,
        availableDates: [
          new Date('2026-11-15'),
          new Date('2026-11-25'),
          new Date('2026-12-05'),
          new Date('2026-12-20'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival in Manali & Local Acclimatization', description: 'Overnight Volvo from Delhi. Check-in to luxury resort, visit Hadimba Devi Temple, Vashisht Hot Springs, and evening Mall Road stroll.', meals: 'Dinner Included', accommodation: 'Apple Country Resort & Spa' },
          { day: 2, title: 'Solang Valley & Atal Tunnel Adventure', description: 'Thrilling day of paragliding, zorbing, and scenic drive through the engineering marvel of Atal Tunnel to Sissu waterfall.', meals: 'Breakfast & Dinner', accommodation: 'Apple Country Resort & Spa' },
          { day: 3, title: 'Naggar Castle & Roerich Art Gallery', description: 'Explore ancient Kullu architecture at Naggar Castle, taste traditional trout fish, and visit Jana waterfall with local herbal teas.', meals: 'Breakfast & Dinner', accommodation: 'Apple Country Resort & Spa' },
          { day: 4, title: 'Kullu River Rafting & Shopping', description: 'White-water river rafting in Kullu valley on river Beas, visit authentic Kullu shawl factories and Tibetan monastery.', meals: 'Breakfast & Dinner', accommodation: 'Apple Country Resort & Spa' },
          { day: 5, title: 'Departure with Scenic Memories', description: 'Check-out after lavish buffet breakfast. Free time for souvenir shopping before boarding comfortable evening Volvo transfer.', meals: 'Breakfast Included', accommodation: 'Overnight Journey' },
        ],
        inclusions: [
          '4 Nights stay in 4-Star Mountain View Resort',
          'Daily Buffet Breakfast and Gourmet Dinner',
          'Roundtrip Volvo Bus transfers Delhi-Manali-Delhi',
          'Private Sedan for all local sightseeing',
          'Experienced driver cum local tour guide',
          'All toll taxes, parking, and driver allowances',
        ],
        exclusions: [
          'Personal adventure activity fees (paragliding, rafting)',
          'Lunch and alcoholic beverages',
          'Anything not explicitly mentioned in inclusions',
        ],
        accommodationDetails: '4-Star Pine View Resort with heated rooms and private balconies.',
        transportDetails: 'Dedicated AC Dzire / Etios for local travel.',
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Kashmir Valley Paradise & Dal Lake Houseboat Experience',
        destination: 'Srinagar, Gulmarg & Pahalgam',
        category: 'Domestic',
        startingLocation: 'Srinagar International Airport',
        description: 'Discover heaven on earth with traditional Shikara rides on Dal Lake, snow gondola rides in Gulmarg, and lush pine meadows in Betaab Valley.',
        coverImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 6, nights: 5 },
        originalPrice: 28000,
        discountedPrice: 21999,
        discountPercentage: 21,
        availableDates: [
          new Date('2026-11-10'),
          new Date('2026-11-24'),
          new Date('2026-12-12'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival in Srinagar & Dal Lake Shikara Ride', description: 'Warm Kashmiri welcome with Kahwa. Check-in to ornate handcrafted cedar wood houseboat. Sunset Shikara ride covering floating gardens.', meals: 'Dinner Included', accommodation: 'Royal Heritage Dal Lake Houseboat' },
          { day: 2, title: 'Mughal Gardens & Old City Srinagar Heritage', description: 'Tour Nishat Bagh, Shalimar Bagh, and Shankaracharya Temple perched above Srinagar with panoramic lake views.', meals: 'Breakfast & Dinner', accommodation: 'Pine & Peaks Luxury Hotel' },
          { day: 3, title: 'Gulmarg Meadow of Flowers & Gondola Ride', description: 'Scenic drive to Gulmarg. Ride Phase 1 and Phase 2 of the world-famous Gulmarg Gondola up to Apharwat Peak at 13,780 ft.', meals: 'Breakfast & Dinner', accommodation: 'Pine & Peaks Luxury Hotel' },
          { day: 4, title: 'Pahalgam Valley of Shepherds & Saffron Fields', description: 'Travel through Pampore saffron fields and Awantipora ruins. Relax by the crystal-clear Lidder river in Pahalgam.', meals: 'Breakfast & Dinner', accommodation: 'Heevan Pahalgam Resort' },
          { day: 5, title: 'Betaab Valley, Aru & Chandanwari Tour', description: 'Explore iconic Bollywood filming destinations, dense deodar forests, and high-altitude alpine meadows.', meals: 'Breakfast & Dinner', accommodation: 'Heevan Pahalgam Resort' },
          { day: 6, title: 'Departure from Srinagar Airport', description: 'Transfer to Srinagar airport after breakfast with sweet memories of paradise on earth.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '1 Night in Luxury Handcrafted Houseboat on Dal Lake',
          '4 Nights in Premium 4-Star Hotels in Srinagar and Pahalgam',
          'Complimentary 1-hour sunset Shikara ride',
          'Daily buffet breakfast and Kashmiri dinners',
          'Private chauffeur-driven Innova for entire tour',
          'Airport transfers and all tolls',
        ],
        exclusions: [
          'Gulmarg Gondola tickets (must be booked online)',
          'Pony rides and local union cab in Pahalgam',
          'Flight tickets',
        ],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Goa Sun, Sand & Coastal Luxury Holiday',
        destination: 'Goa',
        category: 'Domestic',
        startingLocation: 'Goa Airport / Thivim Railway Station',
        description: 'Golden beaches, vibrant beach shacks, Portuguese colonial heritage churches, thrilling water sports, and sunset river luxury cruises.',
        coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 4, nights: 3 },
        originalPrice: 15000,
        discountedPrice: 11499,
        discountPercentage: 23,
        availableDates: [
          new Date('2026-11-18'),
          new Date('2026-12-02'),
          new Date('2026-12-16'),
        ],
        itinerary: [
          { day: 1, title: 'Welcome to Tropical Goa & Beach Relaxation', description: 'Private airport pick-up. Check-in to beachside resort. Sunset cocktails at Calangute and Baga beach.', meals: 'Dinner Included', accommodation: 'Radisson Blu Resort Goa' },
          { day: 2, title: 'North Goa Heritage Forts & Water Sports', description: 'Visit historic Fort Aguada, Chapora Fort (Dil Chahta Hai point), followed by parasailing and jet skiing at Anjuna.', meals: 'Breakfast & Dinner', accommodation: 'Radisson Blu Resort Goa' },
          { day: 3, title: 'South Goa Latin Quarter & Mandovi Sunset Cruise', description: 'Walk through Fontainhas Latin Quarter, visit Basilica of Bom Jesus, and embark on a DJ sunset cruise on Mandovi River.', meals: 'Breakfast & Dinner', accommodation: 'Radisson Blu Resort Goa' },
          { day: 4, title: 'Souvenir Shopping & Departure', description: 'Enjoy morning pool session, beach breakfast, and private transfer to airport.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '3 Nights in 4-Star Beachside Resort with swimming pool',
          'Daily buffet breakfast and multi-cuisine dinners',
          'AC private vehicle for transfers and sightseeing',
          'Complimentary Mandovi river cruise ticket',
        ],
        exclusions: [
          'Water sports fees',
          'Personal bar expenses',
        ],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Jaipur Royal Heritage & Pink City Palaces Tour',
        destination: 'Jaipur, Rajasthan',
        category: 'Domestic',
        startingLocation: 'Jaipur Airport / Railway Station',
        description: 'Walk in the footsteps of Rajput royalty. Grand Amber Fort, Hawa Mahal, City Palace museum, Chokhi Dhani ethnic feast, and vibrant bazaars.',
        coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1603288940300-38612d7c50a9?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 3, nights: 2 },
        originalPrice: 11000,
        discountedPrice: 8499,
        discountPercentage: 23,
        availableDates: [
          new Date('2026-11-12'),
          new Date('2026-11-28'),
          new Date('2026-12-10'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival in Pink City & Birla Mandir', description: 'Check-in to heritage haveli hotel. Evening visit to Albert Hall Museum illuminated at night and Johari Bazaar.', meals: 'Dinner Included', accommodation: 'Alsisar Haveli Heritage' },
          { day: 2, title: 'Amber Fort, Jal Mahal & Royal Palaces', description: 'Elephant/jeep ride up Amber Fort, photo stop at floating Jal Mahal, City Palace tour, and Jantar Mantar solar observatory.', meals: 'Breakfast & Dinner', accommodation: 'Alsisar Haveli Heritage' },
          { day: 3, title: 'Nahargarh Panorama & Departure', description: 'Morning panoramic view from Nahargarh fort overlooking the entire pink city. Shopping for blue pottery and departure.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '2 Nights in Heritage Haveli Hotel',
          'Daily royal buffet breakfast and dinner',
          'Private AC vehicle for full-day sightseeing',
          'English/Hindi speaking approved monument guide',
        ],
        exclusions: ['Monument entrance fees', 'Meals outside hotel'],
        isFeatured: false,
        isPublished: true,
      },
      {
        title: 'Kerala Backwaters, Munnar Tea Gardens & Alleppey Cruise',
        destination: 'Munnar & Alleppey, Kerala',
        category: 'Domestic',
        startingLocation: 'Cochin International Airport',
        description: 'God’s Own Country awaits with emerald tea plantations in Munnar, misty spice gardens, cascading Cheeyappara falls, and an overnight houseboat cruise on tranquil backwaters.',
        coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 5, nights: 4 },
        originalPrice: 24000,
        discountedPrice: 18999,
        discountPercentage: 21,
        availableDates: [
          new Date('2026-11-15'),
          new Date('2026-12-01'),
          new Date('2026-12-15'),
        ],
        itinerary: [
          { day: 1, title: 'Cochin to Misty Hills of Munnar', description: 'Scenic drive past Cheeyappara & Valara waterfalls, spice plantations, and cool mountain air.', meals: 'Dinner Included', accommodation: 'Fragrant Nature Munnar' },
          { day: 2, title: 'Munnar Tea Museum & Eravikulam National Park', description: 'Spot rare Nilgiri Tahr at Eravikulam, visit Mattupetty Dam, Echo Point, and Tata Tea Museum.', meals: 'Breakfast & Dinner', accommodation: 'Fragrant Nature Munnar' },
          { day: 3, title: 'Thekkady Periyar Wildlife Sanctuary', description: 'Drive to Thekkady. Boat safari on Periyar Lake spotting wild elephants and exotic birds, spice plantation walk.', meals: 'Breakfast & Dinner', accommodation: 'Greenwoods Resort Thekkady' },
          { day: 4, title: 'Alleppey Traditional Kettuvallam Houseboat Cruise', description: 'Board luxury private houseboat. Glide through serene palm-fringed canals with authentic Kerala Sadya meals prepared by onboard chef.', meals: 'All Meals Included', accommodation: 'Deluxe Private Backwater Houseboat' },
          { day: 5, title: 'Departure from Cochin', description: 'Disembark houseboat after breakfast, Cochin heritage walk at Fort Kochi Chinese fishing nets, transfer to airport.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '3 Nights in Premium Hill & Spice Resorts',
          '1 Night Private AC Houseboat stay with all 3 meals onboard',
          'Daily breakfast and dinners at resorts',
          'Private AC Sedan for entire tour',
          'Spice plantation guided tour',
        ],
        exclusions: ['Airfare', 'Periyar boat safari tickets'],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Rishikesh Spiritual Escape & Ganga River Rafting Expedition',
        destination: 'Rishikesh, Uttarakhand',
        category: 'Domestic',
        startingLocation: 'Dehradun Airport / Haridwar Railway Station',
        description: 'Experience holy Ganga Aarti at Triveni Ghat, thrilling Grade 3+ river rafting at Shivpuri, cliff jumping, yoga by the river, and iconic Beatles Ashram.',
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 3, nights: 2 },
        originalPrice: 9500,
        discountedPrice: 6999,
        discountPercentage: 26,
        availableDates: [
          new Date('2026-11-08'),
          new Date('2026-11-22'),
          new Date('2026-12-06'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival & Evening Triveni Ghat Ganga Aarti', description: 'Check-in to riverside luxury camp or resort. Sunset meditation and enchanting musical Ganga Aarti with floating lamps.', meals: 'Dinner Included', accommodation: 'Aloha On The Ganges / Luxury Camp' },
          { day: 2, title: '16KM White-Water Rafting & Cliff Jump', description: 'Adrenaline-packed 16 km rafting from Shivpuri down to Ram Jhula covering rapids like Roller Coaster and Golf Course. Visit Beatles Ashram.', meals: 'Breakfast & Dinner', accommodation: 'Aloha On The Ganges / Luxury Camp' },
          { day: 3, title: 'Neer Garh Waterfall Hike & Departure', description: 'Early morning hike to turquoise Neer Garh waterfall, cafes at Lakshman Jhula, and departure.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '2 Nights in Luxury Riverside Resort / Swiss Camps',
          '16KM Ganga White-Water Rafting with certified instructors',
          'All safety gear (life jackets, helmets, dry bags)',
          'Daily breakfast and bonfire dinners',
        ],
        exclusions: ['Bungee jumping fees at Jumpin Heights', 'Personal expenses'],
        isFeatured: false,
        isPublished: true,
      },
      {
        title: 'Dubai International Luxury Extravaganza & Desert Safari',
        destination: 'Dubai & Abu Dhabi, UAE',
        category: 'International',
        startingLocation: 'Dubai International Airport',
        description: 'The ultimate futuristic experience: Burj Khalifa 124th floor observation deck, thrilling 4x4 Red Dunes desert safari with BBQ dinner, Dubai Marina yacht cruise, and Abu Dhabi Sheikh Zayed Grand Mosque.',
        coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 6, nights: 5 },
        originalPrice: 65000,
        discountedPrice: 48999,
        discountPercentage: 25,
        availableDates: [
          new Date('2026-11-20'),
          new Date('2026-12-05'),
          new Date('2026-12-25'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival in Dubai & Luxury Marina Dhow Cruise', description: 'VIP airport transfer. Check-in to 5-star hotel. Evening luxury Marina glass boat cruise with 5-star international buffet and live Tanoura dance show.', meals: 'Dinner Included', accommodation: 'Grand Millennium Hotel Dubai' },
          { day: 2, title: 'Dubai Half-Day City Tour & Burj Khalifa At The Top', description: 'Explore Dubai Frame, Palm Jumeirah, Burj Al Arab photo stop. In the evening, ascend to the 124th floor of Burj Khalifa followed by the Dubai Mall musical fountain show.', meals: 'Breakfast & Dinner', accommodation: 'Grand Millennium Hotel Dubai' },
          { day: 3, title: 'Thrilling Red Dune Desert Safari & Bedouin Camp', description: 'Afternoon dune bashing in Land Cruiser, sandboarding, camel rides, falconry, fire show, belly dance, and Arabian BBQ banquet.', meals: 'Breakfast & BBQ Dinner', accommodation: 'Grand Millennium Hotel Dubai' },
          { day: 4, title: 'Full Day Abu Dhabi Tour & Sheikh Zayed Grand Mosque', description: 'Visit the majestic Sheikh Zayed Grand Mosque, Emirates Palace, Ferrari World photo stop, and Yas Island.', meals: 'Breakfast & Dinner', accommodation: 'Grand Millennium Hotel Dubai' },
          { day: 5, title: 'Museum of the Future & Gold Souk Shopping', description: 'Visit the architectural marvel Museum of the Future and spend the evening hunting bargains in Deira Gold & Spice Souks.', meals: 'Breakfast & Dinner', accommodation: 'Grand Millennium Hotel Dubai' },
          { day: 6, title: 'Free Morning for Shopping & Departure', description: 'Buffet breakfast, last minute luxury shopping at Mall of the Emirates, and transfer to Dubai Airport.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '5 Nights in 5-Star Central Dubai Hotel with pool',
          'Daily international breakfast and gourmet dinners',
          'Burj Khalifa 124th Floor entrance ticket',
          'Red Dune Desert Safari with 4x4 transfers and BBQ dinner',
          'Full-day Abu Dhabi city tour with Grand Mosque entrance',
          'Marina Dhow Cruise with dinner',
          'All airport transfers and UAE tourism dirham fees',
        ],
        exclusions: ['UAE Tourist Visa fees', 'Return International Flight tickets'],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Thailand Tropical Island Escape: Bangkok & Phuket',
        destination: 'Phuket & Bangkok, Thailand',
        category: 'International',
        startingLocation: 'Bangkok Suvarnabhumi Airport / Phuket Airport',
        description: 'Exotic Thailand getaway featuring speed boat cruise to Phi Phi Islands, Maya Bay, Wat Arun Temple of Dawn, bustling night markets, and world-class Thai hospitality.',
        coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000&auto=format&fit=crop',
        ],
        duration: { days: 6, nights: 5 },
        originalPrice: 48000,
        discountedPrice: 36999,
        discountPercentage: 23,
        availableDates: [
          new Date('2026-11-18'),
          new Date('2026-12-08'),
          new Date('2026-12-22'),
        ],
        itinerary: [
          { day: 1, title: 'Arrival in Phuket & Patong Beach Nightlife', description: 'Sawasdee welcome at Phuket airport. Check-in to Patong resort. Stroll along vibrant Bangla Road night market.', meals: 'Dinner Included', accommodation: 'Fishermen’s Harbour Urban Resort Phuket' },
          { day: 2, title: 'Phi Phi Islands & Maya Bay Speedboat Tour', description: 'Full day island tour on high-speed catamaran. Snorkeling at Coral Bay, visit Maya Bay (The Beach movie set), and buffet lunch on Phi Phi Don.', meals: 'Breakfast & Island Lunch', accommodation: 'Fishermen’s Harbour Urban Resort Phuket' },
          { day: 3, title: 'Phuket Big Buddha & Old Town Heritage', description: 'Visit giant Big Buddha statue with 360-degree views, Wat Chalong, and charming Sino-Portuguese cafes in Old Phuket Town.', meals: 'Breakfast & Dinner', accommodation: 'Fishermen’s Harbour Urban Resort Phuket' },
          { day: 4, title: 'Fly to Bangkok & Chao Phraya River Cruise', description: 'Domestic flight to Bangkok. Check-in to riverside hotel. Luxury evening buffet cruise on the Chao Phraya river past lit-up temples.', meals: 'Breakfast & Cruise Dinner', accommodation: 'Amari Watergate Hotel Bangkok' },
          { day: 5, title: 'Wat Pho Reclining Buddha & Bangkok Shopping', description: 'Visit Wat Pho, Wat Arun Temple of Dawn, and endless shopping at Platinum Fashion Mall and CentralWorld.', meals: 'Breakfast & Dinner', accommodation: 'Amari Watergate Hotel Bangkok' },
          { day: 6, title: 'Departure from Bangkok', description: 'Check-out after breakfast and private transfer to Bangkok Suvarnabhumi Airport.', meals: 'Breakfast Included', accommodation: 'Departure' },
        ],
        inclusions: [
          '3 Nights in Phuket 4-Star Resort + 2 Nights in Bangkok 4-Star Hotel',
          'Phi Phi Islands full day tour by speedboat with snorkeling gear and lunch',
          'Chao Phraya Princess luxury dinner cruise ticket',
          'Bangkok city temple tour with transfers',
          'All inter-city airport transfers in private AC vehicle',
        ],
        exclusions: ['National Park fees (THB 400)', 'International flight tickets'],
        isFeatured: true,
        isPublished: true,
      },
    ];

    const slugify = require('slugify');
    const insertedPackages = [];
    for (const pkg of samplePackages) {
      pkg.slug = `${slugify(pkg.title, { lower: true, strict: true })}-${Math.random().toString(36).substring(2, 7)}`;
      const created = await TourPackage.create(pkg);
      insertedPackages.push(created);
    }
    console.log(`[Seed] Seeded ${insertedPackages.length} Tour Packages successfully.`);

    // 4. Create Special Offers
    const sampleOffers = [
      {
        title: 'Festive Holiday Extravaganza',
        description: 'Get flat 20% discount on all domestic packages booked for the upcoming travel season. Limited time promotional coupon!',
        bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
        applicablePackages: [insertedPackages[0]._id, insertedPackages[1]._id, insertedPackages[2]._id],
        discountType: 'percentage',
        discountValue: 20,
        couponCode: 'FESTIVE20',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        isFeatured: true,
        termsAndConditions: 'Valid on bookings with at least 2 travellers. Non-combinable with other codes.',
      },
      {
        title: 'Dubai Luxury Getaway Super Saver',
        description: 'Save flat ₹5,000 on Dubai International Luxury Extravaganza with 5-star hotel stay and desert safari included.',
        bannerImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop',
        applicablePackages: [insertedPackages[6]._id],
        discountType: 'fixed',
        discountValue: 5000,
        couponCode: 'DUBAI5000',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        isFeatured: true,
        termsAndConditions: 'Valid for bookings departing between Nov 2026 and Feb 2027.',
      },
      {
        title: 'Early Bird Island Escape',
        description: 'Enjoy 15% instant discount on Phuket & Bangkok Thailand Tropical Island packages when booked 15 days in advance.',
        bannerImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop',
        applicablePackages: [insertedPackages[7]._id],
        discountType: 'percentage',
        discountValue: 15,
        couponCode: 'ISLAND15',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        isFeatured: true,
        termsAndConditions: 'Applies to confirmed international flight bookings.',
      },
    ];

    await Offer.insertMany(sampleOffers);
    console.log('[Seed] Seeded 3 Special Offers.');

    // 5. Create Sample Bookings
    const booking1 = await Booking.create({
      bookingRef: 'WL-2026-MNL01',
      user: user._id,
      package: insertedPackages[0]._id,
      packageSnapshot: {
        title: insertedPackages[0].title,
        destination: insertedPackages[0].destination,
        category: insertedPackages[0].category,
        coverImage: insertedPackages[0].coverImage,
        duration: insertedPackages[0].duration,
        pricePerPerson: insertedPackages[0].discountedPrice,
      },
      travelDate: new Date('2026-11-25'),
      travellerCount: 2,
      travellers: [
        { name: 'Rahul Sharma', age: 32, gender: 'Male' },
        { name: 'Pooja Sharma', age: 30, gender: 'Female' },
      ],
      contactDetails: {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 98765 12345',
        city: 'Delhi',
        specialRequests: 'Prefer mountain facing top floor room.',
      },
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      totalAmount: 25998,
      amountPaid: 25998,
      refundAmount: 0,
      adminNotes: 'Advance payment received via UPI. Volvo seats confirmed in Row 4.',
    });

    // Record payment for booking1
    await Payment.create({
      booking: booking1._id,
      amount: 25998,
      paymentMethod: 'UPI',
      paymentReference: 'UPI-REF-9923841120',
      paymentStatus: 'Completed',
      recordedBy: 'Admin Verification',
      notes: 'Full amount received in HDFC Current A/c.',
    });

    const booking2 = await Booking.create({
      bookingRef: 'WL-2026-KSH02',
      user: user._id,
      package: insertedPackages[1]._id,
      packageSnapshot: {
        title: insertedPackages[1].title,
        destination: insertedPackages[1].destination,
        category: insertedPackages[1].category,
        coverImage: insertedPackages[1].coverImage,
        duration: insertedPackages[1].duration,
        pricePerPerson: insertedPackages[1].discountedPrice,
      },
      travelDate: new Date('2026-12-12'),
      travellerCount: 2,
      travellers: [
        { name: 'Rahul Sharma', age: 32, gender: 'Male' },
        { name: 'Pooja Sharma', age: 30, gender: 'Female' },
      ],
      contactDetails: {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 98765 12345',
        city: 'Delhi',
      },
      bookingStatus: 'Pending',
      paymentStatus: 'Unpaid',
      totalAmount: 43998,
      amountPaid: 0,
      refundAmount: 0,
      adminNotes: 'Customer requested inquiry regarding Gondola tickets.',
    });

    console.log('[Seed] Seeded 2 sample bookings with payment records.');

    // 6. Create Reviews
    const sampleReviews = [
      {
        userName: 'Aarav Mehta',
        userEmail: 'aarav@gmail.com',
        userLocation: 'Mumbai',
        package: insertedPackages[0]._id,
        packageTitle: insertedPackages[0].title,
        rating: 5,
        reviewText: 'Our Manali trip was extraordinary! The vehicle was brand new, the resort had breathtaking views of snowy peaks, and the guide made sure we experienced Solang Valley without long queues. 10/10 service!',
        status: 'approved',
      },
      {
        userName: 'Sneha Patel',
        userEmail: 'sneha@yahoo.com',
        userLocation: 'Ahmedabad',
        package: insertedPackages[1]._id,
        packageTitle: insertedPackages[1].title,
        rating: 5,
        reviewText: 'Staying in the Dal Lake houseboat was like living inside a postcard. The traditional Wazwan feast was delicious and Kashmir truly stole our hearts. Thank you Wanderlust!',
        status: 'approved',
      },
      {
        userName: 'Vikram Singhania',
        userEmail: 'vikram@outlook.com',
        userLocation: 'Bangalore',
        package: insertedPackages[6]._id,
        packageTitle: insertedPackages[6].title,
        rating: 5,
        reviewText: 'The Dubai Desert Safari and Burj Khalifa VIP tickets were seamlessly arranged. We received all vouchers on time and their 24/7 WhatsApp concierge was super responsive.',
        status: 'approved',
      },
    ];
    await Review.insertMany(sampleReviews);
    console.log('[Seed] Seeded 3 customer reviews.');

    // 7. Create Enquiries
    const sampleEnquiries = [
      {
        name: 'Priyanka Sen',
        email: 'priyanka@gmail.com',
        phone: '+91 98220 54321',
        subject: 'Custom Family Package for Kerala in December',
        message: 'Hello, we are a family of 6 travelling together. Can we customize the Kerala package to add one extra night in Kovalam beach?',
        status: 'In Progress',
        adminNotes: 'Sent custom itinerary quotation via email.',
      },
      {
        name: 'Anand Verma',
        email: 'anand.verma@techcorp.com',
        phone: '+91 97110 99887',
        subject: 'Corporate Team Outing to Rishikesh',
        message: 'Looking for a 30-person corporate offsite in Rishikesh with camping, river rafting, and team bonding activities.',
        status: 'New',
        adminNotes: '',
      },
    ];
    await Enquiry.insertMany(sampleEnquiries);
    console.log('[Seed] Seeded customer enquiries.');

    // 8. Create Site Settings
    await SiteSetting.create({
      companyName: 'Wanderlust Tours & Travels',
      logoUrl: '/images/logo.png',
      tagline: 'Discover the World, Craft Unforgettable Memories',
      phone: '+91 98765 43210',
      whatsappNumber: '919876543210',
      email: 'contact@wanderlusttravels.com',
      address: 'Suite 402, Horizon Tower, MG Road, Bengaluru, Karnataka, India - 560001',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9855848245595!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin',
      heroHeadline: 'Explore Premium Handcrafted Journeys Around The Globe',
      heroSubtitle: 'Curated luxury tours, unforgettable experiences, transparent pricing, and 24/7 dedicated travel concierge.',
      heroBannerUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1920&auto=format&fit=crop',
      heroCtaText: 'Explore Packages',
      promoBannerText: '🎉 Festive Season Special: Enjoy up to 35% OFF on select Domestic & International Tour Packages!',
      aboutIntro: 'At Wanderlust Tours & Travels, we turn dream getaways into effortless, cherished memories. With over 15 years of industry excellence, we curate luxury group departures, bespoke family vacations, and exhilarating adventure escapes.',
      aboutStory: 'Founded by passionate explorers in 2011, Wanderlust was built on a simple promise: travel should be enriching, transparent, and seamlessly orchestrated from the moment you book until you return home.',
      aboutMission: 'To empower travellers worldwide with reliable, authentic, and unforgettable travel experiences backed by transparent pricing and dedicated local destination experts.',
      aboutVision: 'To become the leading tech-enabled sustainable travel partner known for customer delight, safety, and sustainable tourism.',
      footerText: '© 2026 Wanderlust Tours & Travels Pvt. Ltd. All Rights Reserved. Crafted with passion & excellence.',
    });
    console.log('[Seed] Seeded default SiteSettings.');

    console.log('====================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log(' Admin: admin@wanderlust.com / Admin@12345');
    console.log(' User:  rahul@example.com   / User@12345');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
