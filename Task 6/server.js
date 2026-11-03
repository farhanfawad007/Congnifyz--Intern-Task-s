require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('./models/User');
const { requireAuth, redirectIfAuthenticated } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cognifyz_task6';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cognifyz_dev_secret_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = null;
  res.locals.success = null;
  next();
});

async function connectDatabase() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected to MongoDB');
}

app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { title: 'Register' });
});

app.post('/register', redirectIfAuthenticated, async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'All fields are required.',
        formData: { username, email },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Passwords do not match.',
        formData: { username, email },
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'An account with this email already exists.',
        formData: { username, email },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    req.session.userId = user._id.toString();
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    return res.redirect('/dashboard');
  } catch (err) {
    const message =
      err.code === 11000
        ? 'An account with this email already exists.'
        : err.message || 'Registration failed. Please try again.';

    return res.status(400).render('register', {
      title: 'Register',
      error: message,
      formData: { username, email },
    });
  }
});

app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', redirectIfAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Email and password are required.',
        formData: { email },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        formData: { email },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        formData: { email },
      });
    }

    req.session.userId = user._id.toString();
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;

    return res.redirect(returnTo);
  } catch (err) {
    return res.status(500).render('login', {
      title: 'Login',
      error: 'Login failed. Please try again.',
      formData: { email },
    });
  }
});

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');

    if (!user) {
      req.session.destroy(() => {
        res.redirect('/login');
      });
      return;
    }

    res.render('dashboard', {
      title: 'Dashboard',
      user,
    });
  } catch (err) {
    res.status(500).render('dashboard', {
      title: 'Dashboard',
      error: 'Unable to load dashboard data.',
      user: req.session.user,
    });
  }
});

app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out. Please try again.');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.use((req, res) => {
  res.status(404).send('Page not found');
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);

    if (err.message.includes('querySrv')) {
      console.error('\nTip: Use the standard mongodb:// URI from Atlas (not mongodb+srv) if DNS fails on Windows.');
    }

    if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.error('\nTip: Replace the username in .env with your real Atlas Database User (not <db_username>).');
      console.error('Check Atlas → Database Access for the correct username and password.');
    }

    process.exit(1);
  }
}

startServer();
