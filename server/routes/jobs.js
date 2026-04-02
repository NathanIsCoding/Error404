var express = require('express');
var router = express.Router();
const crypto = require('crypto');

const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data, message = 'OK', status = 200) => {
    return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Request failed', status = 500, data = null) => {
    return res.status(status).json({ success: false, data, message });
};

router.get('/api/loadJobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    return sendSuccess(res, jobs, 'Jobs fetched successfully');
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return sendError(res, 'Failed to fetch jobs');
  }
});

router.get('/api/my-jobs', requireAuth, async (req, res) => {
    try {
        const myJobs = await Job.find({ createdByUserId: String(req.user.userId) }).sort({ createdAt: -1 });
        return sendSuccess(res, myJobs, 'Jobs fetched successfully');
    } catch (error) {
        console.error('Error fetching my jobs:', error);
        return sendError(res, 'Failed to fetch your job listings');
    }
});

router.post('/api/jobs', requireAuth, async (req, res) => {
    try {
        const { title, company, jobType, industry, salary, location, description, isActive } = req.body;

        if (!title || !company || !jobType || !industry || salary === undefined || !location || !description) {
            return sendError(res, 'Missing required fields', 400);
        }

        const industryList = Array.isArray(industry)
            ? industry.map((item) => String(item).trim()).filter(Boolean)
            : String(industry)
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);

        if (industryList.length === 0) {
            return sendError(res, 'At least one industry is required', 400);
        }

        const parsedSalary = Number(salary);
        if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
            return sendError(res, 'Salary must be a positive number', 400);
        }

        const newJob = await Job.create({
            jobId: crypto.randomBytes(16).toString('hex'),
            title: String(title).trim(),
            company: String(company).trim(),
            jobType: String(jobType).trim(),
            industry: industryList,
            salary: parsedSalary,
            location: String(location).trim(),
            description: String(description).trim(),
            createdByUserId: String(req.user.userId),
            createdByUsername: req.user.username,
            isActive: typeof isActive === 'boolean' ? isActive : true,
        });

        return sendSuccess(res, newJob, 'Job created successfully', 201);
    } catch (error) {
        console.error('Error creating job listing:', error);
        return sendError(res, 'Failed to create job listing');
    }
});

router.delete('/api/deleteJob/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const deletedJob = await Job.findOneAndDelete({ jobId: jobId });

        if (!deletedJob) {
            return sendError(res, 'Job not found', 404);
        }

        return sendSuccess(res, deletedJob, 'Job deleted successfully');
    } catch (error) {
        console.error('Error deleting job:', error);
        return sendError(res, 'Internal server error');
    }
});

router.get('/api/search', async (req, res) => {
    try {
        const { q, jobType, industry, salary } = req.query;
        const filter = {};

        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { title: regex },
                { company: regex },
                { description: regex }
            ];
        }

        if (jobType) {
            filter.jobType = jobType;
        }

        if (industry) {
            filter.industry = industry;
        }

        if (salary && Number(salary) > 0) {
            filter.salary = { $gte: Number(salary) };
        }

        const results = await Job.find(filter);
        return sendSuccess(res, results, 'Search completed successfully');
    } catch (error) {
        console.error('Search error:', error);
        return sendError(res, 'Search failed');
    }
});

router.put('/api/updateJob/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const updates = req.body;

        const updatedJob = await Job.findOneAndUpdate(
            { jobId: jobId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return sendError(res, 'Job not found', 404);
        }

        return sendSuccess(res, updatedJob, 'Job updated successfully');
    } catch (error) {
        console.error('Error updating job:', error);
        return sendError(res, 'Internal server error');
    }
});

module.exports = router;