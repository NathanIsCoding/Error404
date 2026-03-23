require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Ticket = require('../models/SupportTicket.js');

const tickets_data = [
  { title: 'Application stuck on Pending',         description: 'My job application status has been stuck on "Pending" for over two weeks with no update.' },
  { title: 'No application confirmation email',    description: 'I applied to a position but never received a confirmation email that my application was submitted.' },
  { title: 'Resume formatting broken',             description: 'The resume I uploaded is not rendering correctly — the formatting is completely broken on the employer side.' },
  { title: 'Apply button not working',             description: 'I can see a job listing but the Apply button does nothing when I click it.' },
  { title: 'Job search filters not working',       description: 'Job search filters are not working — selecting "Full-Time" still shows part-time and contract roles.' },
  { title: 'Listing disappeared after being viewed', description: 'I was notified that my application was viewed, but the job listing has since disappeared from the site.' },
  { title: 'Cannot withdraw application',          description: 'Employer has not responded after 3 weeks, but I cannot find any way to withdraw my application.' },
  { title: 'Salary range changed after applying',  description: 'The salary range displayed on the listing does not match what was shown when I originally applied.' },
  { title: 'Irrelevant job alert emails',          description: 'I am receiving job alert emails for roles completely unrelated to my saved search preferences.' },
  { title: 'Saved jobs list wiped',                description: 'My saved jobs list was wiped after I updated my profile — all bookmarks are gone.' },
  { title: 'Job listing not going live',           description: 'The job listing I posted as an employer has not gone live after 48 hours.' },
  { title: 'Old resume still being sent',          description: 'I uploaded a new resume but the old version is still being sent to employers.' },
  { title: 'Location filter returning wrong results', description: 'Location filter is broken — searching for jobs in Vancouver is returning results from across the country.' },
  { title: 'Cannot update applicant status',       description: 'I cannot mark a candidate application as reviewed — the status dropdown is unresponsive.' },
  { title: 'Applicant count showing zero',         description: 'As an employer, the applicant count on my listing shows 0 even though I have received applications.' },
  { title: 'Job listing removed without notice',   description: 'Job listing I posted was taken down without any notification or explanation.' },
  { title: 'Cannot edit submitted application',    description: 'I accidentally submitted an incomplete application and there is no way to edit or resubmit it.' },
  { title: 'Easy Apply option missing',            description: 'The "Easy Apply" option is missing on listings that previously had it.' },
  { title: 'Skills section not saving',            description: 'Profile skills section is not saving — every time I add a skill and refresh, it reverts.' },
  { title: 'Interview invitation link broken',     description: 'I received an interview invitation email but clicking the link gives a 404 error.' },
  { title: 'Employer dashboard missing analytics', description: 'Employer dashboard is not showing analytics for my active job postings.' },
  { title: 'Cannot upload cover letter',           description: 'I cannot upload a cover letter — the file upload field only accepts resumes.' },
  { title: 'Cannot set application deadline',      description: 'Job posting form does not allow me to set an application deadline date.' },
  { title: 'Duplicate listings in search results', description: 'Duplicate job listings for the same position keep appearing in my search results.' },
  { title: 'Deactivated account still showing listings', description: 'I deactivated my employer account but my job listings are still publicly visible.' },
  { title: 'No subject / no description',          description: '' },
];

function generateTicketId() {
  return `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function generateUserId() {
  return crypto.randomBytes(16).toString('hex');
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(daysBack = 90) {
  const now = new Date();
  const offsetMs = Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offsetMs);
}

function generateTickets(count) {
  const tickets = [];
  const usedTicketIds = new Set();

  for (let i = 0; i < count; i++) {
    let ticketId = generateTicketId();
    while (usedTicketIds.has(ticketId)) {
      ticketId = generateTicketId();
    }
    usedTicketIds.add(ticketId);

    const { title, description } = getRandomElement(tickets_data);

    tickets.push({
      ticketId,
      userId: generateUserId(),
      title,
      description,
      resolved: Math.random() < 0.4, // ~40% of tickets are resolved
      createdAt: randomPastDate(90),
    });
  }

  return tickets;
}

async function populateDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing tickets...');
    await Ticket.deleteMany({});
    console.log('Cleared tickets collection');

    console.log('Generating 50 tickets...');
    const tickets = generateTickets(50);
    const inserted = await Ticket.insertMany(tickets);
    console.log(`Inserted ${inserted.length} tickets`);

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