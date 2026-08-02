const express = require('express');
const router = express.Router();
const { verifyMobile, signup, login, loginWithOtp, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadGovtId } = require('../middleware/uploadMiddleware');

// Mobile OTP is sent and confirmed by the Firebase client SDK directly on
// the frontend. This endpoint just double-checks the resulting ID token.

router.post('/signup', uploadGovtId.single('govtIdDocument'), signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, uploadGovtId.single('govtIdDocument'), updateMe);

module.exports = router;
