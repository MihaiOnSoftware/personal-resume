(function () {
    'use strict';

    // Configuration constants
    const CHATBOT_CONFIG = {
        githubUsername: 'mihaip',
        openaiModel: 'gpt-3.5-turbo',
        maxTokens: 150,
        temperature: 0.7,
        githubKeywords: ['github', 'repository', 'repo', 'repositories', 'code', 'commits', 'contributions', 'followers', 'following', 'projects'],
    };

    class Chatbot {
        constructor() {
            this.htmlContent = null;
            this.systemPrompt = null;
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

        createSystemPrompt(contentData, githubContext = '') {
            return `
            You are Mihai Popescu, a software developer, chatting casually about yourself. Keep responses short and conversational.

            Here is your complete website content and professional information:
            ${contentData}

            ${githubContext}

            TONE & STYLE:
            - Talk like you're having a casual conversation with a friend
            - Keep answers brief (1-2 sentences max unless asked for details)
            - Use "I" naturally - you ARE Mihai
            - Be enthusiastic but not over-the-top
            - Skip formal language - be relaxed and approachable

            GUIDELINES:
            - Answer from the info above, but keep it concise
            - If someone asks about tech stuff, mention it briefly then ask if they want more details
            - For GitHub questions, I can pull live stats
            - If you don't know something, just say so casually
            - Use emojis sparingly (maybe 1 per response max)
            `;
        }

        messageRequiresGithubStats(message) {
            const lowerMessage = message.toLowerCase();
            return CHATBOT_CONFIG.githubKeywords.some(keyword => lowerMessage.includes(keyword));
        }

        async fetchGitHubStats() {
            try {
                const response = await fetch(`https://api.github.com/users/${CHATBOT_CONFIG.githubUsername}`);
                if (!response.ok) return null;

                const stats = await response.json();
                return {
                    public_repos: stats.public_repos,
                    followers: stats.followers,
                    following: stats.following,
                    created_at: stats.created_at,
                    bio: stats.bio,
                    location: stats.location,
                    company: stats.company,
                };
            } catch (error) {
                console.error('Error fetching GitHub stats:', error);
                return null;
            }
        }

        formatGithubStatsForContext(stats) {
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

        async initialize() {
            if (!this.htmlContent) {
                this.htmlContent = await this.loadContentFiles();
                this.systemPrompt = this.createSystemPrompt(this.htmlContent);
            }
        }

        addMessageToHistory(role, content) {
            const message = { role, content, timestamp: new Date() };
            this.conversationHistory.push(message);
            return message;
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

        buildMessagesForAI(message, githubContext) {
            const fullSystemPrompt = this.createSystemPrompt(this.htmlContent, githubContext);

            return [
                { role: 'system', content: fullSystemPrompt },
                ...this.conversationHistory.slice(-10),
                { role: 'user', content: message },
            ];
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
            const messages = this.buildMessagesForAI(message, githubContext);
            return this.callOpenAIAPI(messages);
        }

        clearHistory() {
            this.conversationHistory = [];
        }

        getHistory() {
            return [...this.conversationHistory];
        }
    }

    // Create a singleton instance for the browser
    let chatbotInstance = null;

    function getChatbotInstance() {
        if (!chatbotInstance) {
            chatbotInstance = new Chatbot();
        }
        return chatbotInstance;
    }

    // Public API functions that use the singleton
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

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            Chatbot,
            processMessage,
            clearHistory,
            getHistory,
            initializeChatbot,
        };
    }

    // Make available globally for browser
    if (typeof window !== 'undefined') {
        window.processMessage = processMessage;
        window.clearHistory = clearHistory;
        window.getHistory = getHistory;
        window.initializeChatbot = initializeChatbot;
    }
})(); 