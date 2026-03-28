var express = require('express');
var router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');

// jwt stuff
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!user) return res.status(404).json({ error: 'Account not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Password incorrect' });

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
      SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.json({ success: true });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, username: req.user.username, isAdmin: req.user.isAdmin });
});

router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ success: true });
});

// Multer config — store in memory for writing to MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// Create account endpoint
router.post('/', upload.single('profilePhoto'), async (req, res) => {
  const getUtcMinus7Timestamp = () => {
    const now = new Date();
    const offsetMs = 7 * 60 * 60 * 1000;
    const adjusted = new Date(now.getTime() - offsetMs);
    return adjusted.toISOString().replace('Z', '-07:00');
  };

  const { username, email, password } = req.body;

  // Normalize inputs
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  // Validate required fields
  if (!normalizedUsername || !normalizedEmail) {
    return res.status(400).json({ error: 'Username and email are required to create an account' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const accountToStore = {
    userId: generateUserId(),
    username: username.trim(),
    email: email.trim(),
    password: hashedPassword,
    createdAt: getUtcMinus7Timestamp(),
    isAdmin: false,
  };

  if (req.file) {
    accountToStore.profilePhoto = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  try {
    await createAccount(accountToStore, normalizedUsername, normalizedEmail);
    res.json({
      status: 'ok',
      message: 'Account created successfully',
      account: {
        userId: accountToStore.userId,
        username: accountToStore.username,
        email: accountToStore.email,
        createdAt: accountToStore.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 'USERNAME_TAKEN') {
      return res.status(409).json({ error: 'Your account was not created because this username is already taken' });
    }
    if (err.code === 'EMAIL_REGISTERED') {
      return res.status(409).json({ error: 'Your account was not created because this email is already registered with a different account' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error creating account' });
  }
});

// Serve profile photo by user ID
router.get('/:id/photo', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePhoto || !user.profilePhoto.data) {
      return res.status(404).json({ error: 'No photo found' });
    }
    res.set('Content-Type', user.profilePhoto.contentType);
    res.send(user.profilePhoto.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching photo' });
  }
});

// Get public profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      userId: user._id,
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

function generateUserId() {
  return crypto.randomBytes(16).toString('hex');
}

async function createAccount(account, normalizedUsername, normalizedEmail) {
  const existingUsername = await User.findOne({
    username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') }
  });
  if (existingUsername) {
    const err = new Error('Username already taken');
    err.code = 'USERNAME_TAKEN';
    throw err;
  }

  const existingEmail = await User.findOne({
    email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
  });
  if (existingEmail) {
    const err = new Error('Email already registered');
    err.code = 'EMAIL_REGISTERED';
    throw err;
  }

  const result = await User.create(account);
  console.log(`A document was inserted with the _id: ${result._id}`);
}

module.exports = router;