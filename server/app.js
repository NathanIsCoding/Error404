var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('An Error Occured', error);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const fs = require('fs');
const Job = require('./models/Job');
const User = require('./models/User');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/api/accounts/:lookup', (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, 'public', 'accounts.json');
  const requestedLookup = req.params.lookup.trim();
  const normalizedLookup = requestedLookup.toLowerCase();
  const isEmailLookup = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestedLookup);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    let accounts = [];

    try {
      accounts = JSON.parse(data);
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).json({ error: 'Error parsing accounts data' });
    }

    const matchingAccount = accounts.find((account) => {
      if (isEmailLookup) {
        return typeof account.email === 'string' &&
          account.email.trim().toLowerCase() === normalizedLookup;
      }

      return typeof account.username === 'string' &&
        account.username.trim().toLowerCase() === normalizedLookup;
    });

    if (!matchingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json({
      account: {
        username: matchingAccount.username,
        email: matchingAccount.email,
        createdAt: matchingAccount.createdAt,
        isAdmin: Boolean(matchingAccount.isAdmin),
      },
    });
  });
});

app.post('/api/accounts', async (req, res) => {
  const getUtcMinus7Timestamp = () => {
    const now = new Date();
    const offsetMs = 7 * 60 * 60 * 1000;
    const adjusted = new Date(now.getTime() - offsetMs);
    return adjusted.toISOString().replace('Z', '-07:00');
  };

  const { username, email, password } = req.body;

  // Normalize inputs (from the JSON version)
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  // Validate required fields
  if (!normalizedUsername || !normalizedEmail) {
    return res.status(400).json({ error: 'Username and email are required to create an account' });
  }

  const accountToStore = {
    username: username.trim(),
    email: email.trim(),
    password,
    createdAt: getUtcMinus7Timestamp(),
    isAdmin: false, // all new accounts are non-admin by default
  };

  try {
    await createAccount(accountToStore, normalizedUsername, normalizedEmail);
    res.json({
      status: 'ok',
      message: 'Account created successfully',
      account: {
        username: accountToStore.username,
        email: accountToStore.email,
        createdAt: accountToStore.createdAt,
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

async function createAccount(account, normalizedUsername, normalizedEmail) {
  console.log("Attempting to create account");
  const users = mongoose.connection.client.db("data").collection("users");

  // Check for duplicate username (case-insensitive)
  const existingUsername = await users.findOne({
    username: { $regex: new RegExp(`^${normalizedUsername}$`, 'i') }
  });
  if (existingUsername) {
    const err = new Error('Username already taken');
    err.code = 'USERNAME_TAKEN';
    throw err;
  }

  // Check for duplicate email (case-insensitive)
  const existingEmail = await users.findOne({
    email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
  });
  if (existingEmail) {
    const err = new Error('Email already registered');
    err.code = 'EMAIL_REGISTERED';
    throw err;
  }

  const result = await users.insertOne(account);
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
}

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
        const { jobId } = req.params

        const deletedJob = await Job.findOneAndDelete({ jobId: jobId })

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' })
        }

        res.status(200).json({ message: 'Job deleted successfully' })
    } catch (error) {
        console.error('Error deleting job:', error)
        res.status(500).json({ message: 'Internal server error' })
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
        const { userId } = req.params
        
        const deletedUser = await User.findOneAndDelete({ userId: userId })
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q?.toLowerCase();
    const filePath = path.join(__dirname, 'public', 'jobs.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(rawData);
    console.log(items);
    const results = items.filter(item =>
        item.company.toLowerCase().includes(searchTerm)
    );

    console.log(results);

    res.json(results);
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
