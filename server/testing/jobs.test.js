process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const jobsRouter = require('../routes/jobs');
const Job = require('../models/Job');
const db = require('./db');

const testToken = jwt.sign(
  { userId: 'user-1', username: 'testuser', isAdmin: false },
  'test-secret'
);

const adminToken = jwt.sign(
  { userId: 'admin-1', username: 'adminuser', isAdmin: true },
  'test-secret'
);

const cookieParser = require('cookie-parser');

// Create a minimal Express app and mount the jobs router on it.
const app = express();
app.use(express.json());
app.use(cookieParser());
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
          industry: 'Engineering',
          salary: 80000,
          location: 'Kelowna',
          description: 'Build cool things.',
        },
        {
          jobId: 'job-2',
          title: 'Designer',
          company: 'Design Co',
          jobType: 'part-time',
          industry: 'Education',
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

  describe('DELETE /api/deleteJob/:jobId', () => {

    const job = {
        jobId: 'job-1',
        title: 'Software Engineer',
        company: 'Acme Corp',
        jobType: 'full-time',
        industry: 'Engineering',
        salary: 80000,
        location: 'Kelowna',
        description: 'Build cool things.',
    };

    it('should delete specified job from id', async () => {
        // Seed Job
        await Job.create(job);

        const res = await request(app).delete('/api/deleteJob/'+job.jobId).set('Cookie', `session_token=${adminToken}`);
        expect(res.statusCode).toBe(200);

        const res2 = await request(app).get('/api/loadJobs');
        expect(res2.statusCode).toBe(200);
        expect(res2.body).toEqual([]);
    });

    it('should return 404 if job does not exist', async () => {
        const res = await request(app).delete('/api/deleteJob/'+job.jobId).set('Cookie', `session_token=${adminToken}`);
        expect(res.statusCode).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
        await Job.create(job);
        const res = await request(app).delete('/api/deleteJob/' + job.jobId);
        expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
        await Job.create(job);
        const res = await request(app).delete('/api/deleteJob/' + job.jobId).set('Cookie', `session_token=${testToken}`);
        expect(res.statusCode).toBe(403);
    });

  });


  describe('POST /api/jobs', () => {

    const job = {
        title: 'Software Engineer',
        company: 'Acme Corp',
        jobType: 'full-time',
        industry: 'Engineering',
        salary: 80000,
        location: 'Kelowna',
        description: 'Build cool things.',
    };

    it('should create a job with specified fields', async () => {
        const res = await request(app).post('/api/jobs').set('Cookie', `session_token=${testToken}`).send(job);
        expect(res.statusCode).toBe(201);

        const res2 = await request(app).get('/api/loadJobs');
        expect(res2.statusCode).toBe(200);
        expect(res2.body[0]).toMatchObject(job);
    });

    it('should associate the job with the user who created it', async () => {
        const res = await request(app).post('/api/jobs').set('Cookie', `session_token=${testToken}`).send(job);
        expect(res.statusCode).toBe(201);
        expect(res.body.createdByUserId).toBe('user-1');
        expect(res.body.createdByUsername).toBe('testuser');
    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).post('/api/jobs').send(job);
        expect(res.statusCode).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/api/jobs').set('Cookie', `session_token=${testToken}`).send({ title: 'Incomplete Job' });
        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if salary is zero', async () => {
        const res = await request(app).post('/api/jobs').set('Cookie', `session_token=${testToken}`).send({ ...job, salary: 0 });
        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if salary is negative', async () => {
        const res = await request(app).post('/api/jobs').set('Cookie', `session_token=${testToken}`).send({ ...job, salary: -5000 });
        expect(res.statusCode).toBe(400);
    });

  });

  describe('GET /api/my-jobs', () => {

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/my-jobs');
        expect(res.statusCode).toBe(401);
    });

    it('should return only jobs created by the authenticated user', async () => {
        await Job.create([
            {
                jobId: 'job-mine',
                title: 'My Job',
                company: 'My Corp',
                jobType: 'full-time',
                industry: 'Engineering',
                salary: 80000,
                location: 'Kelowna',
                description: 'Mine.',
                createdByUserId: 'user-1',
            },
            {
                jobId: 'job-other',
                title: 'Other Job',
                company: 'Other Corp',
                jobType: 'part-time',
                industry: 'Finance',
                salary: 60000,
                location: 'Vancouver',
                description: 'Not mine.',
                createdByUserId: 'user-2',
            },
        ]);

        const res = await request(app).get('/api/my-jobs').set('Cookie', `session_token=${testToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].jobId).toBe('job-mine');
    });

    it('should return an empty array when the user has no jobs', async () => {
        const res = await request(app).get('/api/my-jobs').set('Cookie', `session_token=${testToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

  });

  describe('GET /api/search', () => {
    const job = {
        jobId: 'job-search-1',
        title: 'Software Engineer',
        company: 'Acme Corp',
        jobType: 'full-time',
        industry: 'Engineering',
        salary: 80000,
        location: 'Kelowna',
        description: 'Build cool things.',
    };

    it('should return the specified jobs by title', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ q: job.title });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ title: 'Software Engineer', company: 'Acme Corp' });
    });

    it('should return an empty array when no jobs match the query', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ q: 'Nonexistent Job' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should filter jobs by jobType', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ jobType: 'full-time' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].jobType).toBe('full-time');
    });

    it('should filter jobs by minimum salary', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ salary: 90000 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return jobs that meet the minimum salary', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ salary: 70000 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it('should return all jobs when no filters are provided', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it('should match jobs case-insensitively by title', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ q: 'software engineer' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it('should filter jobs by industry', async () => {
        await Job.create([
            job,
            {
                jobId: 'job-search-3',
                title: 'Accountant',
                company: 'Finance Co',
                jobType: 'full-time',
                industry: 'Finance',
                salary: 70000,
                location: 'Toronto',
                description: 'Crunch numbers.',
            },
        ]);

        const res = await request(app).get('/api/search').query({ industry: 'Engineering' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].industry).toBe('Engineering');
    });

    it('should match jobs by company name', async () => {
        await Job.create(job);

        const res = await request(app).get('/api/search').query({ q: 'Acme' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it('should apply multiple filters together', async () => {
        await Job.create([
            job,
            {
                jobId: 'job-search-2',
                title: 'Software Engineer',
                company: 'Other Corp',
                jobType: 'part-time',
                industry: 'Engineering',
                salary: 80000,
                location: 'Vancouver',
                description: 'Other things.',
            },
        ]);

        const res = await request(app).get('/api/search').query({ q: 'Software Engineer', jobType: 'full-time' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].jobId).toBe('job-search-1');
    });

  });

  describe('PUT /api/updateJob/:jobId', () => {
    const job = {
        jobId: 'job-update-1',
        title: 'Software Engineer',
        company: 'Acme Corp',
        jobType: 'full-time',
        industry: 'Engineering',
        salary: 80000,
        location: 'Kelowna',
        description: 'Build cool things.',
        createdByUserId: 'user-1',
    };

    it('should update the title of a specified job', async () => {
        await Job.create(job);

        const res = await request(app).put('/api/updateJob/' + job.jobId).set('Cookie', `session_token=${testToken}`).send({ title: 'Senior Engineer' });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Senior Engineer');
    });

    it('should persist the update in the database', async () => {
        await Job.create(job);

        await request(app).put('/api/updateJob/' + job.jobId).set('Cookie', `session_token=${testToken}`).send({ salary: 100000 });

        const res = await request(app).get('/api/loadJobs');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].salary).toBe(100000);
    });

    it('should return 404 if the job does not exist', async () => {
        const res = await request(app).put('/api/updateJob/nonexistent-id').set('Cookie', `session_token=${testToken}`).send({ title: 'Ghost Job' });
        expect(res.statusCode).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
        await Job.create(job);
        const res = await request(app).put('/api/updateJob/' + job.jobId).send({ title: 'Ghost Job' });
        expect(res.statusCode).toBe(401);
    });

    it('should return 403 if the user is not the job owner', async () => {
        await Job.create({ ...job, createdByUserId: 'user-2' });
        const res = await request(app).put('/api/updateJob/' + job.jobId).set('Cookie', `session_token=${testToken}`).send({ title: 'Stolen Edit' });
        expect(res.statusCode).toBe(403);
    });

    it('should allow an admin to update a job they did not create', async () => {
        await Job.create({ ...job, createdByUserId: 'user-2' });
        const res = await request(app).put('/api/updateJob/' + job.jobId).set('Cookie', `session_token=${adminToken}`).send({ title: 'Admin Override' });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Admin Override');
    });

  });

});