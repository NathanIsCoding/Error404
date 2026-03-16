var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
require('dotenv').config();

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('An Error Occured', error);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const fs = require('fs');

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
      },
    });
  });
});

app.post('/api/accounts', (req, res) => {
  const newAccount = req.body;
  // helper that returns the current moment formatted with a fixed
  // "-07:00" offset.  We subtract seven hours from UTC and then
  // append the offset so the resulting string is e.g.
  // "2026-03-10T08:00:00.000-07:00".  This avoids any client-side
  // clock or timezone issues and guarantees the stored value is always
  // in UTC−07:00.
  const getUtcMinus7Timestamp = () => {
    const now = new Date();
    const offsetMs = 7 * 60 * 60 * 1000; // seven hours in milliseconds
    const adjusted = new Date(now.getTime() - offsetMs);
    return adjusted.toISOString().replace('Z', '-07:00');
  };

  // always assign our canonical timestamp regardless of what the client
  // sent (if anything), so that every account has a UTC-7:00 creation time
  newAccount.createdAt = getUtcMinus7Timestamp();
  const filePath = path.join(__dirname, 'public', 'accounts.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading file' });
    }
    let accounts = [];
    try {
      accounts = JSON.parse(data);
    } catch (e) {
      accounts = [];
    }
    accounts.push(newAccount);
    fs.writeFile(filePath, JSON.stringify(accounts, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error writing file' });
      }
      res.json({ 
        status: 'ok', message: 'Account created successfully', 
        account: { 
          username: newAccount.username, 
          email: newAccount.email, 
          createdAt: newAccount.createdAt }}
        );
    });
  });
});

app.get('/api/loadJobs',(req, res) => {
  const filePath = path.join(__dirname, 'public', 'jobs.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const results = JSON.parse(rawData);

  res.json(results);
});

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
