/**
 * @jest-environment jsdom
 */

const { Chatbot } = require('../src/chatbot');

describe('Chatbot', () => {
    let chatbot;

    // Reusable mock data
    const mockContentIndex = ['index.html', 'resume.html', '2024-2025-work-summary.md'];
    const mockContentFiles = {
        'index.html': '<html><body><h1>Mihai Popescu</h1><p>Software Developer</p></body></html>',
        'resume.html': '<html><body><h2>Experience</h2><p>Ruby, Rails, React</p></body></html>',
        '2024-2025-work-summary.md': '# Work Summary\n- Rails 7.1 upgrade\n- Database optimization'
    };

    // Helper function to create standard fetch mock
    function createFetchMock(overrides = {}) {
        return jest.fn((url) => {
            // Default responses
            const responses = {
                'html-files-index.json': {
                    ok: true,
                    json: () => Promise.resolve(mockContentIndex)
                },
                '/api/chat': {
                    ok: true,
                    json: () => Promise.resolve({
                        choices: [{ message: { content: 'Hello! I am Mihai.' } }]
                    })
                },
                'https://api.github.com/users/mihaip': {
                    ok: true,
                    json: () => Promise.resolve({
                        public_repos: 25,
                        followers: 100,
                        following: 50,
                        created_at: '2020-01-01T00:00:00Z'
                    })
                }
            };

            // Add content files with proper response format
            Object.keys(mockContentFiles).forEach(filename => {
                responses[filename] = {
                    ok: true,
                    text: () => Promise.resolve(mockContentFiles[filename])
                };
            });

            // Apply overrides
            Object.assign(responses, overrides);

            if (responses[url]) {
                return Promise.resolve(responses[url]);
            }

            return Promise.reject(new Error(`Unmocked URL: ${url}`));
        });
    }

    beforeEach(() => {
        // Create a fresh chatbot instance for each test
        chatbot = new Chatbot();
        global.fetch = createFetchMock();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('initialization', () => {
        test('should load content files index', async () => {
            await chatbot.initialize();
            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
        });

        test('should handle index loading failure', async () => {
            global.fetch = createFetchMock({
                'html-files-index.json': { ok: false, status: 404 }
            });

            await expect(chatbot.initialize()).rejects.toThrow('Failed to load content files index: 404');
        });
    });

    describe('message processing', () => {
        test('should process messages and return AI response', async () => {
            const response = await chatbot.processMessage('Hello');

            expect(response).toBe('Hello! I am Mihai.');
            expect(chatbot.getHistory()).toHaveLength(2); // user + bot message
        });

        test('should maintain conversation history', async () => {
            await chatbot.processMessage('Hello');
            await chatbot.processMessage('How are you?');

            expect(chatbot.getHistory()).toHaveLength(4); // 2 user + 2 bot messages
        });

        test('should include GitHub stats for relevant questions', async () => {
            const response = await chatbot.processMessage('How many GitHub repositories?');

            // Verify GitHub API was called
            expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/mihaip');
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle GitHub API failures gracefully', async () => {
            global.fetch = createFetchMock({
                'https://api.github.com/users/mihaip': { ok: false, status: 404 }
            });

            const response = await chatbot.processMessage('Tell me about your GitHub');
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle server API errors', async () => {
            global.fetch = createFetchMock({
                '/api/chat': Promise.reject(new Error('Network error'))
            });

            const response = await chatbot.processMessage('Hello');
            expect(response).toContain('sorry');
        });

        test('should handle rate limiting', async () => {
            global.fetch = createFetchMock({
                '/api/chat': {
                    ok: false,
                    status: 429,
                    json: () => Promise.resolve({ error: 'Server error: 429' })
                }
            });

            const response = await chatbot.processMessage('Hello');
            expect(response).toContain('high demand');
        });
    });

    describe('helper methods', () => {
        test('should clear conversation history', async () => {
            await chatbot.processMessage('Hello');
            expect(chatbot.getHistory()).toHaveLength(2);

            chatbot.clearHistory();
            expect(chatbot.getHistory()).toEqual([]);
        });

        test('should return conversation history copy', async () => {
            await chatbot.processMessage('Hello');
            const history = chatbot.getHistory();

            expect(history).toHaveLength(2);
            expect(history[0]).toMatchObject({
                role: 'user',
                content: 'Hello'
            });
            expect(history[1]).toMatchObject({
                role: 'assistant',
                content: 'Hello! I am Mihai.'
            });
        });
    });

    describe('content loading', () => {
        test('should load all content files during initialization', async () => {
            await chatbot.initialize();

            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
            mockContentIndex.forEach(filename => {
                expect(fetch).toHaveBeenCalledWith(filename);
            });
        });

        test('should include content in system prompt', async () => {
            await chatbot.processMessage('What is your experience?');

            const apiCall = fetch.mock.calls.find(call => call[0] === '/api/chat');
            expect(apiCall).toBeTruthy();

            const requestBody = JSON.parse(apiCall[1].body);
            const systemMessage = requestBody.messages.find(msg => msg.role === 'system');

            // Verify content from different file types is included
            expect(systemMessage.content).toContain('Software Developer'); // HTML
            expect(systemMessage.content).toContain('Rails 7.1 upgrade'); // Markdown
        });

        test('should combine content with GitHub stats when relevant', async () => {
            await chatbot.processMessage('How many GitHub repositories do you have?');

            const apiCall = fetch.mock.calls.find(call => call[0] === '/api/chat');
            const requestBody = JSON.parse(apiCall[1].body);
            const systemMessage = requestBody.messages.find(msg => msg.role === 'system');

            // Should include both content and GitHub stats
            expect(systemMessage.content).toContain('Software Developer');
            expect(systemMessage.content).toContain('25'); // public_repos
        });
    });
}); 