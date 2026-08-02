const crypto = require('crypto');
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}

const getInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @desc    Create a Razorpay order for the given amount (called before checkout)
// @route   POST /api/payments/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const instance = getInstance();
    if (!instance) {
      return res.status(503).json({
        message:
          'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
      });
    }

    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature after checkout success
// @route   POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed', verified: false });
    }

    res.json({ message: 'Payment verified successfully', verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
