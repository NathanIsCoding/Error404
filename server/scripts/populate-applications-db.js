require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

const statuses = ['pending', 'accepted', 'rejected'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(daysBack = 180) {
  const now = new Date();
  const offsetMs = Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offsetMs);
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, '_id').lean();
    if (users.length === 0) {
      console.error('No users found. Run populate-users-db.js first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users`);

    const jobs = await Job.find({ isActive: true }, '_id createdByUserId').lean();
    if (jobs.length === 0) {
      console.error('No active jobs found. Run populate-jobs-db.js first.');
      process.exit(1);
    }
    console.log(`Found ${jobs.length} active jobs`);

    console.log('Clearing existing job applications...');
    await JobApplication.deleteMany({});

    // Each user applies to a random subset of jobs they did not post
    const applications = [];
    const seen = new Set();

    for (const user of users) {
      const eligibleJobs = jobs.filter(
        j => String(j.createdByUserId) !== String(user._id)
      );
      if (eligibleJobs.length === 0) continue;

      const applyCount = Math.min(
        Math.floor(Math.random() * 6) + 1,
        eligibleJobs.length
      );
      const chosen = eligibleJobs.sort(() => Math.random() - 0.5).slice(0, applyCount);

      for (const job of chosen) {
        const key = `${user._id}:${job._id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        applications.push({
          userId: user._id,
          jobId: job._id,
          status: getRandomElement(statuses),
          createdAt: randomPastDate(),
        });
      }
    }

    const inserted = await JobApplication.insertMany(applications);
    console.log(`Inserted ${inserted.length} job applications`);

    console.log('Database population complete!');
  } catch (error) {
    console.error('Error populating database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

populateDB();
