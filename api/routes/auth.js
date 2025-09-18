const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');

const router = express.Router();

// Zod schema registracijai
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Slaptažodis turi būti bent 8 simbolių'),
  name: z.string().min(1).max(100).optional().default(''),
  role: z.enum(['customer', 'farmer']).optional().default('customer'),
});

router.get('/register', (req, res) => {
  res.json({ message: 'Auth API veikia 🚀' });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = registerSchema.parse(req.body);

    // Ar vartotojas jau egzistuoja?
    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) {
      return res.status(409).json({ error: 'Toks el. paštas jau egzistuoja' });
    }

    // Hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
    });

    // Negrąžinam passwordHash
    const { _id, email: e, role: r, name: n, createdAt } = user;
    return res.status(201).json({
      id: _id,
      email: e,
      role: r,
      name: n,
      createdAt,
    });
  } catch (err) {
    // Zod klaidos
    if (err.name === 'ZodError') {
      return res
        .status(400)
        .json({ error: 'Neteisingi duomenys', details: err.errors });
    }
    // Mongo dublikatas (jei lenktyninis atvejis)
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Toks el. paštas jau egzistuoja' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Serverio klaida' });
  }
});

module.exports = router;
