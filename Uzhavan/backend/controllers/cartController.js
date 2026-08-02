const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged-in user's cart
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'farmer', select: 'name mobile district' }
    });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// @desc    Add or update item quantity in cart
// @route   POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isPublished || product.isSoldOut) {
      return res.status(404).json({ message: 'Product not available' });
    }
    if (quantity > product.quantity) {
      return res.status(400).json({ message: `Only ${product.quantity} ${product.unit} available` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity, priceAtAdd: product.pricePerUnit });
    }

    await cart.save();
    await cart.populate({ path: 'items.product', populate: { path: 'farmer', select: 'name mobile district' } });
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
