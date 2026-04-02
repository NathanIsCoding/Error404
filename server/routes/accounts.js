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

const sendSuccess = (res, data, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Request failed', status = 500, data = null) => {
  return res.status(status).json({ success: false, data, message });
};

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!user) return sendError(res, 'Account not found', 404);

    if (user.isDisabled) return sendError(res, 'Your account has been disabled', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 'Password incorrect', 401);

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

    return sendSuccess(res, null, 'Login successful');

  } catch (err) {
    console.error('Database error:', err);
    return sendError(res, 'Internal server error');
  }
});

router.get('/me', requireAuth, (req, res) => {
  return sendSuccess(res, { userId: req.user.userId, username: req.user.username, isAdmin: req.user.isAdmin }, 'Fetched user successfully');
});

router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  return sendSuccess(res, null, 'Logged out successfully');
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
    return sendError(res, 'Username and email are required to create an account', 400);
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
    return sendSuccess(res, {
        userId: accountToStore.userId,
        username: accountToStore.username,
        email: accountToStore.email,
        createdAt: accountToStore.createdAt,
      }, 'Account created successfully', 201);
  } catch (err) {
    if (err.code === 'USERNAME_TAKEN') {
      return sendError(res, 'Your account was not created because this username is already taken', 409);
    }
    if (err.code === 'EMAIL_REGISTERED') {
      return sendError(res, 'Your account was not created because this email is already registered with a different account', 409);
    }
    console.error(err);
    return sendError(res, 'Error creating account');
  }
});

// Serve profile photo by user ID
router.get('/:id/photo', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePhoto || !user.profilePhoto.data) {
      return sendError(res, 'No photo found', 404);
    }
    res.set('Content-Type', user.profilePhoto.contentType);
    res.send(user.profilePhoto.data);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error fetching photo');
  }
});

// Get public profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, {
      userId: user._id,
      username: user.username,
      createdAt: user.createdAt,
      resumeText: user.resumeText || ''
    }, 'Profile fetched successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error fetching profile');
  }
});

// Update resume text (owner only)
router.put('/profile/resume', requireAuth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (typeof resumeText !== 'string') {
      return sendError(res, 'resumeText must be a string', 400);
    }
    const user = await User.findById(req.user.userId);
    if (!user) return sendError(res, 'User not found', 404);
    user.resumeText = resumeText;
    await user.save();
    return sendSuccess(res, { resumeText: user.resumeText }, 'Resume updated successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error updating resume');
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
              return sendError(res, 'Admin access required', 403);
          }

          const userId = req.params.userId;
          const user = await User.findOne({ userId: userId });

          if (!user) {
              return sendError(res, 'User not found', 404);
          }

          user.isDisabled = !user.isDisabled;
          await user.save();

          return sendSuccess(res, { isDisabled: user.isDisabled }, `User ${user.isDisabled ? 'disabled' : 'enabled'} successfully`);
      } catch (error) {
          console.error('Error toggling user:', error);
          return sendError(res, 'Internal server error');
      }
});

module.exports = router;