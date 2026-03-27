var express = require('express');
var router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
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

    if (user.isDisabled) return res.status(403).json({ error: 'Your account has been disabled' });

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

// Create account endpoint
router.post('/', async (req, res) => {
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
    isAdmin: false, // all new accounts are non-admin by default
  };

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

// User Disable/Enable Toggle
router.patch('/toggleUser/:userId', requireAuth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const userId = req.params.userId;
        const user = await User.findOne({ userId: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isDisabled = !user.isDisabled;
        await user.save();

        res.status(200).json({ message: `User ${user.isDisabled ? 'disabled' : 'enabled'} successfully`, isDisabled: user.isDisabled });
    } catch (error) {
        console.error('Error toggling user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;