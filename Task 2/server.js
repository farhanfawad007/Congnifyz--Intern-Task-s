const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const submissions = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSubmission(data) {
  const errors = [];
  const { name, email, password, age } = data;

  if (!name || !name.trim()) {
    errors.push('Name is required.');
  }

  if (!email || !email.trim()) {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password) {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (age === undefined || age === null || age === '') {
    errors.push('Age is required.');
  } else {
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || !Number.isFinite(ageNum)) {
      errors.push('Age must be a valid number.');
    } else if (ageNum < 18) {
      errors.push('You must be at least 18 years old to register.');
    }
  }

  return errors;
}

app.get('/', (req, res) => {
  res.render('index', {
    errors: [],
    formData: { name: '', email: '', password: '', age: '' },
  });
});

app.post('/submit', (req, res) => {
  const formData = {
    name: req.body.name || '',
    email: req.body.email || '',
    password: req.body.password || '',
    age: req.body.age || '',
  };

  const errors = validateSubmission(formData);

  if (errors.length > 0) {
    return res.render('index', {
      errors,
      formData: {
        name: formData.name,
        email: formData.email,
        password: '',
        age: formData.age,
      },
    });
  }

  const record = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password,
    age: Number(formData.age),
    submittedAt: new Date().toISOString(),
  };

  submissions.push(record);

  res.render('success', { record });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
