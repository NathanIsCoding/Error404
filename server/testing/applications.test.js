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

  describe('GET /api/applications/user/:username', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/applications/user/someone');
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when username is not found', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), isAdmin: false }, 'test-secret');

      const res = await request(app)
        .get('/api/applications/user/missing')
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('allows viewing another user\'s applications when authenticated', async () => {
      const applicant = await User.create({
        userId: 'applicant-other',
        username: 'otherapplicant',
        email: 'other@example.com',
        password: 'hashed',
      });
      const viewer = await User.create({
        userId: 'viewer-1',
        username: 'viewer',
        email: 'viewer@example.com',
        password: 'hashed',
      });
      const job = await Job.create({
        jobId: 'job-other-1',
        title: 'Analyst',
        company: 'Corp',
        jobType: 'full-time',
        industry: 'Finance',
        salary: 60000,
        location: 'Remote',
        description: 'Analyse things',
      });
      await JobApplication.create({ userId: applicant._id, jobId: job._id });

      const viewerToken = jwt.sign({ userId: viewer._id.toString(), username: 'viewer', isAdmin: false }, 'test-secret');
      const res = await request(app)
        .get('/api/applications/user/otherapplicant')
        .set('Cookie', `session_token=${viewerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
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
        .get('/api/applications/user/applicant')
        .set('Cookie', `session_token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].jobId.title).toBe('Backend Developer');
      expect(res.body[0].userId.username).toBe('applicant');
    });
  });

  describe('PATCH /api/applications/:applicationId/status', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .patch(`/api/applications/${new mongoose.Types.ObjectId()}/status`)
        .send({ status: 'accepted' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 for invalid status', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), isAdmin: false }, 'test-secret');
      const res = await request(app)
        .patch(`/api/applications/${new mongoose.Types.ObjectId()}/status`)
        .set('Cookie', `session_token=${token}`)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid status');
    });

    it('updates application status when authorized as the job owner', async () => {
      const jobOwner = await User.create({ userId: 'owner-1', username: 'owner', email: 'owner@test.com', password: 'hash' });
      const applicant = await User.create({ userId: 'app-1', username: 'app', email: 'app@test.com', password: 'hash' });
      const job = await Job.create({
        jobId: 'job-1', title: 'Developer', company: 'Co', jobType: 'full-time', industry: 'Engineering', salary: 1000, description: 'Test', location: 'Remote',
        createdByUserId: jobOwner.userId
      });
      const application = await JobApplication.create({ userId: applicant._id, jobId: job._id });

      const token = jwt.sign({ userId: jobOwner.userId, isAdmin: false }, 'test-secret');

      const res = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Cookie', `session_token=${token}`)
        .send({ status: 'accepted' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('accepted');

      const updated = await JobApplication.findById(application._id);
      expect(updated.status).toBe('accepted');
    });

    it('returns 404 when application does not exist', async () => {
      const token = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), isAdmin: false }, 'test-secret');
      const res = await request(app)
        .patch(`/api/applications/${new mongoose.Types.ObjectId()}/status`)
        .set('Cookie', `session_token=${token}`)
        .send({ status: 'accepted' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Application not found');
    });

    it('accepts "pending" as a valid status', async () => {
      const jobOwner = await User.create({ userId: 'owner-p', username: 'ownerp', email: 'ownerp@test.com', password: 'hash' });
      const applicant = await User.create({ userId: 'app-p', username: 'appp', email: 'appp@test.com', password: 'hash' });
      const job = await Job.create({
        jobId: 'job-p', title: 'Dev', company: 'Co', jobType: 'full-time', industry: 'Engineering', salary: 1000, description: 'Test', location: 'Remote',
        createdByUserId: jobOwner.userId
      });
      const application = await JobApplication.create({ userId: applicant._id, jobId: job._id, status: 'accepted' });
      const token = jwt.sign({ userId: jobOwner.userId, isAdmin: false }, 'test-secret');

      const res = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Cookie', `session_token=${token}`)
        .send({ status: 'pending' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });

    it('returns 403 when trying to update status as non-owner', async () => {
      const jobOwner = await User.create({ userId: 'owner-2', username: 'owner2', email: 'owner2@test.com', password: 'hash' });
      const otherUser = await User.create({ userId: 'other-1', username: 'other', email: 'other@test.com', password: 'hash' });
      const job = await Job.create({
        jobId: 'job-2', title: 'Dev', company: 'Co', jobType: 'full-time', industry: 'Engineering', salary: 1000, description: 'Test', location: 'Remote',
        createdByUserId: jobOwner.userId
      });
      const application = await JobApplication.create({ userId: new mongoose.Types.ObjectId(), jobId: job._id });

      const token = jwt.sign({ userId: otherUser.userId, isAdmin: false }, 'test-secret');

      const res = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Cookie', `session_token=${token}`)
        .send({ status: 'rejected' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /api/applications/job/:jobId', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/applications/job/some-job');
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when job does not exist', async () => {
      const token = jwt.sign({ userId: 'some-user', isAdmin: false }, 'test-secret');
      const res = await request(app).get('/api/applications/job/nonexistent-job').set('Cookie', `session_token=${token}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Job not found');
    });

    it('returns 403 when not the job owner', async () => {
      await Job.create({
        jobId: 'job-3', title: 'Dev', company: 'Co', jobType: 'full-time', industry: 'Engineering', salary: 1000, description: 'Test', location: 'Remote',
        createdByUserId: 'actual-owner'
      });
      const token = jwt.sign({ userId: 'not-owner', isAdmin: false }, 'test-secret');
      const res = await request(app).get('/api/applications/job/job-3').set('Cookie', `session_token=${token}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Unauthorized to view these applications');
    });

    it('returns applications for the job when authorized', async () => {
      const jobOwner = await User.create({ userId: 'owner-3', username: 'owner3', email: 'owner3@test.com', password: 'hash' });
      const dbJob = await Job.create({
        jobId: 'job-4', title: 'Dev', company: 'Co', jobType: 'full-time', industry: 'Engineering', salary: 1000, description: 'Test', location: 'Remote',
        createdByUserId: jobOwner.userId
      });
      const applicant = await User.create({ userId: 'app-3', username: 'app3', email: 'app3@test.com', password: 'hash' });
      await JobApplication.create({ userId: applicant._id, jobId: dbJob._id });

      const token = jwt.sign({ userId: jobOwner.userId, isAdmin: false }, 'test-secret');
      const res = await request(app).get('/api/applications/job/job-4').set('Cookie', `session_token=${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userId.username).toBe('app3');
    });
  });
});
