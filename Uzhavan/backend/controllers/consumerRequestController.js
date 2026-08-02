const ConsumerRequest = require('../models/ConsumerRequest');

// @desc    Bulk buyer sends a direct request to a farmer
// @route   POST /api/consumer-requests
const createRequest = async (req, res) => {
  try {
    const { farmerId, productId, requestedQuantity, unit, offeredPricePerUnit, message } = req.body;

    const request = await ConsumerRequest.create({
      bulkBuyer: req.user._id,
      farmer: farmerId,
      product: productId,
      requestedQuantity,
      unit,
      offeredPricePerUnit,
      message
    });

    res.status(201).json({ request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send request', error: error.message });
  }
};

// @desc    Get requests sent by the logged-in bulk buyer
// @route   GET /api/consumer-requests/sent
const getSentRequests = async (req, res) => {
  try {
    const requests = await ConsumerRequest.find({ bulkBuyer: req.user._id })
      .populate('farmer', 'name mobile district')
      .populate('product', 'nameEn nameTa category')
      .sort('-createdAt');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// @desc    Get requests received by the logged-in farmer
// @route   GET /api/consumer-requests/received
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await ConsumerRequest.find({ farmer: req.user._id })
      .populate('bulkBuyer', 'name mobile companyName address')
      .populate('product', 'nameEn nameTa category quantity')
      .sort('-createdAt');
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// @desc    Farmer accepts or rejects a bulk buyer's request
// @route   PUT /api/consumer-requests/:id/respond
const respondToRequest = async (req, res) => {
  try {
    const { status, farmerResponseNote } = req.body; // 'accepted' | 'rejected'
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await ConsumerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    if (farmerResponseNote) request.farmerResponseNote = farmerResponseNote;
    await request.save();

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to request', error: error.message });
  }
};

module.exports = { createRequest, getSentRequests, getReceivedRequests, respondToRequest };
