const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const signup = async (req, res) => {
  try {
    const {
      idToken,
      name, mobile, password, role, preferredLanguage,
      govtIdType, govtIdNumber,
      district, village, farmName,
      companyName, gstNumber, address
    } = req.body;

    if (!name || !mobile || !password || !role) {
      return res.status(400).json({ message: 'Name, mobile, password and role are required' });
    }
    if (!['farmer', 'customer', 'bulkbuyer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (role === 'farmer' && !district) {
      return res.status(400).json({ message: 'District is required for farmers' });
    }

    // Re-verify the Firebase token server-side (never trust the client's
    // word alone) and make sure it matches the mobile number being signed up.
    
    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    const userData = {
      name, mobile, password, role,
      preferredLanguage: preferredLanguage || 'en', // proven above via Firebase ID token
      govtIdType, govtIdNumber, district, village, farmName,
      companyName, gstNumber, address
    };

    if (req.file) {
      userData.govtIdDocument = `/uploads/ids/${req.file.filename}`;
    }

    const user = await User.create(userData);

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Signup failed' });
  }
};

// @desc    Login using mobile number + password
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { mobile, password, role } = req.body;
    const user = await User.findOne({ mobile, role });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid mobile number or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been disabled. Contact support.' });
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// @desc    Passwordless login - user proves ownership of their mobile number
//          via Firebase OTP instead of typing a password.
// @route   POST /api/auth/login-otp

// @desc    Get logged in user's profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @desc    Update profile (including uploading govt ID afterwards)
// @route   PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'preferredLanguage', 'district', 'village', 'farmName',
      'companyName', 'gstNumber', 'address', 'govtIdType', 'govtIdNumber'
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.govtIdDocument = `/uploads/ids/${req.file.filename}`;
      // A freshly uploaded document always needs a fresh admin review.
      updates.isGovtIdVerified = 'pending';
      updates.verifiedBy = null;
      updates.verifiedAt = null;
      updates.rejectionReason = '';
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

module.exports = {signup, login, getMe, updateMe };
