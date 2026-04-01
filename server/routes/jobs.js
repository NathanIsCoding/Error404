var express = require('express');
var router = express.Router();
const crypto = require('crypto');

const Job = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

router.get('/api/loadJobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/api/my-jobs', requireAuth, async (req, res) => {
    try {
        const myJobs = await Job.find({ createdByUserId: String(req.user.userId) }).sort({ createdAt: -1 });
        return res.json(myJobs);
    } catch (error) {
        console.error('Error fetching my jobs:', error);
        return res.status(500).json({ error: 'Failed to fetch your job listings' });
    }
});

router.post('/api/jobs', requireAuth, async (req, res) => {
    try {
        const { title, company, jobType, industry, salary, location, description, isActive } = req.body;

        if (!title || !company || !jobType || !industry || salary === undefined || !location || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const industryList = Array.isArray(industry)
            ? industry.map((item) => String(item).trim()).filter(Boolean)
            : String(industry)
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);

        if (industryList.length === 0) {
            return res.status(400).json({ error: 'At least one industry is required' });
        }

        const parsedSalary = Number(salary);
        if (!Number.isFinite(parsedSalary) || parsedSalary <= 0) {
            return res.status(400).json({ error: 'Salary must be a positive number' });
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

        return res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job listing:', error);
        return res.status(500).json({ error: 'Failed to create job listing' });
    }
});

router.delete('/api/deleteJob/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const deletedJob = await Job.findOneAndDelete({ jobId: jobId });

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Internal server error' });
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
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
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
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;