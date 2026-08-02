const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getFarmerOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer', 'bulkbuyer'), placeOrder);
router.get('/mine', protect, authorize('customer', 'bulkbuyer'), getMyOrders);
router.get('/farmer-orders', protect, authorize('farmer'), getFarmerOrders);
router.put('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);

module.exports = router;
