const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Request failed', status = 500, data = null) => {
  return res.status(status).json({ success: false, data, message });
};

// POST /api/applications - Submit a job application (authenticated)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId) {
      return sendError(res, 'jobId is required', 400);
    }

    const application = await JobApplication.create({
      userId: req.user.userId,
      jobId,
      resumeId: resumeId || undefined
    });

    return sendSuccess(res, application, 'Application created successfully', 201);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 'You have already applied to this job', 409);
    }
    console.error('Error creating application:', err);
    return sendError(res, 'Failed to create application');
  }
});

// DELETE /api/applications/:jobId - Withdraw a job application (authenticated)
router.delete('/:jobId', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;

    const application = await JobApplication.findOneAndDelete({
      userId: req.user.userId,
      jobId
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    } else {
      return sendSuccess(res, null, 'Application withdrawn successfully');
    }
  } catch (err) {
    console.error('Error deleting application:', err);
      return sendError(res, 'Failed to delete application', 500);
  }
});

// GET /api/applications/:username - View all applications sent by :username
router.get('/:username', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user whose applications we want to see
    const applicant = await User.findOne({ username });
    if (!applicant) {
      return sendError(res, 'User not found', 404);
    }

    // Find all applications submitted by this user, populate job details
    const applications = await JobApplication.find({ userId: applicant._id })
      .populate('jobId', 'title company salary location jobType')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, applications, 'Applications fetched successfully');
  } catch (err) {
    console.error('Error fetching applications:', err);
    return sendError(res, 'Failed to fetch applications');
  }
});

module.exports = router;
