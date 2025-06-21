const request = require('supertest');

// Mock dotenv before requiring the server
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

// Mock fetch for OpenAI API calls
global.fetch = jest.fn();

describe('Server Integration Tests', () => {
    let app;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset environment variables
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPENWEATHERMAP_API_KEY;
        delete process.env.PORT;

        // Import the actual server app
        const { createApp } = require('../server.js');
        app = createApp();
    });

    describe('GET /api/health', () => {
        test('should return health status without API key', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'ok',
                hasApiKey: false,
                hasWeatherApiKey: false,
            });
            expect(response.body.timestamp).toBeDefined();
        });

        test('should return health status with API key', async () => {
            process.env.OPENAI_API_KEY = 'test-key';

            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'ok',
                hasApiKey: true,
                hasWeatherApiKey: false,
            });
        });

        test('should return health status with weather API key', async () => {
            process.env.OPENWEATHERMAP_API_KEY = 'test-weather-key';

            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'ok',
                hasApiKey: false,
                hasWeatherApiKey: true,
            });
        });
    });

    describe('POST /api/chat', () => {
        beforeEach(() => {
            process.env.OPENAI_API_KEY = 'test-openai-key';
        });

        test('should proxy successful OpenAI API request', async () => {
            const mockOpenAIResponse = {
                choices: [{ message: { content: 'Hello! I am Mihai.' } }],
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockOpenAIResponse),
            });

            const requestBody = {
                messages: [
                    { role: 'system', content: 'You are Mihai' },
                    { role: 'user', content: 'Hello' },
                ],
            };

            const response = await request(app)
                .post('/api/chat')
                .send(requestBody)
                .expect(200);

            expect(response.body).toEqual(mockOpenAIResponse);

            // Verify the OpenAI API was called correctly
            expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-openai-key',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: requestBody.messages,
                    max_tokens: 150,
                    temperature: 0.7,
                }),
            });
        });

        test('should handle custom model parameters', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ choices: [{ message: { content: 'Test' } }] }),
            });

            const requestBody = {
                messages: [{ role: 'user', content: 'Test' }],
                model: 'gpt-4',
                max_tokens: 200,
                temperature: 0.5,
            };

            await request(app)
                .post('/api/chat')
                .send(requestBody)
                .expect(200);

            const fetchCall = global.fetch.mock.calls[0];
            const requestBodySent = JSON.parse(fetchCall[1].body);

            expect(requestBodySent).toMatchObject({
                model: 'gpt-4',
                max_tokens: 200,
                temperature: 0.5,
            });
        });

        test('should return 500 when API key is not configured', async () => {
            delete process.env.OPENAI_API_KEY;

            const response = await request(app)
                .post('/api/chat')
                .send({ messages: [{ role: 'user', content: 'Hello' }] })
                .expect(500);

            expect(response.body).toEqual({
                error: 'OpenAI API key not configured on server',
            });

            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('should return 400 when messages array is missing', async () => {
            const response = await request(app)
                .post('/api/chat')
                .send({})
                .expect(400);

            expect(response.body).toEqual({
                error: 'Messages array is required',
            });

            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('should return 400 when messages is not an array', async () => {
            const response = await request(app)
                .post('/api/chat')
                .send({ messages: 'not an array' })
                .expect(400);

            expect(response.body).toEqual({
                error: 'Messages array is required',
            });
        });

        test('should handle OpenAI API errors', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: () => Promise.resolve('Rate limit exceeded'),
            });

            const response = await request(app)
                .post('/api/chat')
                .send({ messages: [{ role: 'user', content: 'Hello' }] })
                .expect(429);

            expect(response.body).toEqual({
                error: 'OpenAI API error: 429',
                details: 'Rate limit exceeded',
            });
        });

        test('should handle network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const response = await request(app)
                .post('/api/chat')
                .send({ messages: [{ role: 'user', content: 'Hello' }] })
                .expect(500);

            expect(response.body).toEqual({
                error: 'Internal server error',
                message: 'Network error',
            });
        });

        test('should handle malformed JSON in request body', async () => {
            const response = await request(app)
                .post('/api/chat')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);

            expect(response.body).toBeDefined();
        });
    });

    describe('CORS', () => {
        test('should include CORS headers', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        test('should handle preflight requests', async () => {
            const response = await request(app)
                .options('/api/chat')
                .expect(204);

            expect(response.status).toBe(204);
        });
    });

    describe('Error handling', () => {
        test('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/api/unknown')
                .expect(404);

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/weather', () => {
        beforeEach(() => {
            process.env.OPENWEATHERMAP_API_KEY = 'test-weather-key';
        });

        test('should return weather data successfully', async () => {
            const mockWeatherResponse = {
                weather: [{
                    description: 'clear sky',
                    icon: '01d',
                }],
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockWeatherResponse),
            });

            const response = await request(app)
                .get('/api/weather')
                .expect(200);

            expect(response.body).toEqual({
                description: 'clear sky',
                iconId: '01d',
                iconUrl: 'http://openweathermap.org/img/wn/01d.png',
            });

            // Verify the OpenWeatherMap API was called correctly
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.openweathermap.org/data/2.5/weather?id=6091104&appid=test-weather-key',
            );
        });

        test('should return 500 when weather API key is not configured', async () => {
            delete process.env.OPENWEATHERMAP_API_KEY;

            const response = await request(app)
                .get('/api/weather')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Weather API not configured',
            });

            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('should handle weather API errors', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
            });

            const response = await request(app)
                .get('/api/weather')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to fetch weather data',
            });
        });

        test('should handle network errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const response = await request(app)
                .get('/api/weather')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Failed to fetch weather data',
            });
        });
    });

    describe('Static file serving', () => {
        test('should configure static file middleware', async () => {
            // Verify that the static middleware is configured
            // We can't easily test actual file serving without real files,
            // but we can verify the middleware is set up
            expect(app._router).toBeDefined();

            // The static middleware should be in the stack
            const staticMiddleware = app._router.stack.find(layer =>
                layer.name === 'serveStatic' ||
                (layer.handle && layer.handle.name === 'serveStatic'),
            );
            expect(staticMiddleware).toBeDefined();
        });
    });
}); 