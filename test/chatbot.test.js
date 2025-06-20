/**
 * @jest-environment jsdom
 */

const { processMessage, clearHistory, getHistory, initializeChatbot } = require('../src/chatbot');

describe('Chatbot', () => {
    beforeEach(() => {
        // Clear history before each test
        clearHistory();

        // Reset the internal cached state by requiring the module fresh
        jest.resetModules();
    });

    afterEach(() => {
        jest.resetAllMocks();
        clearHistory();
    });

    describe('initialization', () => {
        beforeEach(() => {
            // Mock fetch for HTML system
            global.fetch = jest.fn();
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html', 'resume.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Test</h1></body></html>'),
                    });
                } else if (url === 'resume.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h2>Resume</h2></body></html>'),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });
        });

        test('should initialize and load HTML files index', async () => {
            const { initializeChatbot } = require('../src/chatbot');
            await initializeChatbot();
            // Should load HTML files index instead of knowledge base
            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
        });

        test('should handle HTML files index loading failure', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({ ok: false, status: 404 });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });

            const { initializeChatbot } = require('../src/chatbot');
            // The function should throw when the index file itself fails
            await expect(initializeChatbot()).rejects.toThrow('Failed to load content files index: 404');
        });
    });

    describe('message processing', () => {
        beforeEach(() => {
            // Mock fetch for HTML system and OpenAI
            global.fetch = jest.fn();
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html', 'resume.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Mihai Popescu</h1><p>Software Developer</p></body></html>'),
                    });
                } else if (url === 'resume.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h2>Experience</h2><p>Ruby, Rails, React</p></body></html>'),
                    });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            choices: [{ message: { content: 'Hello! I am Mihai.' } }],
                        }),
                    });
                } else if (url.includes('github.com/users/mihaip')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ public_repos: 25, followers: 100, following: 50 }),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });
        });

        test('should process messages and return AI response', async () => {
            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('Hello', 'test-api-key');

            expect(response).toBe('Hello! I am Mihai.');

            const { getHistory } = require('../src/chatbot');
            expect(getHistory()).toHaveLength(2);
        });

        test('should include conversation history in subsequent messages', async () => {
            const { processMessage } = require('../src/chatbot');
            await processMessage('Hello', 'test-api-key');
            await processMessage('How are you?', 'test-api-key');

            const { getHistory } = require('../src/chatbot');
            expect(getHistory()).toHaveLength(4); // 2 user + 2 bot messages
        });

        test('should include GitHub stats for relevant messages', async () => {
            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('How many GitHub repositories?', 'test-api-key');

            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle GitHub API errors gracefully', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Test</h1></body></html>'),
                    });
                } else if (url.includes('github.com/users/mihaip')) {
                    return Promise.resolve({ ok: false, status: 404 });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            choices: [{ message: { content: 'GitHub info not available.' } }],
                        }),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });

            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('Tell me about your GitHub', 'test-api-key');

            expect(response).toBe('GitHub info not available.');
        });

        test('should handle API errors gracefully', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Test</h1></body></html>'),
                    });
                } else {
                    return Promise.reject(new Error('API Error'));
                }
            });

            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('Hello', 'test-api-key');

            expect(response).toContain('sorry');
        });

        test('should handle rate limiting', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Test</h1></body></html>'),
                    });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({ ok: false, status: 429 });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });

            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('Hello', 'test-api-key');

            expect(response).toContain('high demand');
        });
    });

    describe('helper methods', () => {
        beforeEach(() => {
            // Mock fetch for HTML system
            global.fetch = jest.fn();
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Test</h1></body></html>'),
                    });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            choices: [{ message: { content: 'Test response' } }],
                        }),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });
        });

        test('should clear conversation history', async () => {
            const { processMessage, clearHistory, getHistory } = require('../src/chatbot');
            // Add some history first
            await processMessage('Hello', 'test-api-key');
            expect(getHistory()).toHaveLength(2);

            clearHistory();

            expect(getHistory()).toEqual([]);
        });

        test('should return conversation history copy', async () => {
            const { processMessage, getHistory } = require('../src/chatbot');
            await processMessage('Hello', 'test-api-key');

            const history = getHistory();

            expect(history).toHaveLength(2);
            expect(history[0].role).toBe('user');
            expect(history[0].content).toBe('Hello');
            expect(history[1].role).toBe('assistant');
        });
    });

    describe('Content loading (HTML and Markdown)', () => {
        const mockContentIndex = ['index.html', 'resume.html', 'contact.html', '2024-2025-work-summary.md'];
        const mockContentFiles = {
            'index.html': '<html><head><title>Mihai Popescu</title></head><body><h1>Welcome</h1><p>I am a Software Developer</p></body></html>',
            'resume.html': '<html><body><h2>Experience</h2><p>Software Developer at Nulogy</p><h2>Skills</h2><p>Ruby, Rails, React</p></body></html>',
            'contact.html': '<html><body><h2>Contact</h2><p>Email: mihai@example.com</p></body></html>',
            '2024-2025-work-summary.md': '# 2024-2025 Work Summary\n\n## Technical Achievements\n- Rails 7.1 upgrade\n- Database performance optimization\n- GraphQL authorization implementation'
        };

        beforeEach(() => {
            global.fetch = jest.fn();
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockContentIndex),
                    });
                } else if (mockContentFiles[url]) {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve(mockContentFiles[url]),
                    });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            choices: [{ message: { content: 'I am Mihai, a software developer with experience at Nulogy.' } }],
                        }),
                    });
                } else if (url.includes('github.com/users/mihaip')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ public_repos: 25, followers: 100, following: 50, created_at: '2020-01-01T00:00:00Z' }),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });
        });

        test('should initialize and load content files from index on first call', async () => {
            const { initializeChatbot } = require('../src/chatbot');
            await initializeChatbot();

            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
            expect(fetch).toHaveBeenCalledWith('index.html');
            expect(fetch).toHaveBeenCalledWith('resume.html');
            expect(fetch).toHaveBeenCalledWith('contact.html');
            expect(fetch).toHaveBeenCalledWith('2024-2025-work-summary.md');
        });

        test('should load content files when processing first message', async () => {
            const { processMessage } = require('../src/chatbot');
            await processMessage('Tell me about yourself', 'test-api-key');

            // Should have loaded the index file and all content files during initialization
            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
            mockContentIndex.forEach(filename => {
                expect(fetch).toHaveBeenCalledWith(filename);
            });
        });

        test('should include content from HTML and markdown files in AI system prompt', async () => {
            const { processMessage } = require('../src/chatbot');
            await processMessage('What is your experience?', 'test-api-key');

            // Find the OpenAI API call
            const openaiCall = global.fetch.mock.calls.find(call =>
                call[0].includes('openai.com')
            );

            expect(openaiCall).toBeTruthy();

            const requestBody = JSON.parse(openaiCall[1].body);
            const systemMessage = requestBody.messages.find(msg => msg.role === 'system');

            // Should include content from all HTML files
            expect(systemMessage.content).toContain('index.html');
            expect(systemMessage.content).toContain('resume.html');
            expect(systemMessage.content).toContain('contact.html');
            expect(systemMessage.content).toContain('Software Developer');
            expect(systemMessage.content).toContain('Software Developer at Nulogy');
            expect(systemMessage.content).toContain('Ruby, Rails, React');

            // Should include content from markdown files
            expect(systemMessage.content).toContain('2024-2025-work-summary.md');
            expect(systemMessage.content).toContain('Rails 7.1 upgrade');
            expect(systemMessage.content).toContain('Database performance optimization');
            expect(systemMessage.content).toContain('GraphQL authorization');
        });

        test('should handle missing HTML files gracefully', async () => {
            // Mock with one missing file - the system should load successfully
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(['index.html', 'missing.html']),
                    });
                } else if (url === 'index.html') {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve('<html><body><h1>Available Content</h1></body></html>'),
                    });
                } else if (url === 'missing.html') {
                    return Promise.resolve({ ok: false, status: 404 });
                } else if (url.includes('openai.com')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            choices: [{ message: { content: 'Response with available content only' } }],
                        }),
                    });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });

            const { processMessage } = require('../src/chatbot');
            const response = await processMessage('Hello', 'test-api-key');

            // Should still work even if some HTML files are missing
            expect(response).toBe('Response with available content only');

            // Should have attempted to load both files during initialization
            expect(fetch).toHaveBeenCalledWith('index.html');
            expect(fetch).toHaveBeenCalledWith('missing.html');
        });

        test('should handle HTML files index loading failure', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === 'html-files-index.json') {
                    return Promise.resolve({ ok: false, status: 404 });
                }
                return Promise.reject(new Error(`Unknown URL: ${url}`));
            });

            const { initializeChatbot } = require('../src/chatbot');
            // This should throw because the index file itself failed
            await expect(initializeChatbot()).rejects.toThrow('Failed to load content files index: 404');
        });

        test('should combine HTML content with GitHub stats when relevant', async () => {
            const { processMessage } = require('../src/chatbot');
            await processMessage('How many GitHub repositories do you have?', 'test-api-key');

            const openaiCall = global.fetch.mock.calls.find(call =>
                call[0].includes('openai.com')
            );

            const requestBody = JSON.parse(openaiCall[1].body);
            const systemMessage = requestBody.messages.find(msg => msg.role === 'system');

            // Should include both HTML content and GitHub stats
            expect(systemMessage.content).toContain('Software Developer'); // From HTML (capitalized)
            expect(systemMessage.content).toContain('25'); // From GitHub stats (public_repos)
        });
    });
}); 