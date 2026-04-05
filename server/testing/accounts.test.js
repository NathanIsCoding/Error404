process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const accountsRouter = require('../routes/');
const User = require('../models/User');
const db = require('./db');
const bcrypt = require('bcrypt');

const testToken = jwt.sign(
  { userId: 'user-1', username: 'testuser', isAdmin: false },
  'test-secret'
);

const cookieParser = require('cookie-parser');

// Create a minimal Express app and mount the jobs router on it.
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(accountsRouter);

// This is required in any file with a DB connection
beforeAll(async () => await db.connect());
afterAll(async () => await db.disconnect());
afterEach(async () => await db.clear());

describe('Accounts API', () => {

  describe('POST /api/login', () => {
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
        const hashedPassword = await bcrypt.hash(user.password, 12)
    
        await User.create(user);
        const res = await request(app).post('/api/login').send({username: user.username, password: hashedPassword});

        expect(res.statusCode).toBe(200);
    });
 });
});