/**
 * One-time bootstrap script to create the first admin account.
 * Public signup deliberately only allows farmer / customer / bulkbuyer,
 * so admins must be created directly against the database like this.
 *
 * Usage:
 *   node scripts/createAdmin.js
 *
 * Reads ADMIN_SEED_NAME, ADMIN_SEED_MOBILE, ADMIN_SEED_PASSWORD from .env,
 * or falls back to the values below if not set.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const name = process.env.ADMIN_SEED_NAME || 'Marketplace Admin';
  const mobile = process.env.ADMIN_SEED_MOBILE || '9999999999';
  const password = process.env.ADMIN_SEED_PASSWORD || 'change_this_password';

  const existing = await User.findOne({ mobile });
  if (existing) {
    console.log(`A user with mobile ${mobile} already exists (role: ${existing.role}). No changes made.`);
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({
    name,
    mobile,
    password,
    role: 'admin',
    isMobileVerified: true,
    isGovtIdVerified: 'verified'
  });

  console.log('Admin account created:');
  console.log(`  Mobile:   ${admin.mobile}`);
  console.log(`  Password: ${password}`);
  console.log('Log in at /login (role: admin uses the same login endpoint) and change the password afterwards.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
