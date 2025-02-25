const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  aboutEvent: { type: String, required: true },
  images: [String], // Array of base64 encoded image strings
  status: { type: Number, default: 1 }, // 0: hosting, 1: upcoming, 2: past
});

module.exports = mongoose.model('Event', EventSchema);
