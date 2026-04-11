process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const usersRouter = require('../routes/users');
const User = require('../models/User');
const db = require('./db');

const adminToken = jwt.sign(
  { userId: 'admin-1', username: 'admin', isAdmin: true },
  'test-secret'
);

const userToken = jwt.sign(
  { userId: 'user-1', username: 'user', isAdmin: false },
  'test-secret'
);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(usersRouter);

beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Users API', () => {
  describe('GET /api/loadUsers', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/loadUsers');
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const res = await request(app)
        .get('/api/loadUsers')
        .set('Cookie', `session_token=${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Admin access required');
    });

    it('returns empty array when no users exist', async () => {
      const res = await request(app)
        .get('/api/loadUsers')
        .set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns users for admin without passwords', async () => {
      await User.create([
        {
          userId: 'u-1',
          username: 'alpha',
          email: 'alpha@example.com',
          password: 'hashed-1',
          isAdmin: false,
        },
        {
          userId: 'u-2',
          username: 'beta',
          email: 'beta@example.com',
          password: 'hashed-2',
          isAdmin: true,
        },
      ]);

      const res = await request(app)
        .get('/api/loadUsers')
        .set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].password).toBeUndefined();
    });
  });

  describe('DELETE /api/deleteUser/:userId', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).delete('/api/deleteUser/u-1');
      expect(res.statusCode).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const res = await request(app)
        .delete('/api/deleteUser/u-1')
        .set('Cookie', `session_token=${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('deletes a user for admin', async () => {
      await User.create({
        userId: 'u-delete',
        username: 'toDelete',
        email: 'delete@example.com',
        password: 'hashed',
      });

      const res = await request(app)
        .delete('/api/deleteUser/u-delete')
        .set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');

      const stillThere = await User.findOne({ userId: 'u-delete' });
      expect(stillThere).toBeNull();
    });

    it('returns 404 when user does not exist', async () => {
      const res = await request(app)
        .delete('/api/deleteUser/missing-user')
        .set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});
