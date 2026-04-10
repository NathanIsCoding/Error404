const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Failed', status = 500, data = null) => {
  return res.status(status).json({ success: false, data, message });
};

// GET /api/applications/job/:jobId - View all applications for a specific job (authenticated as job poster)
router.get('/job/:jobId', requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify the job exists and user is the poster
    const job = await Job.findOne({ jobId });
    if (!job) {
      return sendError(res, 'Job not found', 404);
    }
    if (job.createdByUserId !== req.user.userId) {
      return sendError(res, 'Unauthorized to view these applications', 403);
    }

    // Find all applications for this job, populate user details
    const applications = await JobApplication.find({ jobId: job._id })
      .populate('userId', 'username email profilePhoto resumeText')
      .sort({ createdAt: -1 });

    sendSuccess(res, applications);
  } catch (err) {
    console.error('Error fetching applications for job:', err);
    sendError(res, 'Failed to fetch applications', 500);
  }
});

// PATCH /api/applications/:applicationId/status - Accept or reject an application
router.patch('/:applicationId/status', requireAuth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return sendError(res, 'Application not found', 404);
    }

    // verify that the logged in user is the creator of the job
    const job = await Job.findById(application.jobId);
    if (!job) {
      return sendError(res, 'Job not found', 404);
    }
    
    if (job.createdByUserId !== req.user.userId) {
      return sendError(res, 'Unauthorized', 403);
    }

    application.status = status;
    await application.save();

    sendSuccess(res, application, 'Status updated successfully');
  } catch (err) {
    console.error('Error updating application status:', err);
    sendError(res, 'Failed to update status', 500);
  }
});

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
      return res.json({ message: 'Application withdrawn successfully' });
    }
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// GET /api/applications/user/:username - View all applications sent by :username
router.get('/user/:username', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user whose applications we want to see
    const applicant = await User.findOne({ username });
    if (!applicant) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all applications submitted by this user, populate job details
    const applications = await JobApplication.find({ userId: applicant._id })
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
