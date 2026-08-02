const mongoose = require('mongoose');

const consumerRequestSchema = new mongoose.Schema(
  {
    bulkBuyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    requestedQuantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    offeredPricePerUnit: { type: Number },
    message: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    farmerResponseNote: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConsumerRequest', consumerRequestSchema);
