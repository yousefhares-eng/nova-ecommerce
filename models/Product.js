/**
 * Product model for NOVA clothing items
 * Supports images, sizes, colors, and inventory
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null, // Original price before discount (optional)
    },
    category: {
      type: String,
      trim: true,
      default: 'streetwear',
      enum: ['streetwear', 'hoodies', 't-shirts', 'pants', 'accessories', 'outerwear', 'other'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ featured: 1, active: 1 });

module.exports = mongoose.model('Product', productSchema);
