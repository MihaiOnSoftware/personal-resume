(function () {
    'use strict';

    // Configuration constants (like navigation.js NAV_ITEMS)
    const CHATBOT_CONFIG = {
        githubUsername: 'mihaip',
        openaiModel: 'gpt-3.5-turbo',
        maxTokens: 150,
        temperature: 0.7,
        githubKeywords: ['github', 'repository', 'repo', 'repositories', 'code', 'commits', 'contributions', 'followers', 'following', 'projects'],
    };

    // Global state (like hamburger.js simple state)
    let htmlContent = null;
    let systemPrompt = null;
    let conversationHistory = [];

    // Helper functions (like hamburger.js helper functions)
    async function loadContentFiles() {
        // Load the index of content files (HTML and markdown)
        const indexResponse = await fetch('html-files-index.json');
        if (!indexResponse.ok) {
            throw new Error(`Failed to load content files index: ${indexResponse.status}`);
        }
        const contentFiles = await indexResponse.json();

        let combinedContent = '';

        // Load each content file
        for (const filename of contentFiles) {
            try {
                const response = await fetch(filename);
                if (response.ok) {
                    const content = await response.text();
                    const fileType = filename.endsWith('.md') ? 'Markdown' : 'HTML';
                    combinedContent += `\n\n=== Content from ${filename} (${fileType}) ===\n${content}`;
                } else {
                    console.warn(`Could not load ${filename}: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Error loading ${filename}:`, error);
            }
        }

        return combinedContent;
    }

    function createSystemPrompt(contentData, githubContext = '') {
        return `You are Mihai Popescu chatting casually about yourself. Keep responses short and conversational.

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
- Use emojis sparingly (maybe 1 per response max)`;
    }

    function messageRequiresGithubStats(message) {
        const lowerMessage = message.toLowerCase();
        return CHATBOT_CONFIG.githubKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    async function fetchGitHubStats() {
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

    function formatGithubStatsForContext(stats) {
        return `\nCURRENT GITHUB STATISTICS:
- Public repositories: ${stats.public_repos}
- Followers: ${stats.followers}
- Following: ${stats.following}
- Member since: ${new Date(stats.created_at).getFullYear()}
${stats.bio ? `- Bio: ${stats.bio}` : ''}
${stats.location ? `- Location: ${stats.location}` : ''}
${stats.company ? `- Company: ${stats.company}` : ''}`;
    }

    async function initializeChatbot() {
        if (!htmlContent) {
            htmlContent = await loadContentFiles();
            systemPrompt = createSystemPrompt(htmlContent);
        }
    }

    async function processMessage(message, apiKey) {
        // Initialize if needed (like weather.js auto-initialization)
        await initializeChatbot();

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        conversationHistory.push(userMessage);

        try {
            // Check if GitHub stats are needed
            let githubContext = '';
            if (messageRequiresGithubStats(message)) {
                const stats = await fetchGitHubStats();
                if (stats) {
                    githubContext = formatGithubStatsForContext(stats);
                }
            }

            const response = await generateAIResponse(message, githubContext, apiKey);
            const botMessage = { role: 'assistant', content: response, timestamp: new Date() };
            conversationHistory.push(botMessage);

            return response;
        } catch (error) {
            console.error('Error processing message:', error);

            // Simple error handling (like hamburger.js)
            let errorResponse = "I'm sorry, I encountered an error processing your message. Please try again.";
            if (error.message.includes('429') || error.message.includes('high demand')) {
                errorResponse = "I'm currently experiencing high demand. Please wait a moment and try again. 🕐";
            }

            const botMessage = { role: 'assistant', content: errorResponse, timestamp: new Date() };
            conversationHistory.push(botMessage);
            return errorResponse;
        }
    }

    async function generateAIResponse(message, githubContext, apiKey) {
        // Create system prompt with HTML content and optional GitHub context
        const fullSystemPrompt = createSystemPrompt(htmlContent, githubContext);

        const messages = [
            { role: 'system', content: fullSystemPrompt },
            ...conversationHistory.slice(-10),
            { role: 'user', content: message },
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Simple helper functions (like hamburger.js exports)
    function clearHistory() {
        conversationHistory = [];
    }

    function getHistory() {
        return [...conversationHistory];
    }

    // Export for testing (like hamburger.js exports)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            processMessage,
            clearHistory,
            getHistory,
            initializeChatbot,
        };
    }

    // Make available globally (like hamburger.js)
    if (typeof window !== 'undefined') {
        window.processMessage = processMessage;
        window.clearHistory = clearHistory;
        window.getHistory = getHistory;
        window.initializeChatbot = initializeChatbot;
    }
})(); 