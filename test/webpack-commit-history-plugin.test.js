/**
 * @jest-environment node
 */

describe('CommitHistoryPlugin', () => {
    let CommitHistoryPlugin;
    let mockFetch;

    const TEST_DATA = {
        github: {
            repository: {
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-12-01T00:00:00Z',
            },
            commits: [
                {
                    sha: 'abc1234567890',
                    commit: {
                        message: 'Add new feature\n\nDetailed description',
                        author: {
                            name: 'Test User',
                            date: '2023-12-01T10:00:00Z',
                        },
                    },
                },
                {
                    sha: 'def9876543210',
                    commit: {
                        message: 'Fix bug in component',
                        author: {
                            name: 'Another User',
                            date: '2023-11-30T15:30:00Z',
                        },
                    },
                },
            ],
            branches: [
                { name: 'main' },
                { name: 'feature/test' },
                { name: 'develop' },
            ],
        },
        env: {
            GITHUB_TOKEN: 'test-token-123',
            GITHUB_OWNER: 'TestOwner',
            GITHUB_REPO: 'test-repo',
        },
    };

    const createMockResponse = (data, ok = true, status = 200) => ({
        ok,
        status,
        json: () => Promise.resolve(data),
    });

    const setupSuccessfulMocks = () => {
        mockFetch
            .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.repository))
            .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.commits))
            .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.branches));
    };

    const createCommits = (count, prefix = 'commit') => {
        return Array.from({ length: count }, (_, i) => ({
            sha: `${prefix}${i.toString().padStart(3, '0')}1234567890`,
            commit: {
                message: `${prefix} ${i + 1}`,
                author: {
                    name: 'Test User',
                    date: '2023-11-15T10:00:00Z',
                },
            },
        }));
    };

    const setupPaginationMocks = (page1Commits, page2Commits) => {
        mockFetch
            .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.repository))
            .mockResolvedValueOnce(createMockResponse(page1Commits))
            .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.branches))
            .mockResolvedValueOnce(createMockResponse(page2Commits));
    };

    beforeEach(() => {
        process.env.GITHUB_TOKEN = TEST_DATA.env.GITHUB_TOKEN;
        process.env.GITHUB_OWNER = TEST_DATA.env.GITHUB_OWNER;
        process.env.GITHUB_REPO = TEST_DATA.env.GITHUB_REPO;

        mockFetch = jest.fn();
        global.fetch = mockFetch;

        CommitHistoryPlugin = require('../src/webpack-commit-history-plugin');
    });

    afterEach(() => {
        delete process.env.GITHUB_TOKEN;
        delete process.env.GITHUB_OWNER;
        delete process.env.GITHUB_REPO;
        jest.restoreAllMocks();
    });

    describe('fetchGitHubCommitHistory', () => {
        test('should fetch and format commit history successfully', async () => {
            setupSuccessfulMocks();
            const plugin = new CommitHistoryPlugin();

            const result = await plugin.fetchGitHubCommitHistory();

            expect(result).toEqual({
                repository_stats: {
                    total_commits: 2,
                    first_commit: 'def9876 - Fix bug in component',
                    latest_commit: 'abc1234 - Add new feature',
                    branches: ['main', 'feature/test', 'develop'],
                    created_at: '2023-01-01T00:00:00Z',
                    updated_at: '2023-12-01T00:00:00Z',
                },
                commit_history: [
                    'abc1234 - Test User, 2023-12-01 : Add new feature',
                    'def9876 - Another User, 2023-11-30 : Fix bug in component',
                ],
            });
        });

        test('should make correct GitHub API calls with proper headers', async () => {
            setupSuccessfulMocks();
            const plugin = new CommitHistoryPlugin();

            await plugin.fetchGitHubCommitHistory();

            const expectedHeaders = {
                'Authorization': 'Bearer test-token-123',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'personal-resume-build',
            };

            const expectedCalls = [
                'https://api.github.com/repos/TestOwner/test-repo',
                'https://api.github.com/repos/TestOwner/test-repo/commits?per_page=100&page=1',
                'https://api.github.com/repos/TestOwner/test-repo/branches',
            ];

            expect(mockFetch).toHaveBeenCalledTimes(3);
            expectedCalls.forEach(url => {
                expect(mockFetch).toHaveBeenCalledWith(url, { headers: expectedHeaders });
            });
        });

        test('should throw error when GITHUB_TOKEN is missing', async () => {
            delete process.env.GITHUB_TOKEN;
            const plugin = new CommitHistoryPlugin();

            await expect(plugin.fetchGitHubCommitHistory()).rejects.toThrow(
                'GITHUB_TOKEN environment variable is required',
            );
        });

        test.each([
            ['repository', 0, 404],
            ['commits', 1, 403],
            ['branches', 2, 500],
        ])('should handle GitHub API %s fetch failure (%i)', async (apiType, failureIndex, statusCode) => {
            const responses = [
                createMockResponse(TEST_DATA.github.repository),
                createMockResponse(TEST_DATA.github.commits),
                createMockResponse(TEST_DATA.github.branches),
            ];
            responses[failureIndex] = createMockResponse({}, false, statusCode);

            responses.forEach(response => {
                mockFetch.mockResolvedValueOnce(response);
            });

            const plugin = new CommitHistoryPlugin();

            await expect(plugin.fetchGitHubCommitHistory()).rejects.toThrow(
                `GitHub API request failed: ${statusCode}`,
            );
        });

        test('should use default values when environment variables are not set', async () => {
            delete process.env.GITHUB_OWNER;
            delete process.env.GITHUB_REPO;
            setupSuccessfulMocks();

            const plugin = new CommitHistoryPlugin();
            await plugin.fetchGitHubCommitHistory();

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/MihaiOnSoftware/personal-resume',
                expect.objectContaining({ headers: expect.any(Object) }),
            );
        });

        test('should respect GITHUB_COMMIT_LIMIT environment variable', async () => {
            process.env.GITHUB_COMMIT_LIMIT = '50';

            const manyCommits = createCommits(60);

            mockFetch
                .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.repository))
                .mockResolvedValueOnce(createMockResponse(manyCommits))
                .mockResolvedValueOnce(createMockResponse(TEST_DATA.github.branches));

            const plugin = new CommitHistoryPlugin();
            const result = await plugin.fetchGitHubCommitHistory();

            expect(result.commit_history).toHaveLength(50);
            expect(result.repository_stats.total_commits).toBe(50);
        });

        test('should fetch multiple pages when commit limit exceeds 100', async () => {
            process.env.GITHUB_COMMIT_LIMIT = '150';

            const page1Commits = createCommits(100, 'page1');
            const page2Commits = createCommits(50, 'page2');

            setupPaginationMocks(page1Commits, page2Commits);

            const plugin = new CommitHistoryPlugin();
            const result = await plugin.fetchGitHubCommitHistory();

            expect(result.commit_history).toHaveLength(150);
            expect(result.repository_stats.total_commits).toBe(150);

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/TestOwner/test-repo/commits?per_page=100&page=1',
                expect.objectContaining({ headers: expect.any(Object) }),
            );
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.github.com/repos/TestOwner/test-repo/commits?per_page=100&page=2',
                expect.objectContaining({ headers: expect.any(Object) }),
            );
        });
    });
}); 