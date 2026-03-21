require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young', 'Allen', 'King'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com'];

const descriptions = [
  'Passionate software developer with a love for clean code.',
  'Looking for exciting opportunities in tech.',
  'Recent graduate eager to break into the industry.',
  'Experienced professional seeking new challenges.',
  'Creative problem-solver with a background in design.',
  'Data enthusiast with strong analytical skills.',
  'Full-stack developer with 3+ years of experience.',
  'Career changer transitioning into software engineering.',
  '',
  ''
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername(firstName, lastName, index) {
  const variants = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
    `${lastName.toLowerCase()}${firstName[0].toLowerCase()}${index}`,
  ];
  return getRandomElement(variants);
}

function generateEmail(firstName, lastName, index) {
  const variants = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${getRandomElement(domains)}`,
    `${firstName.toLowerCase()}${index}@${getRandomElement(domains)}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${getRandomElement(domains)}`,
  ];
  return getRandomElement(variants);
}

function generateRating() {
  // Weighted toward higher ratings, some users have 0 (no rating yet)
  const rand = Math.random();
  if (rand < 0.2) return 0;
  return parseFloat((Math.random() * 3 + 2).toFixed(1)); // 2.0 - 5.0
}

function generateUsers(count) {
  const users = [];
  const timestamp = Date.now();
  const usedEmails = new Set();
  const usedUsernames = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);

    // Ensure unique usernames and emails
    let username = generateUsername(firstName, lastName, i);
    while (usedUsernames.has(username)) {
      username = `${username}_${i}`;
    }
    usedUsernames.add(username);

    let email = generateEmail(firstName, lastName, i);
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}${i}_${timestamp}@${getRandomElement(domains)}`;
    }
    usedEmails.add(email);

    users.push({
      userId: 'user-' + timestamp + '-' + i,
      username,
      email,
      password: '$2b$10$placeholderhashedpasswordfortestingpurposesonly',
      description: getRandomElement(descriptions),
      rating: generateRating(),
      isAdmin: i === 0, // Make the first user an admin
      createdJobs: [],
    });
  }

  return users;
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Cleared users collection');

    console.log('Generating 50 users...');
    const users = generateUsers(50);
    const insertedUsers = await User.insertMany(users);
    console.log(`Inserted ${insertedUsers.length} users`);

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