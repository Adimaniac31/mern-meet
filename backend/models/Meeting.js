const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meetingId: String,
  meetLink: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Meeting', meetingSchema);
