var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const fs = require('fs');
var cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });


// connect to mongodb
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('An Error Occured', error);
});

// routers (Going forward put your routers here)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountsRouter = require('./routes/accounts');

const Job = require('./models/Job');
const User = require('./models/User');
const Ticket = require('./models/SupportTicket')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/accounts', accountsRouter);

// Jobs Get
app.get('/api/loadJobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Jobs delete
app.delete('/api/deleteJob/:jobId', async (req, res) => {
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
})

// User Get
app.get('/api/loadUsers', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// User Delete
app.delete('/api/deleteUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const deletedUser = await User.findOneAndDelete({ userId: userId });
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Ticket Get
app.get('/api/loadTickets', async (req, res) => {
  try {
    const Tickets = await Ticket.find();
    res.json(Tickets);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Ticket Delete
app.delete('/api/deleteTicket/:ticketId', async (req, res) => {
    try {
        const ticketId = req.params.ticketId;

        const deletedTicket = await Ticket.findOneAndDelete({ ticketId: ticketId });
        
        if (!deletedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Search jobs from MongoDB with filters
app.get('/api/search', async (req, res) => {
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

// Job Update
app.put('/api/updateJob/:jobId', async (req, res) => {
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;
