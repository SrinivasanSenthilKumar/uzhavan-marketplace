const express = require('express');
const router = express.Router();
const {
  listVerifications,
  getVerification,
  decideVerification,
  setUserActive
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Every route below requires a logged-in admin.
router.use(protect, authorize('admin'));

router.get('/verifications', listVerifications);
router.get('/verifications/:id', getVerification);
router.put('/verifications/:id', decideVerification);

router.put('/users/:id/active', setUserActive);

module.exports = router;
