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

app.post('/api/accounts', async (req, res) => {
  const getUtcMinus7Timestamp = () => {
    const now = new Date();
    const offsetMs = 7 * 60 * 60 * 1000;
    const adjusted = new Date(now.getTime() - offsetMs);
    return adjusted.toISOString().replace('Z', '-07:00');
  };

  const newAccount = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    createdAt: getUtcMinus7Timestamp(),
  };

  try {
    await createAccount(newAccount);
    res.json({ status: 'ok', message: 'Account created successfully', account: newAccount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating account' });
  }
});

async function createAccount(account) {
  console.log("Attempting to create account");
  const users = mongoose.connection.client.db("data").collection("users");
  const result = await users.insertOne(account);
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
}

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
  res.render('error');
});

module.exports = app;
