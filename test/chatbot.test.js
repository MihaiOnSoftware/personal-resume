/**
 * @jest-environment jsdom
 */

const { Chatbot } = require('../src/chatbot');

describe('Chatbot', () => {
    let chatbot;

    // ========================================
    // Mock Data Configuration
    // ========================================
    const TEST_DATA = {
        content: {
            index: ['index.html', 'resume.html', '2024-2025-work-summary.md'],
            files: {
                'index.html': '<html><body><h1>Mihai Popescu</h1><p>Software Developer</p></body></html>',
                'resume.html': '<html><body><h2>Experience</h2><p>Ruby, Rails, React</p></body></html>',
                '2024-2025-work-summary.md': '# Work Summary\n- Rails 7.1 upgrade\n- Database optimization',
            },
        },
        github: {
            profile: {
                public_repos: 13,
                followers: 4,
                following: 0,
                created_at: '2013-05-17T20:37:24Z',
            },
            repositories: [
                {
                    name: 'VRO',
                    description: 'VRO mod for X4 foundations',
                    language: 'JavaScript',
                    stargazers_count: 2,
                    updated_at: '2023-04-14T22:21:23Z',
                },
                {
                    name: 'grow-hex-rails',
                    description: 'An example Rails app grown into hexagonal architecture',
                    language: 'Ruby',
                    stargazers_count: 5,
                    updated_at: '2021-09-29T21:05:54Z',
                },
            ],
            // Raw repository data (before filtering) - includes Nulogy repos
            repositoriesRaw: [
                {
                    name: 'VRO',
                    description: 'VRO mod for X4 foundations',
                    language: 'JavaScript',
                    stargazers_count: 2,
                    updated_at: '2023-04-14T22:21:23Z',
                    html_url: 'https://github.com/MihaiOnSoftware/VRO',
                },
                {
                    name: 'grow-hex-rails',
                    description: 'An example Rails app grown into hexagonal architecture',
                    language: 'Ruby',
                    stargazers_count: 5,
                    updated_at: '2021-09-29T21:05:54Z',
                    html_url: 'https://github.com/MihaiOnSoftware/grow-hex-rails',
                },
                {
                    name: 'nulogy-internal-project',
                    description: 'Internal Nulogy project',
                    language: 'Ruby',
                    stargazers_count: 0,
                    updated_at: '2023-05-01T10:00:00Z',
                    html_url: 'https://github.com/nulogy/internal-project',
                },
                {
                    name: 'barcodeapi-server',
                    description: 'Barcode API server for Nulogy',
                    language: 'Ruby',
                    stargazers_count: 1,
                    updated_at: '2023-04-20T14:30:00Z',
                    html_url: 'https://github.com/nulogy/barcodeapi-server',
                },
            ],
            events: [
                {
                    type: 'PushEvent',
                    repo: { name: 'MihaiOnSoftware/VRO' },
                    created_at: '2023-04-14T20:00:00Z',
                    payload: { commits: [{ message: 'Update documentation' }] },
                },
                {
                    type: 'CreateEvent',
                    repo: { name: 'MihaiOnSoftware/grow-hex-rails' },
                    created_at: '2023-04-13T15:30:00Z',
                    payload: { ref_type: 'branch', ref: 'feature/improvements' },
                },
            ],
            // Raw events data (before filtering) - includes Nulogy events
            eventsRaw: [
                {
                    type: 'PushEvent',
                    repo: { name: 'MihaiOnSoftware/VRO' },
                    created_at: '2023-04-14T20:00:00Z',
                    payload: { commits: [{ message: 'Update documentation' }] },
                },
                {
                    type: 'CreateEvent',
                    repo: { name: 'MihaiOnSoftware/grow-hex-rails' },
                    created_at: '2023-04-13T15:30:00Z',
                    payload: { ref_type: 'branch', ref: 'feature/improvements' },
                },
                {
                    type: 'PushEvent',
                    repo: { name: 'nulogy/barcodeapi-server' },
                    created_at: '2023-04-15T09:00:00Z',
                    payload: { commits: [{ message: 'Fix API endpoint' }] },
                },
                {
                    type: 'CreateEvent',
                    repo: { name: 'nulogy/internal-project' },
                    created_at: '2023-04-12T16:45:00Z',
                    payload: { ref_type: 'branch', ref: 'feature/new-feature' },
                },
            ],
        },
        commitHistory: {
            repository_stats: {
                total_commits: 42,
                first_commit: 'abc123 - Initial commit',
                latest_commit: 'def456 - Add chatbot functionality',
                branches: ['main', 'chatbot', 'feature/improvements'],
            },
            commit_history: [
                'def456 - Mihai, 2023-04-15 : Add chatbot functionality',
                'ghi789 - Mihai, 2023-04-14 : Update documentation',
                'jkl012 - Mihai, 2023-04-13 : Fix navigation issues',
                'mno345 - Mihai, 2023-04-12 : Initial Docker setup',
            ],
        },
        api: {
            chat: {
                choices: [{ message: { content: 'Hello! I am Mihai.' } }],
            },
            errors: {
                network: new Error('Network error'),
                rateLimited: {
                    ok: false,
                    status: 429,
                    json: () => Promise.resolve({ error: 'Server error: 429' }),
                },
            },
        },
    };

    // ========================================
    // Mock Response Builders
    // ========================================
    const createSuccessResponse = (data, isJson = true) => ({
        ok: true,
        [isJson ? 'json' : 'text']: () => Promise.resolve(data),
    });

    const createErrorResponse = (status) => ({
        ok: false,
        status,
    });

    const createGitHubMocks = (options = {}) => {
        const {
            profileFails = false,
            reposFails = false,
            eventsFails = false,
            includeNulogyData = false,
        } = options;

        // Use raw data (with Nulogy) or filtered data based on test needs
        const reposData = includeNulogyData ? TEST_DATA.github.repositoriesRaw : TEST_DATA.github.repositories;
        const eventsData = includeNulogyData ? TEST_DATA.github.eventsRaw : TEST_DATA.github.events;

        return {
            'https://api.github.com/users/MihaiOnSoftware':
                profileFails ? createErrorResponse(404) : createSuccessResponse(TEST_DATA.github.profile),
            'https://api.github.com/users/MihaiOnSoftware/repos?sort=updated&per_page=10':
                reposFails ? createErrorResponse(403) : createSuccessResponse(reposData),
            'https://api.github.com/users/MihaiOnSoftware/events?per_page=5':
                eventsFails ? createErrorResponse(403) : createSuccessResponse(eventsData),
        };
    };

    // ========================================
    // Main Mock Factory
    // ========================================
    function createFetchMock(overrides = {}) {
        const defaultResponses = {
            'html-files-index.json': createSuccessResponse(TEST_DATA.content.index),
            'commit-history.json': createSuccessResponse(TEST_DATA.commitHistory),
            '/api/chat': createSuccessResponse(TEST_DATA.api.chat),
            ...createGitHubMocks(),
        };

        // Add content files
        Object.entries(TEST_DATA.content.files).forEach(([filename, content]) => {
            defaultResponses[filename] = createSuccessResponse(content, false);
        });

        const responses = { ...defaultResponses, ...overrides };

        return jest.fn((url) => {
            if (responses[url]) {
                return Promise.resolve(responses[url]);
            }
            return Promise.reject(new Error(`Unmocked URL: ${url}`));
        });
    }

    // ========================================
    // Test Helpers
    // ========================================
    const getApiCall = (url = '/api/chat') => {
        return fetch.mock.calls.find(call => call[0] === url);
    };

    const getSystemMessage = () => {
        const apiCall = getApiCall();
        if (!apiCall) return null;

        const requestBody = JSON.parse(apiCall[1].body);
        return requestBody.messages.find(msg => msg.role === 'system');
    };

    const expectGitHubApiCalled = (enhanced = false) => {
        expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/MihaiOnSoftware');

        if (enhanced) {
            expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/MihaiOnSoftware/repos?sort=updated&per_page=10');
            expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/MihaiOnSoftware/events?per_page=5');
        }
    };

    // ========================================
    // Test Setup
    // ========================================
    beforeEach(() => {
        chatbot = new Chatbot();
        global.fetch = createFetchMock();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    // ========================================
    // Test Suites
    // ========================================
    describe('initialization', () => {
        test('should load content files index and commit history', async () => {
            await chatbot.initialize();
            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
            expect(fetch).toHaveBeenCalledWith('commit-history.json');
        });

        test('should handle index loading failure', async () => {
            global.fetch = createFetchMock({
                'html-files-index.json': createErrorResponse(404),
            });

            await expect(chatbot.initialize()).rejects.toThrow('Failed to load content files index: 404');
        });
    });

    describe('message processing', () => {
        test('should process messages and return AI response', async () => {
            const response = await chatbot.processMessage('Hello');

            expect(response).toBe('Hello! I am Mihai.');
            expect(chatbot.getHistory()).toHaveLength(2);
        });

        test('should maintain conversation history', async () => {
            await chatbot.processMessage('Hello');
            await chatbot.processMessage('How are you?');

            expect(chatbot.getHistory()).toHaveLength(4);
        });

        test('should include GitHub stats for relevant questions', async () => {
            const response = await chatbot.processMessage('How many GitHub repositories?');

            expectGitHubApiCalled(true);
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should include GitHub stats for website development questions', async () => {
            const response = await chatbot.processMessage('How did you build this website?');

            expectGitHubApiCalled(true);
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle GitHub API failures gracefully', async () => {
            global.fetch = createFetchMock(createGitHubMocks({
                profileFails: true,
                reposFails: true,
                eventsFails: true,
            }));

            const response = await chatbot.processMessage('Tell me about your GitHub');
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle server API errors', async () => {
            global.fetch = createFetchMock({
                '/api/chat': Promise.reject(TEST_DATA.api.errors.network),
            });

            const response = await chatbot.processMessage('Hello');
            expect(response).toContain('sorry');
        });

        test('should handle rate limiting', async () => {
            global.fetch = createFetchMock({
                '/api/chat': TEST_DATA.api.errors.rateLimited,
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
                content: 'Hello',
            });
            expect(history[1]).toMatchObject({
                role: 'assistant',
                content: 'Hello! I am Mihai.',
            });
        });
    });

    describe('content loading', () => {
        test('should load all content files during initialization', async () => {
            await chatbot.initialize();

            expect(fetch).toHaveBeenCalledWith('html-files-index.json');
            TEST_DATA.content.index.forEach(filename => {
                expect(fetch).toHaveBeenCalledWith(filename);
            });
        });

        test('should include content in system prompt', async () => {
            await chatbot.processMessage('What is your experience?');

            const systemMessage = getSystemMessage();
            expect(systemMessage.content).toContain('Software Developer');
            expect(systemMessage.content).toContain('Rails 7.1 upgrade');
        });

        test('should include commit history in system prompt', async () => {
            await chatbot.processMessage('Tell me about this website development');

            const systemMessage = getSystemMessage();
            expect(systemMessage.content).toContain('REPOSITORY DEVELOPMENT HISTORY');
            expect(systemMessage.content).toContain('Total commits: 42');
            expect(systemMessage.content).toContain('Add chatbot functionality');
            expect(systemMessage.content).toContain('RECENT COMMITS');
        });

        test('should combine content with GitHub stats when relevant', async () => {
            await chatbot.processMessage('How many GitHub repositories do you have?');

            const systemMessage = getSystemMessage();
            expect(systemMessage.content).toContain('Software Developer');
            expect(systemMessage.content).toContain('13'); // public_repos from TEST_DATA
        });

        test('should format GitHub data with activity statistics in context', async () => {
            await chatbot.processMessage('Tell me about your GitHub activity');

            const systemMessage = getSystemMessage();

            // Should include repositories
            expect(systemMessage.content).toContain('RECENT REPOSITORIES');
            expect(systemMessage.content).toContain('VRO');
            expect(systemMessage.content).toContain('JavaScript');

            // Should include activity statistics
            expect(systemMessage.content).toContain('RECENT ACTIVITY SUMMARY');
            expect(systemMessage.content).toContain('Recent actions: 2');
            expect(systemMessage.content).toContain('Active repositories: 2');
            expect(systemMessage.content).toContain('Most recent activity:');
            expect(systemMessage.content).toContain('Activity types:');
        });







        test('should display activity summary for non-push events', async () => {
            // Mock with non-push events only
            const nonPushEvents = [
                {
                    type: 'WatchEvent',
                    repo: { name: 'MihaiOnSoftware/some-repo' },
                    created_at: '2023-04-14T20:00:00Z',
                    payload: {},
                },
            ];

            global.fetch = createFetchMock({
                'https://api.github.com/users/MihaiOnSoftware/events?per_page=5':
                    createSuccessResponse(nonPushEvents),
            });

            await chatbot.processMessage('Tell me about your recent GitHub activity');

            const systemMessage = getSystemMessage();

            // Should show activity summary even for non-push events
            expect(systemMessage.content).toContain('RECENT ACTIVITY SUMMARY');
            expect(systemMessage.content).toContain('Recent actions: 1');
            expect(systemMessage.content).toContain('Activity types: Watch');
        });

        test('should display note when no recent activity is available', async () => {
            // Mock with empty events array
            global.fetch = createFetchMock({
                'https://api.github.com/users/MihaiOnSoftware/events?per_page=5':
                    createSuccessResponse([]),
            });

            await chatbot.processMessage('Tell me about your recent GitHub activity');

            const systemMessage = getSystemMessage();

            // Should include the helpful note
            expect(systemMessage.content).toContain('No recent public GitHub activity to display');
            expect(systemMessage.content).not.toContain('RECENT ACTIVITY SUMMARY');
        });
    });
}); 