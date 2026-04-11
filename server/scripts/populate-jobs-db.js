require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Job = require('../models/Job');
const User = require('../models/User');

const locations = ['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Portland, OR', 'Chicago, IL', 'Remote'];
const industries = [
  'Information Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Manufacturing',
  'Construction',
  'Hospitality',
  'Transportation and Logistics',
  'Sales',
  'Marketing and Advertising',
  'Customer Service',
  'Government and Public Administration',
  'Engineering',
  'Real Estate',
  'Media and Entertainment',
  'Telecommunications',
  'Agriculture',
  'Energy and Utilities',
  'Legal Services'
];
const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
const jobTitles = ['Software Engineer', 'Data Scientist', 'UX/UI Designer', 'DevOps Engineer', 'Product Manager', 'Backend Engineer', 'Frontend Engineer', 'Full Stack Developer', 'Machine Learning Engineer', 'Solutions Architect'];
const companies = ['TechCorp', 'InnovateX', 'DataWorks', 'DesignHub', 'CloudNet', 'AI Solutions', 'Webify', 'AppMasters', 'CyberTech', 'NextGen Software'];

function generateJobId() {
  return crypto.randomBytes(16).toString('hex');
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


function getRandomIndustry() {
  return getRandomElement(industries);
}
function getRandomCompany() {
  return getRandomElement(companies);
}
function getRandomSalary(jobType) {
  const base = Math.floor(Math.random() * 80000) + 40000;
  if (jobType === 'internship') return Math.floor(base * 0.3);
  if (jobType === 'part-time') return Math.floor(base * 0.6);
  if (jobType === 'contract') return Math.floor(base * 0.8);
  return base;
}

function generateJobDescription(title) {
  const descriptions = [
    `We are looking for a talented ${title} to join our team and help us grow.`,
  ];
  return getRandomElement(descriptions);
}

function randomPastDate(daysBack = 365) {
  const now = new Date();
  const offsetMs = Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offsetMs);
}

function generateJobs(count, users) {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const user = getRandomElement(users);
    jobs.push({
      company: getRandomCompany(),
      jobId: generateJobId(),
      title: getRandomElement(jobTitles),
      jobType: getRandomElement(jobTypes),
      industry: getRandomIndustry(),
      salary: getRandomSalary(getRandomElement(jobTypes)),
      location: getRandomElement(locations),
      description: generateJobDescription(getRandomElement(jobTitles)),
      createdAt: randomPastDate(),
      isActive: Math.random() > 0.1,
      createdByUserId: user._id.toString(),
      createdByUsername: user.username,
    });
  }
  return jobs;
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const users = await User.find({}, '_id username').lean();
    if (users.length === 0) {
      console.error('No users found. Run populate-users-db.js first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users`);

    console.log('Clearing existing jobs...');
    await Job.deleteMany({});
    console.log('Cleared jobs collection');
    console.log('Generating 100 jobs...');
    const jobs = generateJobs(100, users);
    const insertedJobs = await Job.insertMany(jobs);
    console.log('Inserted ' + insertedJobs.length + ' jobs');

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
