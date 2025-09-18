const express = require('express');
const Product = require('../models/Product');

const { z } = require('zod');

const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(1),
  category: z
    .enum(['vegetables', 'fruits', 'dairy', 'meat', 'other'])
    .default('other'),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }),
});

const router = express.Router();

// GET /products  – visi
router.get('/', async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Serverio klaida' });
  }
});

// POST /products – sukurti
router.post('/', async (req, res) => {
  try {
    const parsed = productSchema.parse(req.body);
    const doc = await Product.create(parsed);
    res.status(201).json(item);
  } catch (e) {
    if (e.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Nepraejo patikros duomenys', details: e.errors });
    }
    console.error(e);
    res.status(400).json({ error: 'Neteisingi duomenys' });
  }
});

// GET /products/nearby?lat=&lng=&radiusKm=25
router.get('/nearby', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm ?? 25);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'lat ir lng iveskite skaicius' });
    }

    const meters = radiusKm * 1000;

    const items = await Product.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: meters,
          spherical: true,
        },
      },
      { $limit: 50 },
    ]);

    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
