var express = require('express');
var router = express.Router();
const User = require('../models/User');
const ProfileComment = require('../models/ProfileComment');
const crypto = require('crypto');
const https = require('https');
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
  } else {
    accountToStore.profilePhoto = await generateDefaultProfilePhoto(accountToStore.userId, accountToStore.username);
  }

  try {
    const savedUser = await createAccount(accountToStore, normalizedUsername, normalizedEmail);

    const token = jwt.sign(
      { userId: savedUser._id, username: savedUser.username, email: savedUser.email, isAdmin: savedUser.isAdmin },
      SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.json({
      status: 'ok',
      message: 'Account created successfully',
      account: {
        userId: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profilePhoto || !user.profilePhoto.data) {
      const fallbackPhoto = await generateDefaultProfilePhoto(user.userId || user._id.toString(), user.username);
      res.set('Content-Type', fallbackPhoto.contentType);
      return res.send(fallbackPhoto.data);
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
      createdAt: user.createdAt,
      resumeText: user.resumeText || '',
      rating: user.rating ?? 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update resume text (owner only)
router.put('/profile/resume', requireAuth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText must be a string' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.resumeText = resumeText;
    await user.save();
    res.json({ success: true, resumeText: user.resumeText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating resume' });
  }
});

function generateUserId() {
  return crypto.randomBytes(16).toString('hex');
}

async function generateDefaultProfilePhoto(seed, username) {
  const dicebearSeed = encodeURIComponent(username || seed || 'user');
  const avatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${dicebearSeed}`;
  const response = await fetchBinary(avatarUrl);

  return {
    data: response.data,
    contentType: response.contentType,
  };
}

async function fetchBinary(url) {
  if (typeof fetch === 'function') {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch avatar: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/svg+xml';
    const data = Buffer.from(await response.arrayBuffer());
    return { data, contentType };
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch avatar: ${response.statusCode}`));
          response.resume();
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve({
            data: Buffer.concat(chunks),
            contentType: response.headers['content-type'] || 'image/svg+xml',
          });
        });
      })
      .on('error', reject);
  });
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
  return result;
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

// User Admin Toggle
router.patch('/toggleAdmin/:userId', requireAuth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const userId = req.params.userId;
        const user = await User.findOne({ userId: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.status(200).json({ message: `User ${user.isAdmin ? 'promoted to' : 'removed from'} admin successfully`, isAdmin: user.isAdmin });
    } catch (error) {
        console.error('Error toggling admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

async function recalculateRating(profileUserId) {
  const ratedComments = await ProfileComment.find({ profileUserId, rating: { $ne: null } });
  const avg = ratedComments.length
    ? ratedComments.reduce((sum, c) => sum + c.rating, 0) / ratedComments.length
    : 0;
  await User.findByIdAndUpdate(profileUserId, { rating: Math.round(avg * 10) / 10 });
}

// GET comments for a profile
router.get('/profile/:username/comments', async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const comments = await ProfileComment.find({ profileUserId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// POST a comment on a profile
router.post('/profile/:username/comments', requireAuth, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    if (text.trim().length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or fewer' });
    }
    if (rating !== undefined && rating !== null) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
    }

    const profileUser = await User.findOne({
      username: { $regex: new RegExp(`^${req.params.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (!profileUser) return res.status(404).json({ error: 'User not found' });

    const author = await User.findById(req.user.userId);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    if (String(author._id) === String(profileUser._id)) {
      return res.status(403).json({ error: 'You cannot comment on your own profile' });
    }

    const comment = await ProfileComment.create({
      profileUserId: profileUser._id,
      authorId: author._id,
      authorUsername: author.username,
      text: text.trim(),
      rating: rating ?? null
    });

    if (rating != null) await recalculateRating(profileUser._id);

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error posting comment' });
  }
});

// DELETE a comment (author or admin only)
router.delete('/profile/:username/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const comment = await ProfileComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isAuthor = String(comment.authorId) === String(req.user.userId);
    if (!isAuthor && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    const hadRating = comment.rating != null;
    const profileUserId = comment.profileUserId;
    await comment.deleteOne();
    if (hadRating) await recalculateRating(profileUserId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting comment' });
  }
});

module.exports = router;