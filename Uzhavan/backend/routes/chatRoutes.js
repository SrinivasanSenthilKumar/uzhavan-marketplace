const express = require('express');
const router = express.Router();
const { getConversation, getInbox } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInbox);
router.get('/:userId', protect, getConversation);

module.exports = router;
