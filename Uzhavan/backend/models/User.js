const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { TN_DISTRICTS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number']
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['farmer', 'customer', 'bulkbuyer', 'admin'],
      required: true
    },
    preferredLanguage: { type: String, enum: ['en', 'ta'], default: 'en' },

    // Mobile OTP verification
    isMobileVerified: { type: Boolean, default: false },

    // Government ID verification (mainly for farmers, e.g. Aadhaar / Farmer ID)
    govtIdType: {
      type: String,
      enum: ['aadhaar', 'voter_id', 'farmer_id', 'pan', 'other'],
      default: 'aadhaar'
    },
    govtIdNumber: { type: String, trim: true },
    govtIdDocument: { type: String }, // file path to uploaded ID proof
    isGovtIdVerified: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true },

    // Farmer specific
    district: {
      type: String,
      enum: TN_DISTRICTS,
      required: function () {
        return this.role === 'farmer';
      }
    },
    village: { type: String, trim: true },
    farmName: { type: String, trim: true },

    // Bulk buyer specific
    companyName: { type: String, trim: true },
    gstNumber: { type: String, trim: true },

    // Customer/Bulk buyer address
    address: { type: String, trim: true },

    profileImage: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
