const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // unikalus indeksas
      match: [/^\S+@\S+\.\S+$/, 'Neteisingas el. pašto formatas'],
    },
    passwordHash: {
      type: String,
      required: true, // saugosim jau „hash’ą“, ne plain tekstą
      minlength: 10, // bcrypt hash’ai ilgi; čia tik apsauga
    },
    role: {
      type: String,
      enum: ['customer', 'farmer', 'admin'],
      default: 'customer',
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Naudinga paieškai pagal email
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
