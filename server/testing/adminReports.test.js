process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const adminReportsRouter = require('../routes/adminReports');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ProfileComment = require('../models/ProfileComment');
const SupportTicket = require('../models/SupportTicket');
const db = require('./db');

const adminToken = jwt.sign(
    { userId: 'admin-1', username: 'adminuser', isAdmin: true },
    'test-secret'
);

const userToken = jwt.sign(
    { userId: 'user-1', username: 'testuser', isAdmin: false },
    'test-secret'
);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/', adminReportsRouter);

beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

// Helper: date N days ago
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

// Minimal valid job fixture
const jobBase = {
    title: 'Engineer',
    company: 'Acme',
    jobType: 'full-time',
    industry: 'Engineering',
    salary: 80000,
    location: 'Remote',
    description: 'Do stuff.',
};

describe('GET /api/admin/reports', () => {

    describe('Auth & access control', () => {

        it('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(401);
        });

        it('returns 403 for a non-admin user', async () => {
            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${userToken}`);
            expect(res.statusCode).toBe(403);
        });

    });

    describe('Response shape', () => {

        it('returns all expected top-level keys with numeric values', async () => {
            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toMatchObject({
                users:        { total: expect.any(Number), new: expect.any(Number), admin: expect.any(Number), disabled: expect.any(Number) },
                jobs:         { total: expect.any(Number), new: expect.any(Number), active: expect.any(Number) },
                applications: { total: expect.any(Number), new: expect.any(Number), pending: expect.any(Number), accepted: expect.any(Number), rejected: expect.any(Number) },
                comments:     { total: expect.any(Number), new: expect.any(Number) },
                tickets:      { total: expect.any(Number), new: expect.any(Number), open: expect.any(Number), resolved: expect.any(Number) },
            });
        });

        it('returns zeros when the database is empty', async () => {
            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.users.total).toBe(0);
            expect(res.body.jobs.total).toBe(0);
            expect(res.body.applications.total).toBe(0);
            expect(res.body.comments.total).toBe(0);
            expect(res.body.tickets.total).toBe(0);
        });

    });

    describe('User counts', () => {

        it('counts total, admin, and disabled users correctly', async () => {
            await User.create([
                { userId: 'u1', username: 'alice', email: 'alice@test.com', password: 'x', isAdmin: false, isDisabled: false },
                { userId: 'u2', username: 'bob',   email: 'bob@test.com',   password: 'x', isAdmin: true,  isDisabled: false },
                { userId: 'u3', username: 'carol', email: 'carol@test.com', password: 'x', isAdmin: false, isDisabled: true  },
            ]);

            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.total).toBe(3);
            expect(res.body.users.admin).toBe(1);
            expect(res.body.users.disabled).toBe(1);
        });

        it('counts new users within the selected range', async () => {
            await User.create([
                { userId: 'u1', username: 'recent', email: 'recent@test.com', password: 'x', createdAt: daysAgo(5)  },
                { userId: 'u2', username: 'old',    email: 'old@test.com',    password: 'x', createdAt: daysAgo(60) },
            ]);

            const res = await request(app)
                .get('/?range=30d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.total).toBe(2);
            expect(res.body.users.new).toBe(1);
        });

    });

    describe('Job counts', () => {

        it('counts total and active jobs correctly', async () => {
            await Job.create([
                { jobId: 'j1', ...jobBase, isActive: true  },
                { jobId: 'j2', ...jobBase, isActive: true  },
                { jobId: 'j3', ...jobBase, isActive: false },
            ]);

            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.jobs.total).toBe(3);
            expect(res.body.jobs.active).toBe(2);
        });

        it('counts new jobs within the selected range', async () => {
            await Job.create([
                { jobId: 'j1', ...jobBase, createdAt: daysAgo(3)  },
                { jobId: 'j2', ...jobBase, createdAt: daysAgo(200) },
            ]);

            const res = await request(app)
                .get('/?range=30d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.jobs.new).toBe(1);
        });

    });

    describe('Application counts', () => {

        it('counts applications by status correctly', async () => {
            const jid = new mongoose.Types.ObjectId();
            await JobApplication.create([
                { jobId: jid, userId: new mongoose.Types.ObjectId(), status: 'pending'  },
                { jobId: jid, userId: new mongoose.Types.ObjectId(), status: 'accepted' },
                { jobId: jid, userId: new mongoose.Types.ObjectId(), status: 'rejected' },
                { jobId: jid, userId: new mongoose.Types.ObjectId(), status: 'pending'  },
            ]);

            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.applications.total).toBe(4);
            expect(res.body.applications.pending).toBe(2);
            expect(res.body.applications.accepted).toBe(1);
            expect(res.body.applications.rejected).toBe(1);
        });

    });

    describe('Comment counts', () => {

        it('counts new comments within the selected range', async () => {
            const uid = new mongoose.Types.ObjectId();
            const aid = new mongoose.Types.ObjectId();
            await ProfileComment.create([
                { profileUserId: uid, authorId: aid, authorUsername: 'a', text: 'Recent', createdAt: daysAgo(5)  },
                { profileUserId: uid, authorId: aid, authorUsername: 'a', text: 'Old',    createdAt: daysAgo(60) },
            ]);

            const res = await request(app)
                .get('/?range=30d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.comments.total).toBe(2);
            expect(res.body.comments.new).toBe(1);
        });

    });

    describe('Ticket counts', () => {

        it('counts open and resolved tickets correctly', async () => {
            await SupportTicket.create([
                { ticketId: 'TKT-0001', userId: 'u1', title: 'Issue A', resolved: false },
                { ticketId: 'TKT-0002', userId: 'u2', title: 'Issue B', resolved: true  },
                { ticketId: 'TKT-0003', userId: 'u3', title: 'Issue C', resolved: false },
            ]);

            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.tickets.total).toBe(3);
            expect(res.body.tickets.open).toBe(2);
            expect(res.body.tickets.resolved).toBe(1);
        });

        it('counts new tickets within the selected range', async () => {
            await SupportTicket.create([
                { ticketId: 'TKT-0004', userId: 'u1', title: 'Recent', resolved: false, createdAt: daysAgo(2)  },
                { ticketId: 'TKT-0005', userId: 'u2', title: 'Old',    resolved: false, createdAt: daysAgo(400) },
            ]);

            const res = await request(app)
                .get('/?range=365d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.tickets.new).toBe(1);
        });

    });

    describe('Range parameter', () => {

        it('returns all records when range=all', async () => {
            await User.create([
                { userId: 'u1', username: 'a', email: 'a@test.com', password: 'x', createdAt: daysAgo(400) },
                { userId: 'u2', username: 'b', email: 'b@test.com', password: 'x', createdAt: daysAgo(5)   },
            ]);

            const res = await request(app)
                .get('/?range=all')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.new).toBe(2);
        });

        it('defaults to 30d when no range is provided', async () => {
            await User.create([
                { userId: 'u1', username: 'a', email: 'a@test.com', password: 'x', createdAt: daysAgo(10) },
                { userId: 'u2', username: 'b', email: 'b@test.com', password: 'x', createdAt: daysAgo(60) },
            ]);

            const res = await request(app)
                .get('/')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.new).toBe(1);
        });

        it('treats an unknown range value the same as "all"', async () => {
            await User.create([
                { userId: 'u1', username: 'a', email: 'a@test.com', password: 'x', createdAt: daysAgo(400) },
                { userId: 'u2', username: 'b', email: 'b@test.com', password: 'x', createdAt: daysAgo(5)   },
            ]);

            const res = await request(app)
                .get('/?range=foo')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.users.new).toBe(2);
        });

        it('filters correctly with range=7d', async () => {
            await User.create([
                { userId: 'u1', username: 'a', email: 'a@test.com', password: 'x', createdAt: daysAgo(3)  },
                { userId: 'u2', username: 'b', email: 'b@test.com', password: 'x', createdAt: daysAgo(10) },
            ]);

            const res = await request(app)
                .get('/?range=7d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.new).toBe(1);
        });

        it('filters correctly with range=90d', async () => {
            await User.create([
                { userId: 'u1', username: 'a', email: 'a@test.com', password: 'x', createdAt: daysAgo(45)  },
                { userId: 'u2', username: 'b', email: 'b@test.com', password: 'x', createdAt: daysAgo(120) },
            ]);

            const res = await request(app)
                .get('/?range=90d')
                .set('Cookie', `session_token=${adminToken}`);

            expect(res.body.users.new).toBe(1);
        });

    });

});
