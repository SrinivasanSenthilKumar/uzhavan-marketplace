const express = require('express');
const router = express.Router();
const {
  createProduct, getProducts, getProductById,
  getMyProducts, updateProduct, deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/mine', protect, authorize('farmer'), getMyProducts);
router.get('/:id', getProductById);

router.post('/', protect, authorize('farmer'), uploadProductImages.array('images', 5), createProduct);
router.put('/:id', protect, authorize('farmer'), uploadProductImages.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('farmer'), deleteProduct);

module.exports = router;
