const express = require('express');
const Product = require('../models/Product');

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
    const { title, price, stock, category, location } = req.body;

    if (!title || price == null || !location?.type || !location?.coordinates) {
      return res.status(400).json({ error: 'Blogai uzpildyti laukeliai' });
    }

    const doc = await Product.create({
      title,
      price,
      stock,
      category,
      location, // { type: 'Point', coordinates: [lng, lat] }
    });

    res.status(201).json(doc);
  } catch (e) {
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
