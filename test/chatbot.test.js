/**
 * @jest-environment jsdom
 */

const { Chatbot } = require('../src/chatbot');

describe('Chatbot', () => {
    let chatbot;

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
            events: [
                {
                    type: 'PushEvent',
                    repo: { name: 'MihaiOnSoftware/VRO' },
                    created_at: '2024-06-16T12:00:00.000Z',
                    payload: { commits: [{ message: 'Update documentation' }] },
                },
                {
                    type: 'CreateEvent',
                    repo: { name: 'MihaiOnSoftware/grow-hex-rails' },
                    created_at: '2024-06-11T12:00:00.000Z',
                    payload: { ref_type: 'branch', ref: 'feature/improvements' },
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

    const createSuccessResponse = (data, isJson = true) => ({
        ok: true,
        [isJson ? 'json' : 'text']: () => Promise.resolve(data),
    });

    const createErrorResponse = (status) => ({
        ok: false,
        status,
    });

    const GITHUB_API = {
        BASE_URL: 'https://api.github.com/users/MihaiOnSoftware',
        get PROFILE() { return this.BASE_URL; },
        get REPOS() { return `${this.BASE_URL}/repos?sort=updated&per_page=10`; },
        EVENTS: (since) => `${GITHUB_API.BASE_URL}/events?per_page=100&since=${since}`,
    };

    const MOCK_DATES = {
        CURRENT: new Date('2024-06-21T12:00:00.000Z'),
        THIRTY_DAYS_AGO: new Date('2024-05-22T12:00:00.000Z'),
        get THIRTY_DAYS_AGO_ISO() { return this.THIRTY_DAYS_AGO.toISOString(); },
    };

    const GITHUB_MOCK_DATA = {
        [GITHUB_API.PROFILE]: createSuccessResponse(TEST_DATA.github.profile),
        [GITHUB_API.REPOS]: createSuccessResponse(TEST_DATA.github.repositories),
        [GITHUB_API.EVENTS(MOCK_DATES.THIRTY_DAYS_AGO_ISO)]: createSuccessResponse(TEST_DATA.github.events),
    };

    function createFetchMock(overrides = {}) {
        const defaultResponses = {
            'html-files-index.json': createSuccessResponse(TEST_DATA.content.index),
            'commit-history.json': createSuccessResponse(TEST_DATA.commitHistory),
            '/api/chat': createSuccessResponse(TEST_DATA.api.chat),
            ...GITHUB_MOCK_DATA,
        };

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

    const getApiCall = (url = '/api/chat') => {
        return fetch.mock.calls.find(call => call[0] === url);
    };

    const getSystemMessage = () => {
        const apiCall = getApiCall();
        const requestBody = JSON.parse(apiCall[1].body);
        return requestBody.messages.find(msg => msg.role === 'system');
    };

    const expectGitHubApiCalled = () => {
        expect(fetch).toHaveBeenCalledWith(GITHUB_API.PROFILE);
        expect(fetch).toHaveBeenCalledWith(GITHUB_API.REPOS);
        expect(fetch).toHaveBeenCalledWith(GITHUB_API.EVENTS(MOCK_DATES.THIRTY_DAYS_AGO_ISO));
    };

    const expectSystemMessageContains = (...expectedContent) => {
        const systemMessage = getSystemMessage();
        expect(systemMessage).toBeTruthy();

        expectedContent.forEach(content => {
            expect(systemMessage.content).toContain(content);
        });

        return systemMessage;
    };

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_DATES.CURRENT);

        chatbot = new Chatbot();
        global.fetch = createFetchMock();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

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

            expectGitHubApiCalled();
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should include GitHub stats for website development questions', async () => {
            const response = await chatbot.processMessage('How did you build this website?');

            expectGitHubApiCalled();
            expect(response).toBe('Hello! I am Mihai.');
        });

        test('should handle GitHub API failures gracefully', async () => {
            global.fetch = createFetchMock({
                [GITHUB_API.PROFILE]: createErrorResponse(404),
                [GITHUB_API.REPOS]: createErrorResponse(403),
                [GITHUB_API.EVENTS(MOCK_DATES.THIRTY_DAYS_AGO_ISO)]: createErrorResponse(403),
            });

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

            expectSystemMessageContains('Software Developer', 'Rails 7.1 upgrade');
        });

        test('should include commit history in system prompt', async () => {
            await chatbot.processMessage('Tell me about this website development');

            expectSystemMessageContains(
                'REPOSITORY DEVELOPMENT HISTORY', 'Total commits: 42',
                'Add chatbot functionality', 'RECENT COMMITS'
            );
        });

        test('should combine content with GitHub stats when relevant', async () => {
            await chatbot.processMessage('How many GitHub repositories do you have?');

            expectSystemMessageContains('Software Developer', '13');
        });

        test('should format GitHub data with activity statistics in context', async () => {
            await chatbot.processMessage('Tell me about your GitHub activity');

            expectSystemMessageContains(
                'RECENT REPOSITORIES', 'VRO', 'JavaScript',
                'RECENT ACTIVITY SUMMARY', 'Recent actions: 2', 'Active repositories: 2',
                'Most recent activity:', 'Activity types:'
            );
        });

        test('should display activity summary for non-push events', async () => {
            const nonPushEvents = [
                {
                    type: 'WatchEvent',
                    repo: { name: 'MihaiOnSoftware/some-repo' },
                    created_at: '2023-04-14T20:00:00Z',
                    payload: {},
                },
            ];

            global.fetch = createFetchMock({
                [GITHUB_API.EVENTS(MOCK_DATES.THIRTY_DAYS_AGO_ISO)]:
                    createSuccessResponse(nonPushEvents),
            });

            await chatbot.processMessage('Tell me about your recent GitHub activity');

            expectSystemMessageContains(
                'RECENT ACTIVITY SUMMARY', 'Recent actions: 1', 'Activity types: Watch'
            );
        });

        test('should display note when no recent activity is available', async () => {
            global.fetch = createFetchMock({
                [GITHUB_API.EVENTS(MOCK_DATES.THIRTY_DAYS_AGO_ISO)]:
                    createSuccessResponse([]),
            });

            await chatbot.processMessage('Tell me about your recent GitHub activity');

            const systemMessage = getSystemMessage();


            expect(systemMessage.content).toContain('No recent public GitHub activity to display');
            expect(systemMessage.content).not.toContain('RECENT ACTIVITY SUMMARY');
        });
    });
}); 