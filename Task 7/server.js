require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB Connection Setup ---
const mongoURI = process.env.MONGO_URI;

// We add a check so the app doesn't crash if you haven't replaced <your-cluster-url> yet
if (mongoURI && !mongoURI.includes('<your-cluster-url>')) {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log('Successfully connected to MongoDB!');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error.message);
        });
} else {
    console.log('⚠️ MongoDB connection skipped: Please update <your-cluster-url> and <database-name> in your .env file.');
}
// --------------------------------

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        status: 429,
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

app.use('/api', apiLimiter, apiRoutes);

app.get('/', (req, res) => {
    res.send(`
        <h1>Cognifyz Task 7 API</h1>
        <p>Visit <a href="/api/external-data?api_key=${process.env.API_KEY || 'your_key_here'}">/api/external-data</a> to see the integration in action.</p>
    `);
});

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    if (req.accepts('html')) {
        return res.status(statusCode).render('index', { 
            data: null, 
            error: `Error ${statusCode}: ${errorMessage}` 
        });
    }

    res.status(statusCode).json({
        status: statusCode,
        error: errorMessage
    });
});

app.listen(PORT, () => {
    console.log(`Server is running securely on http://localhost:${PORT}`);
});