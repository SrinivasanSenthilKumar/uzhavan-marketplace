const User = require('../models/User');

// @desc    List users awaiting/having a given ID verification status
//          (defaults to 'pending' so admins land on the review queue).
// @route   GET /api/admin/verifications?status=pending|verified|rejected|all
const listVerifications = async (req, res) => {
  try {
    const { status = 'pending', role } = req.query;

    const filter = { role: { $ne: 'admin' } };
    if (status !== 'all') filter.isGovtIdVerified = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load verification queue', error: error.message });
  }
};

// @desc    Get a single user's full verification details (ID document, etc.)
// @route   GET /api/admin/verifications/:id
const getVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('verifiedBy', 'name mobile');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load user', error: error.message });
  }
};

// @desc    Approve or reject a user's government ID document.
// @route   PUT /api/admin/verifications/:id
// @body    { action: 'verified' | 'rejected', rejectionReason?: string }
const decideVerification = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(action)) {
      return res.status(400).json({ message: "action must be 'verified' or 'rejected'" });
    }
    if (action === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'rejectionReason is required when rejecting a user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts do not go through ID verification' });
    }
    if (!user.govtIdDocument) {
      return res.status(400).json({ message: 'This user has not uploaded a government ID document yet' });
    }

    user.isGovtIdVerified = action;
    user.verifiedBy = req.user._id;
    user.verifiedAt = new Date();
    user.rejectionReason = action === 'rejected' ? rejectionReason : '';
    await user.save();

    res.json({
      message: `User ${action === 'verified' ? 'approved' : 'rejected'} successfully`,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
};

// @desc    Enable / disable a user account (separate from ID verification).
// @route   PUT /api/admin/users/:id/active
const setUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate an admin account from this endpoint' });
    }

    user.isActive = !!isActive;
    await user.save();
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

module.exports = { listVerifications, getVerification, decideVerification, setUserActive };
