const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('customer', 'bulkbuyer'));

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
