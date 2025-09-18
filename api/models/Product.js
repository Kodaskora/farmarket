const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number, // saugosim centais (pvz., 499 = 4.99 €)
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'dairy', 'meat', 'other'],
      default: 'other',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  { timestamps: true }
);

// Geo indeksas – reikalingas paieškai pagal vietą
ProductSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', ProductSchema);
