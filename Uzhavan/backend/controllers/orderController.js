const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place an order from the current cart (after payment is verified on client)
// @route   POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, contactMobile, paymentMethod, razorpayDetails } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ message: `${product ? product.nameEn : 'A product'} no longer has enough stock` });
      }
      const subtotal = item.quantity * item.priceAtAdd;
      totalAmount += subtotal;
      orderItems.push({
        product: product._id,
        farmer: product.farmer,
        nameEn: product.nameEn,
        nameTa: product.nameTa,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: item.priceAtAdd,
        subtotal
      });
    }

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      contactMobile,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      razorpayOrderId: razorpayDetails?.razorpay_order_id,
      razorpayPaymentId: razorpayDetails?.razorpay_payment_id,
      razorpaySignature: razorpayDetails?.razorpay_signature
    });

    // Deduct purchased quantity from each product's stock
    for (const item of cart.items) {
      const newQty = item.product.quantity - item.quantity;
      await Product.findByIdAndUpdate(item.product._id, {
        quantity: newQty,
        isSoldOut: newQty <= 0
      });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// @desc    Get orders placed by the logged-in buyer
// @route   GET /api/orders/mine
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort('-createdAt');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Get orders containing the logged-in farmer's products
// @route   GET /api/orders/farmer-orders
const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.farmer': req.user._id })
      .populate('buyer', 'name mobile address')
      .sort('-createdAt');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch farmer orders', error: error.message });
  }
};

// @desc    Update order status (farmer updates: confirmed/packed/shipped/delivered)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isRelatedFarmer = order.items.some((i) => i.farmer.toString() === req.user._id.toString());
    if (!isRelatedFarmer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = orderStatus;
    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getFarmerOrders, updateOrderStatus };
