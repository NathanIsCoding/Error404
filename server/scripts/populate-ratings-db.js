require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const ProfileComment = require('../models/ProfileComment');

const commentTexts = [
  'Excellent employer — clear expectations and quick to respond.',
  'Very fair pay and respectful of work-life balance.',
  'Great onboarding process, felt supported from day one.',
  'Communicates well and gives constructive feedback.',
  'Flexible and understanding when issues came up.',
  'Paid on time and honoured everything in the contract.',
  'Decent employer overall, nothing exceptional.',
  'Instructions were sometimes unclear but manageable.',
  'Slow to respond but the work itself was straightforward.',
  'Underpaid for the scope of work, but the team was friendly.',
  'Micromanaged too much, but deadlines were reasonable.',
  'Would work for this employer again without hesitation.',
  'Scope kept changing mid-project which was frustrating.',
  'Very professional and organized hiring process.',
  'Fair employer, paid well and left me to work independently.',
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function recalculateRating(profileUserId) {
  const ratedComments = await ProfileComment.find({ profileUserId, rating: { $ne: null } });
  const avg = ratedComments.length
    ? ratedComments.reduce((sum, c) => sum + c.rating, 0) / ratedComments.length
    : 0;
  await User.findByIdAndUpdate(profileUserId, { rating: Math.round(avg * 10) / 10 });
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, '_id username').lean();
    if (users.length < 2) {
      console.error('Need at least 2 users. Run populate-users-db.js first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users`);

    console.log('Clearing existing profile comments...');
    await ProfileComment.deleteMany({});

    console.log('Resetting user ratings...');
    await User.updateMany({}, { rating: 0 });

    // Each user gets between 2 and 6 ratings from other users
    const comments = [];
    for (const profileUser of users) {
      const others = users.filter(u => String(u._id) !== String(profileUser._id));
      const reviewerCount = getRandomInt(2, Math.min(6, others.length));
      const reviewers = others.sort(() => Math.random() - 0.5).slice(0, reviewerCount);

      for (const reviewer of reviewers) {
        comments.push({
          profileUserId: profileUser._id,
          authorId: reviewer._id,
          authorUsername: reviewer.username,
          text: getRandomElement(commentTexts),
          rating: getRandomInt(1, 5),
          createdAt: new Date(Date.now() - getRandomInt(0, 90) * 24 * 60 * 60 * 1000),
        });
      }
    }

    await ProfileComment.insertMany(comments);
    console.log(`Inserted ${comments.length} rated comments`);

    console.log('Recalculating user ratings...');
    for (const user of users) {
      await recalculateRating(user._id);
    }
    console.log('Ratings updated');

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
