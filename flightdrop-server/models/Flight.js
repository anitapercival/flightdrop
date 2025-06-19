const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  user: { type: String, required: true },
  airline: String,
  price: Number,
  depart: {
    time: String,
    arrive: String,
    duration: String,
    from: String,
    to: String,
  },
  return: {
    time: String,
    arrive: String,
    duration: String,
    from: String,
    to: String,
  },
  trend: [
    {
      date: String,
      price: Number,
    },
  ],
  notifications: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Flight', flightSchema);
