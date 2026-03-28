const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

// GET /api/users/:username/jobs - List jobs posted by a user (public)
router.get('/:username/jobs', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const jobs = await Job.find({ postedBy: user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching user jobs:', err);
    res.status(500).json({ error: 'Failed to fetch user jobs' });
  }
});

// POST /api/users/:username/jobs - Post a job as a user (must be logged in as that user)
router.post('/:username/jobs', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only post jobs as yourself' });
    }
    const { title, company, jobType, industry, salary, location, description } = req.body;
    if (!title || !company || !jobType || !industry || !salary || !location || !description) {
      return res.status(400).json({ error: 'Missing required job fields' });
    }
    const job = await Job.create({
      jobId: crypto.randomBytes(16).toString('hex'),
      title,
      company,
      jobType,
      industry,
      salary,
      location,
      description,
      postedBy: user._id
    });
    // Add job to user's createdJobs array
    user.createdJobs.push(job._id);
    await user.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Error posting job:', err);
    res.status(500).json({ error: 'Failed to post job' });
  }
});

module.exports = router;
