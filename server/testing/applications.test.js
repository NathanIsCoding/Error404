process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const applicationsRouter = require('../routes/applications');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Job = require('../models/Job');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/applications', applicationsRouter);

beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Applications API', () => {
  describe('POST /api/applications', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/applications').send({ jobId: new mongoose.Types.ObjectId().toString() });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when jobId is missing', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), isAdmin: false }, 'test-secret');
      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', `session_token=${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('jobId is required');
    });

    it('creates an application for authenticated user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const jobId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: userId.toString(), isAdmin: false }, 'test-secret');

      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', `session_token=${token}`)
        .send({ jobId: jobId.toString() });

      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(userId.toString());
      expect(res.body.jobId).toBe(jobId.toString());

      const saved = await JobApplication.findOne({ userId, jobId });
      expect(saved).not.toBeNull();
    });

    it('returns 409 for duplicate application', async () => {
      const userId = new mongoose.Types.ObjectId();
      const jobId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: userId.toString(), isAdmin: false }, 'test-secret');

      await JobApplication.create({ userId, jobId });

      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', `session_token=${token}`)
        .send({ jobId: jobId.toString() });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('You have already applied to this job');
    });
  });

  describe('DELETE /api/applications/:jobId', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).delete(`/api/applications/${new mongoose.Types.ObjectId().toString()}`);
      expect(res.statusCode).toBe(401);
    });

    it('withdraws an existing application', async () => {
      const userId = new mongoose.Types.ObjectId();
      const jobId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: userId.toString(), isAdmin: false }, 'test-secret');

      await JobApplication.create({ userId, jobId });

      const res = await request(app)
        .delete(`/api/applications/${jobId.toString()}`)
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Application withdrawn successfully');

      const deleted = await JobApplication.findOne({ userId, jobId });
      expect(deleted).toBeNull();
    });

    it('returns 404 when application does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const jobId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: userId.toString(), isAdmin: false }, 'test-secret');

      const res = await request(app)
        .delete(`/api/applications/${jobId.toString()}`)
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Application not found');
    });
  });

  describe('GET /api/applications/:username', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/applications/someone');
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when username is not found', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), isAdmin: false }, 'test-secret');

      const res = await request(app)
        .get('/api/applications/missing')
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('returns populated applications for the username', async () => {
      const applicant = await User.create({
        userId: 'applicant-1',
        username: 'applicant',
        email: 'applicant@example.com',
        password: 'hashed',
      });

      const job = await Job.create({
        jobId: 'job-app-1',
        title: 'Backend Developer',
        company: 'Acme',
        jobType: 'full-time',
        industry: 'Engineering',
        salary: 95000,
        location: 'Remote',
        description: 'Build APIs',
      });

      await JobApplication.create({
        userId: applicant._id,
        jobId: job._id,
      });

      const token = jwt.sign({ userId: applicant._id.toString(), username: 'applicant', isAdmin: false }, 'test-secret');

      const res = await request(app)
        .get('/api/applications/applicant')
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].jobId.title).toBe('Backend Developer');
      expect(res.body[0].userId.username).toBe('applicant');
    });
  });
});
