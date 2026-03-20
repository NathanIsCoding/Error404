require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Job = require('./models/Job');

const locations = ['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Portland, OR', 'Chicago, IL', 'Remote'];
const industries = ['tech', 'software', 'data-science', 'design'];
const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
const jobTitles = ['Software Engineer', 'Data Scientist', 'UX/UI Designer', 'DevOps Engineer', 'Product Manager', 'Backend Engineer', 'Frontend Engineer', 'Full Stack Developer', 'Machine Learning Engineer', 'Solutions Architect'];
const companies = ['TechCorp', 'InnovateX', 'DataWorks', 'DesignHub', 'CloudNet', 'AI Solutions', 'Webify', 'AppMasters', 'CyberTech', 'NextGen Software'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(arr, count) {
  const shuffled = arr.sort(function () { return 0.5 - Math.random();});
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getRandomIndustries() {
  const count = Math.floor(Math.random() * 2)+ 1;
  return getRandomElements(industries, count);
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

function generateJobs(count) {
  const jobs = [];
  const timestamp = Date.now();
  for (let i = 0; i < count; i++) {
    jobs.push({
      company: getRandomCompany(),
      jobId: 'job-' + timestamp + '-' + i,
      title: getRandomElement(jobTitles),
      jobType: getRandomElement(jobTypes),
      industry: getRandomIndustries(),
      salary: getRandomSalary(getRandomElement(jobTypes)),
      location: getRandomElement(locations),
      description: generateJobDescription(getRandomElement(jobTitles)),
      isActive: Math.random() > 0.1
    });
  }
  return jobs;
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Clearing existing jobs...');
    await Job.deleteMany({});
    console.log('Cleared jobs collection');
    console.log('Generating 100 jobs...');
    const jobs = generateJobs(100);
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
