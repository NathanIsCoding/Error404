const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  resolved: { 
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: function () {
      const now = new Date();
      const offsetMs = 7 * 60 * 60 * 1000;
      const adjusted = new Date(now.getTime() - offsetMs);
      return adjusted;
    }
  }
});

module.exports = mongoose.model('ticket', ticketSchema);
