const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// POST /api/applications - Submit a job application (authenticated)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const application = await JobApplication.create({
      userId: req.user.userId,
      jobId,
      resumeId: resumeId || undefined
    });

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }
    console.error('Error creating application:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// GET /api/applications/:username - View all applications sent to jobs owned by :username
router.get('/:username', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user whose jobs we want to see applications for
    const owner = await User.findOne({ username }).populate('createdJobs');
    if (!owner) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the ObjectIds of jobs this user created
    const jobIds = owner.createdJobs.map(j => j._id);

    if (jobIds.length === 0) {
      return res.json([]);
    }

    // Find all applications targeting those jobs, populate applicant + job details
    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company salary location jobType')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
