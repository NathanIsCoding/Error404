process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const accountsRouter = require('../routes/accounts');
const User = require('../models/User');
const ProfileComment = require('../models/ProfileComment');
const db = require('./db');
const bcrypt = require('bcrypt');

const testToken = jwt.sign(
  { userId: 'user-1', username: 'testuser', isAdmin: false },
  'test-secret'
);

const adminToken = jwt.sign(
  { userId: 'admin-1', username: 'adminuser', isAdmin: true },
  'test-secret'
);

const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/accounts', accountsRouter);

function binaryParser(res, callback) {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => callback(null, Buffer.concat(data)));
}

beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Accounts API', () => {

  describe('Accounts photo fallback', () => {
    it('returns DiceBear glass avatar when user has no profilePhoto', async () => {
      const user = await User.create({
        userId: 'user-no-photo-1',
        username: 'NoPhotoUser',
        email: 'nophoto@example.com',
        password: 'hashed-password',
        isAdmin: false,
      });

      const dicebearSvg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: (name) => (name === 'content-type' ? 'image/svg+xml' : null),
        },
        arrayBuffer: async () => Buffer.from(dicebearSvg),
      });

      const res = await request(app)
        .get(`/api/accounts/${user._id.toString()}/photo`)
        .buffer(true)
        .parse(binaryParser);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('image/svg+xml');
      expect(res.body.toString()).toBe(dicebearSvg);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch.mock.calls[0][0]).toContain('https://api.dicebear.com/9.x/glass/svg?seed=NoPhotoUser');
    });

    it('returns stored profilePhoto when user already has one', async () => {
      const user = await User.create({
        userId: 'user-photo-1',
        username: 'HasPhotoUser',
        email: 'hasphoto@example.com',
        password: 'hashed-password',
        isAdmin: false,
        profilePhoto: {
          data: Buffer.from('PNGDATA'),
          contentType: 'image/png',
        },
      });

      global.fetch = jest.fn();

      const res = await request(app)
        .get(`/api/accounts/${user._id.toString()}/photo`)
        .buffer(true)
        .parse(binaryParser);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('image/png');
      expect(res.body.equals(Buffer.from('PNGDATA'))).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/accounts/login', () => {
    const user = {
      userId: "user-1",
      username: "testuser",
      email: "test@test.com",
      password: "hashedPassword",
      description: "test description",
      profilePhoto: {
          data: "Binary.createFromBase64('iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAulBMVEX///8ACj4AADsAACsAADkAADEABz0ABT0AACzMzNEAADfP…', 0)",
          contentType: "image/png"
      }
    };

    it('should successfully login in with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);

      await User.create({ ...user, password: hashedPassword });
      const res = await request(app).post('/api/accounts/login').send({ username: user.username, password: user.password });

      expect(res.statusCode).toBe(200);
    });

    it('should return 401 when logging in with invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);

      await User.create({ ...user, password: hashedPassword });
      const res = await request(app).post('/api/accounts/login').send({ username: user.username, password: "321" });

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 when logging in with inactive account', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);

      await User.create({ ...user, password: hashedPassword });

      const res = await request(app).patch('/api/accounts/toggleUser/' + user.userId).set('Cookie', `session_token=${adminToken}`);
      expect(res.statusCode).toBe(200);

      const res2 = await request(app).post('/api/accounts/login').send({ username: user.username, password: user.password });

      expect(res2.statusCode).toBe(403);
    });

    it('should return 404 when user does not exist', async () => {
      const res = await request(app).post('/api/accounts/login').send({ username: 'nonexistent', password: 'password' });
      expect(res.statusCode).toBe(404);
    });

    it('should login successfully when username case differs', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword });
      const res = await request(app).post('/api/accounts/login').send({ username: user.username.toUpperCase(), password: user.password });
      expect(res.statusCode).toBe(200);
    });

    it('should set a session_token cookie on successful login', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword });

      const res = await request(app).post('/api/accounts/login').send({ username: user.username, password: user.password });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/session_token=/);
    });
  });

  describe('POST /api/accounts (create account)', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'image/svg+xml' },
        arrayBuffer: async () => Buffer.from('<svg/>'),
      });
    });

    it('should create a new account with valid fields', async () => {
      const res = await request(app).post('/api/accounts').send({ username: 'newuser', email: 'new@test.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.account.username).toBe('newuser');
    });

    it('should return 409 if username is already taken', async () => {
      await request(app).post('/api/accounts').send({ username: 'dupuser', email: 'first@test.com', password: 'password123' });

      const res = await request(app).post('/api/accounts').send({ username: 'dupuser', email: 'second@test.com', password: 'password123' });

      expect(res.statusCode).toBe(409);
    });

    it('should return 409 if email is already registered', async () => {
      await request(app).post('/api/accounts').send({ username: 'user1', email: 'dup@test.com', password: 'password123' });

      const res = await request(app).post('/api/accounts').send({ username: 'user2', email: 'dup@test.com', password: 'password123' });

      expect(res.statusCode).toBe(409);
    });

    it('should return 400 if username or email is missing', async () => {
      const res = await request(app).post('/api/accounts').send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 409 when username differs only in case', async () => {
      await request(app).post('/api/accounts').send({ username: 'caseuser', email: 'first@test.com', password: 'password123' });
      const res = await request(app).post('/api/accounts').send({ username: 'CASEUSER', email: 'second@test.com', password: 'password123' });
      expect(res.statusCode).toBe(409);
    });

    it('should return 400 when username is whitespace only', async () => {
      const res = await request(app).post('/api/accounts').send({ username: '   ', email: 'ws@test.com', password: 'password123' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/accounts/profile', () => {
    let profileUser, profileToken;

    beforeEach(async () => {
      const hashed = await bcrypt.hash('correct-password', 12);
      profileUser = await User.create({ userId: 'user-edit-1', username: 'edituser', email: 'edit@test.com', password: hashed });
      profileToken = jwt.sign({ userId: profileUser._id, username: 'edituser', isAdmin: false }, 'test-secret');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put('/api/accounts/profile').send({ currentPassword: 'correct-password', username: 'newname' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 when currentPassword is missing', async () => {
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ username: 'newname' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 401 when currentPassword is wrong', async () => {
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ currentPassword: 'wrong-password', username: 'newname' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 409 when the new username is already taken', async () => {
      const hashed = await bcrypt.hash('pw', 12);
      await User.create({ userId: 'user-edit-2', username: 'takenname', email: 'taken@test.com', password: hashed });
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ currentPassword: 'correct-password', username: 'takenname' });
      expect(res.statusCode).toBe(409);
    });

    it('should return 409 when the new email is already registered', async () => {
      const hashed = await bcrypt.hash('pw', 12);
      await User.create({ userId: 'user-edit-3', username: 'otheredituser', email: 'taken@test.com', password: hashed });
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ currentPassword: 'correct-password', email: 'taken@test.com' });
      expect(res.statusCode).toBe(409);
    });

    it('should return 400 when new passwords do not match', async () => {
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ currentPassword: 'correct-password', newPassword: 'abc123', confirmPassword: 'xyz789' });
      expect(res.statusCode).toBe(400);
    });

    it('should successfully update the username', async () => {
      const res = await request(app).put('/api/accounts/profile').set('Cookie', `session_token=${profileToken}`).send({ currentPassword: 'correct-password', username: 'updatedname' });
      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe('updatedname');
    });
  });

  describe('GET /api/accounts/me', () => {
    it('should return user info for authenticated user', async () => {
      const res = await request(app).get('/api/accounts/me').set('Cookie', `session_token=${testToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/accounts/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/accounts/logout', () => {
    it('should clear the session_token cookie and return success', async () => {
      const res = await request(app).post('/api/accounts/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accounts/profile/:username', () => {
    it('should return public profile for an existing user', async () => {
      const hashedPassword = await bcrypt.hash('password', 12);
      await User.create({ userId: 'user-1', username: 'testuser', email: 'test@test.com', password: hashedPassword });

      const res = await request(app).get('/api/accounts/profile/testuser');
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('testuser');
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await request(app).get('/api/accounts/profile/ghost');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/accounts/profile/resume', () => {
    it('should update resume text for authenticated user', async () => {
      const hashedPassword = await bcrypt.hash('password', 12);
      const createdUser = await User.create({ userId: 'user-1', username: 'testuser', email: 'test@test.com', password: hashedPassword });

      const token = jwt.sign({ userId: createdUser._id, username: 'testuser', isAdmin: false }, 'test-secret');

      const res = await request(app).put('/api/accounts/profile/resume').set('Cookie', `session_token=${token}`).send({ resumeText: 'My updated resume.' });

      expect(res.statusCode).toBe(200);
      expect(res.body.resumeText).toBe('My updated resume.');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put('/api/accounts/profile/resume').send({ resumeText: 'test' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PATCH /api/accounts/toggleUser/:userId', () => {
    const user = {
      userId: 'user-target',
      username: 'targetuser',
      email: 'target@test.com',
      password: 'hashedpw',
    };

    it('should disable an active user', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword });

      const res = await request(app).patch(`/api/accounts/toggleUser/${user.userId}`).set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isDisabled).toBe(true);
    });

    it('should re-enable a disabled user', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword, isDisabled: true });

      const res = await request(app).patch(`/api/accounts/toggleUser/${user.userId}`).set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isDisabled).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app).patch(`/api/accounts/toggleUser/${user.userId}`).set('Cookie', `session_token=${testToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).patch(`/api/accounts/toggleUser/${user.userId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should return 404 if user does not exist', async () => {
      const res = await request(app).patch('/api/accounts/toggleUser/nonexistent-id').set('Cookie', `session_token=${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/accounts/toggleAdmin/:userId', () => {
    const user = {
      userId: 'user-target',
      username: 'targetuser',
      email: 'target@test.com',
      password: 'hashedpw',
    };

    it('should promote a regular user to admin', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword });

      const res = await request(app).patch(`/api/accounts/toggleAdmin/${user.userId}`).set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isAdmin).toBe(true);
    });

    it('should demote an admin to a regular user', async () => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({ ...user, password: hashedPassword, isAdmin: true });

      const res = await request(app).patch(`/api/accounts/toggleAdmin/${user.userId}`).set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isAdmin).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app).patch(`/api/accounts/toggleAdmin/${user.userId}`).set('Cookie', `session_token=${testToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).patch(`/api/accounts/toggleAdmin/${user.userId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should return 404 if user does not exist', async () => {
      const res = await request(app)
        .patch('/api/accounts/toggleAdmin/nonexistent-id')
        .set('Cookie', `session_token=${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /:id/photo', () => {
    it('should return 404 when user does not exist', async () => {
      const { Types } = require('mongoose');
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app).get(`/api/accounts/${fakeId}/photo`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/accounts/profile/resume', () => {
    it('should return 400 when resumeText is not a string', async () => {
      const hashedPassword = await bcrypt.hash('password', 12);
      const created = await User.create({ userId: 'user-1', username: 'testuser', email: 'test@test.com', password: hashedPassword });
      const token = jwt.sign({ userId: created._id, username: 'testuser', isAdmin: false }, 'test-secret');

      const res = await request(app).put('/api/accounts/profile/resume').set('Cookie', `session_token=${token}`).send({ resumeText: 42 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/accounts/profile/:username/comments', () => {
    it('should return empty array when user has no comments', async () => {
      await User.create({ userId: 'user-1', username: 'testuser', email: 'test@test.com', password: 'hashed' });

      const res = await request(app).get('/api/accounts/profile/testuser/comments');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await request(app).get('/api/accounts/profile/ghost/comments');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/accounts/profile/:username/comments', () => {
    let profileUser, commenter, commenterToken;

    beforeEach(async () => {
      const hashed = await bcrypt.hash('password', 12);
      profileUser = await User.create({ userId: 'profile-user', username: 'profileuser', email: 'profile@test.com', password: hashed });
      commenter = await User.create({ userId: 'commenter-1', username: 'commenter', email: 'commenter@test.com', password: hashed });
      commenterToken = jwt.sign({ userId: commenter._id, username: 'commenter', isAdmin: false }, 'test-secret');
    });

    it('should post a comment with a rating', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Great employer!', rating: 5 });

      expect(res.statusCode).toBe(201);
      expect(res.body.text).toBe('Great employer!');
      expect(res.body.rating).toBe(5);
    });

    it('should post a comment without a rating', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Decent place.' });

      expect(res.statusCode).toBe(201);
      expect(res.body.rating).toBeNull();
    });

    it('should return 400 when text is missing', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ rating: 3 });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when text exceeds 1000 characters', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when rating is out of range', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Bad rating value', rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when rating is below 1', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Zero rating', rating: 0 });
      expect(res.statusCode).toBe(400);
    });

    it('should accept rating of 1 (lower boundary)', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Minimum rating', rating: 1 });
      expect(res.statusCode).toBe(201);
      expect(res.body.rating).toBe(1);
    });

    it('should accept rating of 5 (upper boundary)', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Maximum rating', rating: 5 });
      expect(res.statusCode).toBe(201);
      expect(res.body.rating).toBe(5);
    });

    it('should return 400 when rating is a float', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Float rating', rating: 3.5 });
      expect(res.statusCode).toBe(400);
    });

    it('should accept a comment with exactly 1000 characters', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'a'.repeat(1000) });
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 when text is whitespace only', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: '   ' });
      expect(res.statusCode).toBe(400);
    });

    it('should update the profile rating when a rated comment is posted', async () => {
      await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Good!', rating: 4 });

      const updated = await User.findById(profileUser._id);
      expect(updated.rating).toBe(4);
    });

    it('should return 403 when commenting on own profile', async () => {
      const selfToken = jwt.sign({ userId: profileUser._id, username: 'profileuser', isAdmin: false }, 'test-secret');

      const res = await request(app).post('/api/accounts/profile/profileuser/comments').set('Cookie', `session_token=${selfToken}`).send({ text: 'I love myself.' });

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for a non-existent profile', async () => {
      const res = await request(app).post('/api/accounts/profile/ghost/comments').set('Cookie', `session_token=${commenterToken}`).send({ text: 'Hello?' });

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/accounts/profile/profileuser/comments').send({ text: 'No auth.' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/accounts/profile/:username/comments/:commentId', () => {
    let profileUser, commenter, commenterToken, comment;

    beforeEach(async () => {
      const hashed = await bcrypt.hash('password', 12);
      profileUser = await User.create({ userId: 'profile-user', username: 'profileuser', email: 'profile@test.com', password: hashed });
      commenter = await User.create({ userId: 'commenter-1', username: 'commenter', email: 'commenter@test.com', password: hashed });
      commenterToken = jwt.sign({ userId: commenter._id, username: 'commenter', isAdmin: false }, 'test-secret');
      comment = await ProfileComment.create({ profileUserId: profileUser._id, authorId: commenter._id, authorUsername: 'commenter', text: 'Nice!', rating: 4 });
    });

    it('should allow the author to delete their own comment', async () => {
      const res = await request(app).delete(`/api/accounts/profile/profileuser/comments/${comment._id}`).set('Cookie', `session_token=${commenterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow an admin to delete any comment', async () => {
      const res = await request(app).delete(`/api/accounts/profile/profileuser/comments/${comment._id}`).set('Cookie', `session_token=${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 when a non-author non-admin tries to delete', async () => {
      const hashed = await bcrypt.hash('password', 12);
      const other = await User.create({ userId: 'other-1', username: 'other', email: 'other@test.com', password: hashed });
      const otherToken = jwt.sign({ userId: other._id, username: 'other', isAdmin: false }, 'test-secret');

      const res = await request(app).delete(`/api/accounts/profile/profileuser/comments/${comment._id}`).set('Cookie', `session_token=${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 when comment does not exist', async () => {
      const { Types } = require('mongoose');
      const fakeId = new Types.ObjectId().toString();

      const res = await request(app).delete(`/api/accounts/profile/profileuser/comments/${fakeId}`).set('Cookie', `session_token=${commenterToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/accounts/profile/profileuser/comments/${comment._id}`);

      expect(res.statusCode).toBe(401);
    });

    it('should recalculate rating to 0 after the only rated comment is deleted', async () => {
      await User.findByIdAndUpdate(profileUser._id, { rating: 4 });

      await request(app).delete(`/api/accounts/profile/profileuser/comments/${comment._id}`).set('Cookie', `session_token=${commenterToken}`);

      const updated = await User.findById(profileUser._id);
      expect(updated.rating).toBe(0);
    });
  });

});
