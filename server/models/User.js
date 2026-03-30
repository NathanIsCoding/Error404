const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  resumeText: {
    type: String,
    default: ''
  },
  profilePhoto: {
    data: Buffer,
    contentType: String
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    unique: true,
    sparse: true
  },
  coverLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoverLetter',
    unique: true,
    sparse: true
  },
  createdJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isAdmin: {
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

module.exports = mongoose.model('User', userSchema);
