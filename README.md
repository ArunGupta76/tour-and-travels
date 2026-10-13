# Wanderlust Tours & Travels - Management & Online Booking Website

A complete, modern, premium, and fully functional Tour & Travels Management and Online Booking web application built with Node.js, Express.js, MongoDB, Mongoose, and Vanilla JavaScript/CSS with Bootstrap 5.

---

## 🌟 Architecture Overview

The system features two completely isolated interfaces sharing a single authoritative MongoDB database:

1. **Public User Website** (`/public`)
   - **Home Page** (`index.html`): Hero banner, dynamic destination search, featured packages, category showcases, active offers, Why Choose Us, traveller testimonials, FAQs, floating WhatsApp concierge.
   - **Tour Packages Listing** (`packages.html`): Live search, filter by Domestic/International, price sliders, duration selectors, sorting by price/popularity/duration, pagination.
   - **Tour Details & Booking** (`package-details.html`): High-resolution interactive image gallery, full day-by-day itinerary timeline, inclusions & exclusions checklist, stay & transport info, authoritative live booking modal with passenger collection and coupon discount validation.
   - **Special Offers** (`offers.html`): Active seasonal deals, discount badges, eligible package links, one-click coupon copying.
   - **About Us** (`about.html`): Company journey, mission & vision, verified traveller statistics.
   - **Contact Us** (`contact.html`): Interactive enquiry submission saving directly to MongoDB, Google Maps embed, WhatsApp chat.
   - **Authentication** (`login.html`, `register.html`): Secure JWT authentication, bcryptjs password hashing, rate limiting.
   - **User Dashboard & Bookings** (`my-bookings.html`): Booking history, reference numbers, printable/PDF official tax receipts and travel vouchers, policy-based cancellation requests.
   - **User Profile** (`profile.html`): Update personal details and secure password changes.

2. **Secure Admin Panel** (`/admin`)
   - **Admin Login** (`admin/login.html`): Secure administrative login with rate limiting and show/hide password toggle.
   - **Dashboard Analytics** (`admin/dashboard.html`): Live KPI cards, distinction between confirmed booking value and actual received payments, Chart.js monthly trends and category distributions, recent orders and enquiries.
   - **Package Management** (`admin/packages.html` & `admin/package-form.html`): Full CRUD, Multer image upload, interactive day-by-day itinerary builder, pricing calculator, publish toggle, featured toggle, deletion with historical booking safety.
   - **Special Offers CRUD** (`admin/offers.html`): Configure percentage or flat discounts, coupon codes, validity dates, eligible package restrictions.
   - **Booking Management** (`admin/bookings.html`): Order tracking, status transitions (Pending, Confirmed, Cancelled, Completed), manual payment recording with transaction references, CSV export.
   - **Customer Management** (`admin/users.html`): Customer account activation/deactivation, booking history inspection.
   - **Customer Enquiries** (`admin/enquiries.html`): Process contact inquiries, update status, add internal notes.
   - **Review Moderation** (`admin/reviews.html`): Moderate customer reviews (Approve/Reject) before public display.
   - **Live Content Management** (`admin/content.html`): Edit website name, hero banner, headlines, FAQs repeater, about text, policies without modifying source code.
   - **System Settings** (`admin/settings.html`): Update contact numbers, WhatsApp, office address, social links, admin master password.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **File Uploads**: Multer with file type & size limits
- **Analytics & Charts**: Chart.js
- **Styling**: Vanilla CSS3 custom design tokens + Bootstrap 5.3 + Font Awesome 6
- **Environment**: dotenv

---

## 🚀 Getting Started on Windows (VS Code)

