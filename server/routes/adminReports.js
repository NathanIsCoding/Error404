var express = require('express');
var router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const ProfileComment = require('../models/ProfileComment');
const SupportTicket = require('../models/SupportTicket');

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };

router.get('/', requireAuth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { range = '30d' } = req.query;

    let dateFilter = {};
    if (range !== 'all' && RANGE_DAYS[range]) {
        const since = new Date();
        since.setDate(since.getDate() - RANGE_DAYS[range]);
        dateFilter = { createdAt: { $gte: since } };
    }

    const [
        totalUsers, newUsers, adminUsers, disabledUsers,
        totalJobs, newJobs, activeJobs,
        totalApplications, newApplications,
        pendingApps, acceptedApps, rejectedApps,
        totalComments, newComments,
        totalTickets, newTickets, openTickets, resolvedTickets,
    ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments(dateFilter),
        User.countDocuments({ isAdmin: true }),
        User.countDocuments({ isDisabled: true }),

        Job.countDocuments({}),
        Job.countDocuments(dateFilter),
        Job.countDocuments({ isActive: true }),

        JobApplication.countDocuments({}),
        JobApplication.countDocuments(dateFilter),
        JobApplication.countDocuments({ status: 'pending' }),
        JobApplication.countDocuments({ status: 'accepted' }),
        JobApplication.countDocuments({ status: 'rejected' }),

        ProfileComment.countDocuments({}),
        ProfileComment.countDocuments(dateFilter),

        SupportTicket.countDocuments({}),
        SupportTicket.countDocuments(dateFilter),
        SupportTicket.countDocuments({ resolved: false }),
        SupportTicket.countDocuments({ resolved: true }),
    ]);

    res.json({
        users: { total: totalUsers, new: newUsers, admin: adminUsers, disabled: disabledUsers },
        jobs: { total: totalJobs, new: newJobs, active: activeJobs },
        applications: { total: totalApplications, new: newApplications, pending: pendingApps, accepted: acceptedApps, rejected: rejectedApps },
        comments: { total: totalComments, new: newComments },
        tickets: { total: totalTickets, new: newTickets, open: openTickets, resolved: resolvedTickets },
    });
});

module.exports = router;
