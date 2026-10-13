require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tour_and_travels';
    await mongoose.connect(mongoUri);
    console.log('[Setup] Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@wanderlust.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const name = process.env.ADMIN_NAME || 'Super Administrator';

    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log(`[Setup] Admin account already exists for ${email}. Updating password...`);
      admin.password = password;
      admin.name = name;
      admin.role = 'superadmin';
      admin.status = 'active';
      await admin.save();
    } else {
      admin = await Admin.create({
        name,
        email,
        password,
        role: 'superadmin',
        status: 'active',
      });
      console.log(`[Setup] Created new superadmin account for: ${email}`);
    }

    console.log('----------------------------------------------------');
    console.log(' Admin Credentials Initialized:');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Setup Error]', error);
    process.exit(1);
  }
};

createAdmin();
