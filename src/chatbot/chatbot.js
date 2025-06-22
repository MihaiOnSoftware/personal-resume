(function () {
    'use strict';

    const CHATBOT_CONFIG = {
        githubUsername: 'MihaiOnSoftware',
        openaiModel: 'gpt-3.5-turbo',
        maxTokens: 150,
        temperature: 0.3,
        githubKeywords: ['github', 'repository', 'repo', 'repositories', 'code', 'commits', 'contributions', 'followers', 'following', 'projects', 'website', 'site', 'development', 'built', 'features', 'technologies', 'build', 'develop'],

        github: {
            baseUrl: 'https://api.github.com',
            repoLimit: 10,
            eventLimit: 100,
            displayRepoLimit: 5,
        },
    };

    class Chatbot {
        constructor() {
            this.htmlContent = null;
            this.conversationHistory = [];
        }

        async loadContentIndex() {
            const indexResponse = await fetch('html-files-index.json');
            if (!indexResponse.ok) {
                throw new Error(`Failed to load content files index: ${indexResponse.status}`);
            }
            return indexResponse.json();
        }

        async loadSingleContentFile(filename) {
            const response = await fetch(filename);
            const content = await response.text();
            const fileType = filename.endsWith('.md') ? 'Markdown' : 'HTML';
            return `\n\n=== Content from ${filename} (${fileType}) ===\n${content}`;
        }

        async loadAllContentFiles(contentFiles) {
            let combinedContent = '';
            for (const filename of contentFiles) {
                const fileContent = await this.loadSingleContentFile(filename);
                combinedContent += fileContent;
            }
            return combinedContent;
        }

        async loadContentFiles() {
            const contentFiles = await this.loadContentIndex();
            return this.loadAllContentFiles(contentFiles);
        }

        async loadCommitHistory() {
            const response = await fetch('commit-history.json');
            const data = await response.json();
            return this.formatCommitHistoryForContext(data);
        }

        formatCommitHistoryForContext(data) {
            const { repository_stats, commit_history } = data;
            const recentCommits = commit_history.slice(0, 20);

            return `
            REPOSITORY DEVELOPMENT HISTORY:
            - Total commits: ${repository_stats.total_commits}
            - First commit: ${repository_stats.first_commit}
            - Latest commit: ${repository_stats.latest_commit}
            - Branches: ${repository_stats.branches.length}
            
            RECENT COMMITS (last 20):
            ${recentCommits.join('\n            ')}
            `;
        }

        createSystemPrompt(contentData, githubContext = '') {
            return `You are an AI assistant helping visitors learn about Mihai Popescu, a software developer.

CRITICAL RULE: For questions about "this website", "this site", or "how it was built", use ONLY the DEVELOPMENT HISTORY section below. For questions about "Mihai's skills" or "his experience", use the WEBSITE CONTENT section.

=== DEVELOPMENT HISTORY (for website tech questions) ===
${this.commitHistory}

=== WEBSITE CONTENT (for professional experience questions) ===
${contentData}

=== GITHUB ACTIVITY ===
${githubContext || "No recent GitHub activity data available"}

RESPONSE RULES:
- Keep responses conversational and concise (1-2 sentences)
- READ THE COMMIT MESSAGES CAREFULLY - if you see "claude-4-sonnet supported" or similar AI tool mentions, that means AI tools WERE used
- If asked about personal details check the About Me page first, if not available in the context say "That's not included in Mihai's public information
- When asked about the website, be sure the highlight Mihai's use of AI tools in building it
"`;
        }

        messageRequiresGithubStats(message) {
            const lowerMessage = message.toLowerCase();
            return CHATBOT_CONFIG.githubKeywords.some(keyword => lowerMessage.includes(keyword));
        }

        buildGitHubUrl(endpoint) {
            return `${CHATBOT_CONFIG.github.baseUrl}/users/${CHATBOT_CONFIG.githubUsername}${endpoint}`;
        }

        async fetchGitHubData(url, errorMessage) {
            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                return await response.json();
            } catch (error) {
                console.error(errorMessage, error);
                return null;
            }
        }

        async fetchGitHubStats() {
            const profile = await this.fetchGitHubData(
                this.buildGitHubUrl(''),
                'Error fetching GitHub profile:',
            );
            if (!profile) return null;

            const [reposData, eventsData] = await Promise.allSettled([
                this.fetchGitHubRepos(),
                this.fetchGitHubEvents(),
            ]);

            return {
                ...this.extractBasicProfile(profile),
                repositories: reposData.status === 'fulfilled' ? reposData.value : [],
                recent_activity: eventsData.status === 'fulfilled' ? eventsData.value : [],
            };
        }

        extractBasicProfile(profile) {
            return {
                public_repos: profile.public_repos,
                followers: profile.followers,
                following: profile.following,
                created_at: profile.created_at,
                bio: profile.bio,
                location: profile.location,
                company: profile.company,
            };
        }

        async fetchGitHubRepos() {
            const url = this.buildGitHubUrl(`/repos?sort=updated&per_page=${CHATBOT_CONFIG.github.repoLimit}`);
            const repos = await this.fetchGitHubData(url, 'Error fetching GitHub repositories:');

            return repos ? repos.map(this.transformRepo) : [];
        }



        async fetchGitHubEvents() {
            const url = this.buildGitHubUrl(`/events?per_page=${CHATBOT_CONFIG.github.eventLimit}`);
            const events = await this.fetchGitHubData(url, 'Error fetching GitHub events:');

            return events ? events.map(this.transformEvent.bind(this)).filter(event => event.repo) : [];
        }

        transformRepo(repo) {
            return {
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                updated_at: repo.updated_at,
                url: repo.html_url,
            };
        }

        transformEvent(event) {
            return {
                type: event.type,
                repo: event.repo?.name,
                created_at: event.created_at,
                action: this.formatEventAction(event),
            };
        }

        formatEventAction(event) {
            switch (event.type) {
                case 'PushEvent': {
                    const commitCount = event.payload?.commits?.length || 0;
                    return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
                }
                case 'CreateEvent':
                    return `Created ${event.payload?.ref_type} ${event.payload?.ref}`;
                case 'PullRequestEvent':
                    return `${event.payload?.action} pull request`;
                case 'IssuesEvent':
                    return `${event.payload?.action} issue`;
                case 'ForkEvent':
                    return 'Forked repository';
                case 'WatchEvent':
                    return 'Starred repository';
                default:
                    return event.type.replace('Event', '');
            }
        }

        formatGithubStatsForContext(stats) {
            return [
                this.formatBasicGitHubStats(stats),
                this.formatRepositoriesSection(stats.repositories),
                this.formatActivitySection(stats.recent_activity),
            ].filter(Boolean).join('\n');
        }

        formatBasicGitHubStats(stats) {
            return `
            CURRENT GITHUB STATISTICS:
            - Public repositories: ${stats.public_repos}
            - Followers: ${stats.followers}
            - Following: ${stats.following}
            - Member since: ${new Date(stats.created_at).getFullYear()}
            - Bio: ${stats.bio}
            - Location: ${stats.location}
            - Company: ${stats.company}
            `;
        }

        formatRepositoriesSection(repositories) {
            const repoList = repositories
                .slice(0, CHATBOT_CONFIG.github.displayRepoLimit)
                .map(this.formatRepository)
                .join('\n            ');

            return repoList.length ? `\n            RECENT REPOSITORIES:\n            ${repoList}` : null;
        }

        formatRepository(repo) {
            const parts = [
                `- ${repo.name}`,
                repo.language ? `(${repo.language})` : '',
                repo.description ? `- ${repo.description}` : '',
                repo.stars > 0 ? `⭐${repo.stars}` : '',
                `(Updated: ${new Date(repo.updated_at).toLocaleDateString()})`,
            ];

            return parts.filter(Boolean).join(' ');
        }

        formatActivitySection(activities) {
            if (!activities.length) {
                return '\n            NOTE: No recent public GitHub activity to display.';
            }

            const activityStats = this.calculateActivityStats(activities);

            return `\n            RECENT ACTIVITY SUMMARY:
            - Recent actions: ${activityStats.totalActions}
            - Active repositories: ${activityStats.activeRepos}
            - Most recent activity: ${activityStats.mostRecentDate}
            - Activity types: ${activityStats.activityTypes.join(', ')}`;
        }

        calculateActivityStats(activities) {
            const stats = {
                totalActions: 0,
                activeRepos: new Set(),
                activityTypes: new Set(),
                mostRecentDate: null,
            };

            activities.forEach(activity => {
                stats.totalActions++;

                const activityType = activity.type.replace('Event', '');
                stats.activityTypes.add(activityType);

                const repoName = activity.repo.replace('MihaiOnSoftware/', '');
                stats.activeRepos.add(repoName);
                const activityDate = new Date(activity.created_at);
                if (!stats.mostRecentDate || activityDate > stats.mostRecentDate) {
                    stats.mostRecentDate = activityDate;
                }
            });

            return {
                totalActions: stats.totalActions,
                activeRepos: stats.activeRepos.size,
                activityTypes: Array.from(stats.activityTypes),
                mostRecentDate: stats.mostRecentDate ? stats.mostRecentDate.toLocaleDateString() : 'Unknown',
            };
        }

        async initialize() {
            if (!this.htmlContent) {
                this.htmlContent = await this.loadContentFiles();
                this.commitHistory = await this.loadCommitHistory();
            }
        }

        addMessageToHistory(role, content) {
            this.conversationHistory.push({ role, content, timestamp: new Date() });
        }

        async getGithubContextIfNeeded(message) {
            if (!this.messageRequiresGithubStats(message)) {
                return '';
            }

            const stats = await this.fetchGitHubStats();
            return stats ? this.formatGithubStatsForContext(stats) : '';
        }

        createErrorResponse(error) {
            if (error.message.includes('429') || error.message.includes('high demand')) {
                return "I'm currently experiencing high demand. Please wait a moment and try again. 🕐";
            }
            return "I'm sorry, I encountered an error processing your message. Please try again.";
        }

        async processMessage(message) {
            await this.initialize();

            this.addMessageToHistory('user', message);

            try {
                const githubContext = await this.getGithubContextIfNeeded(message);
                const response = await this.generateAIResponse(message, githubContext);

                this.addMessageToHistory('assistant', response);
                return response;
            } catch (error) {
                console.error('Error processing message:', error);

                const errorResponse = this.createErrorResponse(error);
                this.addMessageToHistory('assistant', errorResponse);
                return errorResponse;
            }
        }

        async callOpenAIAPI(messages) {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: CHATBOT_CONFIG.openaiModel,
                    messages: messages,
                    max_tokens: CHATBOT_CONFIG.maxTokens,
                    temperature: CHATBOT_CONFIG.temperature,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }

        async generateAIResponse(message, githubContext) {
            const systemPrompt = this.createSystemPrompt(this.htmlContent, githubContext);
            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.conversationHistory.slice(-10),
                { role: 'user', content: message },
            ];
            return this.callOpenAIAPI(messages);
        }

        clearHistory() {
            this.conversationHistory = [];
        }

        getHistory() {
            return [...this.conversationHistory];
        }
    }

    let chatbotInstance = null;

    function getChatbotInstance() {
        if (!chatbotInstance) {
            chatbotInstance = new Chatbot();
        }
        return chatbotInstance;
    }

    async function processMessage(message) {
        return getChatbotInstance().processMessage(message);
    }

    function clearHistory() {
        getChatbotInstance().clearHistory();
    }

    function getHistory() {
        return getChatbotInstance().getHistory();
    }

    async function initializeChatbot() {
        return getChatbotInstance().initialize();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            Chatbot,
            processMessage,
            clearHistory,
            getHistory,
            initializeChatbot,
        };
    }

    if (typeof window !== 'undefined') {
        window.processMessage = processMessage;
        window.clearHistory = clearHistory;
        window.getHistory = getHistory;
        window.initializeChatbot = initializeChatbot;
    }
})(); 