### Prerequisites
1. **Node.js** (v18 or higher): Download from [nodejs.org](https://nodejs.org/)
2. **MongoDB Community Server**: Download and install locally or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### Installation Steps

1. **Open the project folder in VS Code / PowerShell**:
   ```powershell
   cd "c:\Users\garun\OneDrive\Desktop\TOUR AND TRAVELS"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` or edit `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/tour_and_travels
   JWT_SECRET=super_secret_wanderlust_jwt_key_2026_secure
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. **Seed Sample Demo Data**:
   Populate the database with demo packages (Manali, Kashmir, Goa, Jaipur, Kerala, Rishikesh, Dubai, Thailand), offers, reviews, and administrator account:
   ```powershell
   npm run seed
   ```

   **Default Credentials Seeded**:
   - **Admin Portal**:
     - Email: `admin@wanderlust.com`
     - Password: `Admin@12345`
   - **Customer Account**:
     - Email: `rahul@example.com`
     - Password: `User@12345`

5. **Start the Application**:
   ```powershell
   npm start
   ```
   Or for auto-reloading during development:
   ```powershell
   npm run dev
   ```

6. **Access Interfaces**:
   - **Public User Website**: [http://localhost:5000](http://localhost:5000)
   - **Secure Admin Panel**: [http://localhost:5000/admin/login.html](http://localhost:5000/admin/login.html)
   - **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 File Structure & Separation

Every page has strictly separate HTML, CSS, and JS files:

```
tour-travels/
│   server.js
│   package.json
│   .env
│   .env.example
│   README.md
│
├── config/
│   └── db.js
│
├── models/
│   ├── Admin.js
│   ├── User.js
│   ├── TourPackage.js
│   ├── Offer.js
│   ├── Booking.js
│   ├── Payment.js
│   ├── Review.js
│   ├── Enquiry.js
│   └── SiteSetting.js
│
├── routes/
│   ├── authRoutes.js
│   ├── packageRoutes.js
│   ├── offerRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   ├── userRoutes.js
│   ├── reviewRoutes.js
│   ├── enquiryRoutes.js
│   ├── settingRoutes.js
│   └── adminRoutes.js
│
├── controllers/
│   └── (All controllers corresponding to routes)
│
├── middleware/
│   ├── authenticate.js
│   ├── authorizeAdmin.js
│   ├── errorHandler.js
│   ├── upload.js
│   └── validateRequest.js
│
├── services/
│   ├── pricingService.js
│   ├── bookingService.js
│   └── offerService.js
│
├── scripts/
│   ├── createAdmin.js
│   └── seedData.js
│
├── uploads/
│
├── public/                       <-- Public Website
│   ├── index.html
│   ├── packages.html
│   ├── package-details.html
│   ├── offers.html
│   ├── about.html
│   ├── contact.html
│   ├── login.html
│   ├── register.html
│   ├── my-bookings.html
│   ├── profile.html
│   ├── css/
│   │   ├── common.css
│   │   ├── home.css
│   │   ├── packages.css
│   │   ├── package-details.css
│   │   ├── offers.css
│   │   ├── about.css
│   │   ├── contact.css
│   │   ├── auth.css
│   │   ├── my-bookings.css
│   │   └── profile.css
│   └── js/
│       ├── common.js
│       ├── home.js
│       ├── packages.js
│       ├── package-details.js
│       ├── offers.js
│       ├── about.js
│       ├── contact.js
│       ├── login.js
│       ├── register.js
│       ├── my-bookings.js
│       └── profile.js
│
└── admin/                        <-- Secure Admin Panel
    ├── login.html
    ├── dashboard.html
    ├── packages.html
    ├── package-form.html
    ├── offers.html
    ├── bookings.html
    ├── users.html
    ├── enquiries.html
    ├── reviews.html
    ├── content.html
    ├── settings.html
    ├── css/
    │   ├── admin-common.css
    │   ├── admin-login.css
    │   ├── dashboard.css
    │   ├── admin-packages.css
    │   ├── package-form.css
    │   ├── admin-offers.css
    │   ├── admin-bookings.css
    │   ├── admin-users.css
    │   ├── admin-enquiries.css
    │   ├── admin-reviews.css
    │   ├── admin-content.css
    │   └── admin-settings.css
    └── js/
        ├── admin-common.js
        ├── admin-login.js
        ├── dashboard.js
        ├── admin-packages.js
        ├── package-form.js
        ├── admin-offers.js
        ├── admin-bookings.js
        ├── admin-users.js
        ├── admin-enquiries.js
        ├── admin-reviews.js
        ├── admin-content.js
        └── admin-settings.js
```

---

## 🔒 Security Measures

- Passwords are never stored in plain text (10 rounds bcryptjs salt).
- Admin routes and API operations require server-side token validation and role authorization.
- Price and total calculations are strictly executed on the server via `PricingService` (never trusts client amount).
- Rate limiting prevents brute-force attempts on authentication endpoints.
- Multer enforces image-only MIME types and 5MB maximum file size limits.
- Sensitive credentials and keys remain confined to `.env`.

---

## 📦 Production Deployment & Persistent Storage

For production environments (e.g. AWS EC2, DigitalOcean, Heroku, Render):
1. Point `MONGODB_URI` to a replica-set cluster on MongoDB Atlas.
2. Set `NODE_ENV=production` and generate a cryptographically strong 256-bit `JWT_SECRET`.
3. Use an S3 or Cloudinary adapter for persistent file uploads if deploying to ephemeral serverless containers, or map a persistent Docker volume to `/uploads`.
4. Run Node.js with PM2 process manager:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "wanderlust-travels"
   ```
