process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const cookieParser = require('cookie-parser');
const accountsRouter = require('../routes/accounts');
const User = require('../models/User');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/accounts', accountsRouter);

function binaryParser(res, callback) {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => callback(null, Buffer.concat(data)));
}

describe('Accounts photo fallback', () => {
  let originalFetch;

  beforeAll(async () => await db.connect());
  afterAll(async () => await db.disconnect());
  afterEach(async () => {
    await db.clear();
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    originalFetch = global.fetch;
  });

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
