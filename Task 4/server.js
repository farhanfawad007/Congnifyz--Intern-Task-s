const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const users = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

function validateRegistration(data) {
  const errors = {};
  const { fullName, email, password, confirmPassword, age } = data;

  const trimmedName = (fullName || '').trim();
  if (!trimmedName) {
    errors.fullName = 'Full name is required.';
  } else if (trimmedName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    errors.fullName = 'Full name may only contain letters, spaces, hyphens, and apostrophes.';
  }

  const trimmedEmail = (email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  } else if (users.some((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
    errors.email = 'This email is already registered.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else {
    if (password.length < PASSWORD_RULES.minLength) {
      errors.password = `Password must be at least ${PASSWORD_RULES.minLength} characters.`;
    } else if (!PASSWORD_RULES.hasUppercase.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!PASSWORD_RULES.hasLowercase.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!PASSWORD_RULES.hasNumber.test(password)) {
      errors.password = 'Password must contain at least one number.';
    } else if (!PASSWORD_RULES.hasSpecial.test(password)) {
      errors.password = 'Password must contain at least one special character.';
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const parsedAge = parseInt(age, 10);
  if (age === undefined || age === null || age === '') {
    errors.age = 'Age is required.';
  } else if (Number.isNaN(parsedAge)) {
    errors.age = 'Age must be a valid number.';
  } else if (parsedAge < 13) {
    errors.age = 'You must be at least 13 years old to register.';
  } else if (parsedAge > 120) {
    errors.age = 'Please enter a valid age.';
  }

  return errors;
}

app.get('/', (req, res) => {
  res.render('index', { users });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, users });
});

app.post('/register', (req, res) => {
  const errors = validateRegistration(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const user = {
    id: users.length + 1,
    fullName: req.body.fullName.trim(),
    email: req.body.email.trim().toLowerCase(),
    age: parseInt(req.body.age, 10),
    registeredAt: new Date().toISOString(),
  };

  users.push(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user,
    users,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
