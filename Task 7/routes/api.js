const express = require('express');
const axios = require('axios');
const router = express.Router();

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.query.api_key || req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
        const err = new Error('Unauthorized: API key is missing.');
        err.status = 401;
        return next(err);
    }

    if (apiKey !== validApiKey) {
        const err = new Error('Forbidden: Invalid API key.');
        err.status = 403;
        return next(err);
    }
    next();
};

router.get('/external-data', authenticateApiKey, async (req, res, next) => {
    try {
        // Updated to fetch your specific GitHub profile!
        const githubUser = 'farhanfawad007';
        const response = await axios.get(`https://api.github.com/users/${githubUser}`, {
            timeout: 5000
        });

        const externalData = response.data;

        const formattedData = {
            username: externalData.login,
            name: externalData.name || externalData.login,
            avatar_url: externalData.avatar_url,
            bio: externalData.bio || 'No bio available.',
            public_repos: externalData.public_repos,
            profile_url: externalData.html_url
        };

        res.render('index', { data: formattedData, error: null });

    } catch (error) {
        let errorMessage = 'Failed to fetch data from external API.';
        if (error.response) {
            errorMessage = `External API Error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'External API request timed out.';
        }
        
        const err = new Error(errorMessage);
        err.status = 502;
        next(err);
    }
});

module.exports = router;