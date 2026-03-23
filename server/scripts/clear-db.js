require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const SupportTicket = require('../models/SupportTicket');

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await CoverLetter.deleteMany({});
    await Resume.deleteMany({});
    await User.deleteMany({});
    await Job.deleteMany({});
    await SupportTicket.deleteMany({});
    console.log('Database completely erased!');
    
  } catch (error) {
    console.error('Error clearing database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

clearDatabase();
