const express = require('express');
const router = express.Router();
const {
  createRequest, getSentRequests, getReceivedRequests, respondToRequest
} = require('../controllers/consumerRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('bulkbuyer'), createRequest);
router.get('/sent', protect, authorize('bulkbuyer'), getSentRequests);
router.get('/received', protect, authorize('farmer'), getReceivedRequests);
router.put('/:id/respond', protect, authorize('farmer'), respondToRequest);

module.exports = router;
