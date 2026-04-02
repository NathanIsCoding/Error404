const express = require('express');
const request = require('supertest');
const jobsRouter = require('../routes/jobs');
const Job = require('../models/Job');
const db = require('./db');

// Create a minimal Express app and mount the jobs router on it.
const app = express();
app.use(express.json());
app.use(jobsRouter);

// This is required in any file with a DB connection
beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Jobs API', () => {

  describe('GET /api/loadJobs', () => {

    it('should return an empty array when there are no jobs', async () => {

      const res = await request(app).get('/api/loadJobs');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all jobs', async () => {
      // Seed Jobs
      await Job.create([
        {
          jobId: 'job-1',
          title: 'Software Engineer',
          company: 'Acme Corp',
          jobType: 'full-time',
          industry: ['Technology'],
          salary: 80000,
          location: 'Kelowna',
          description: 'Build cool things.',
        },
        {
          jobId: 'job-2',
          title: 'Designer',
          company: 'Design Co',
          jobType: 'part-time',
          industry: ['Creative'],
          salary: 50000,
          location: 'New York',
          description: 'Design cool things.',
        },
      ]);

      const res = await request(app).get('/api/loadJobs');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);

    });

  });

});