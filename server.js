const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

function createApp() {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.static('dist'));

    // Serve static files from dist directory
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    // Proxy endpoint for OpenAI API
    app.post('/api/chat', async (req, res) => {
        try {
            const { messages, model = 'gpt-3.5-turbo', max_tokens = 150, temperature = 0.7 } = req.body;

            if (!process.env.OPENAI_API_KEY) {
                return res.status(500).json({
                    error: 'OpenAI API key not configured on server'
                });
            }

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({
                    error: 'Messages array is required'
                });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens,
                    temperature,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('OpenAI API error:', response.status, errorData);
                return res.status(response.status).json({
                    error: `OpenAI API error: ${response.status}`,
                    details: errorData
                });
            }

            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Weather endpoint
    app.get('/api/weather', async (req, res) => {
        try {
            const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
            if (!weatherApiKey) {
                return res.status(500).json({ error: 'Weather API not configured' });
            }

            const northYorkId = "6091104";
            const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?id=${northYorkId}&appid=${weatherApiKey}`;

            const response = await fetch(openWeatherApiUrl);
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();
            const weather = data.weather[0];

            res.json({
                description: weather.description,
                iconId: weather.icon,
                iconUrl: `http://openweathermap.org/img/wn/${weather.icon}.png`
            });
        } catch (error) {
            console.error('Weather API error:', error);
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    });

    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            hasApiKey: !!process.env.OPENAI_API_KEY,
            hasWeatherApiKey: !!process.env.OPENWEATHERMAP_API_KEY
        });
    });

    return app;
}

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    const app = createApp();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`OpenAI API key configured: ${!!process.env.OPENAI_API_KEY}`);
    });
}

module.exports = { createApp }; 