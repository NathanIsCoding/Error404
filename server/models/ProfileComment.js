const mongoose = require('mongoose');

const profileCommentSchema = new mongoose.Schema({
  profileUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  authorUsername: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProfileComment', profileCommentSchema);
