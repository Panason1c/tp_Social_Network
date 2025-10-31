const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  coverPhoto: String,
  privacy: { type: String, enum: ['public','private'], default: 'public' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
