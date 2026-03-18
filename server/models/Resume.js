const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  resumeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  references: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  workHistory: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  //Perhaps we need to add work history model
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
