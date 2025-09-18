require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/farmarket';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // (nebūtina, bet naudinga formoms)

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'API veikia 🚀' });
});

// Routes
app.use('/products', productsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Nerasta' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Neapdorota klaida:', err);
  res.status(500).json({ error: 'Vidine serverio klaida' });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Prisijungta prie MongoDB');
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`✅ API paleistas ant http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('❌ Mongo klaida', err));
