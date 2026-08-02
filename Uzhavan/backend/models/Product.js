const mongoose = require('mongoose');
const { TN_DISTRICTS, CATEGORY_KEYS } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    nameEn: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true },

    descriptionEn: { type: String, trim: true },
    descriptionTa: { type: String, trim: true },

    category: { type: String, enum: CATEGORY_KEYS, required: true },

    quantity: { type: Number, required: true, min: 0 }, // available quantity
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'dozen', 'litre', 'piece', 'bag'],
      default: 'kg'
    },
    pricePerUnit: { type: Number, required: true, min: 0 }, // in INR

    district: { type: String, enum: TN_DISTRICTS, required: true },
    village: { type: String, trim: true },

    images: [{ type: String }],

    contactName: { type: String, trim: true },
    contactMobile: { type: String, trim: true },

    isOrganic: { type: Boolean, default: false },
    harvestDate: { type: Date },

    isPublished: { type: Boolean, default: true },
    isSoldOut: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.index({ district: 1, category: 1, isPublished: 1 });
productSchema.index({ nameEn: 'text', nameTa: 'text', descriptionEn: 'text', descriptionTa: 'text' });

module.exports = mongoose.model('Product', productSchema);
