const { Chatbot } = require('../src/chatbot.js');

const SERVER_URL = 'http://localhost:3000';

/**
 * Creates a chatbot instance configured to work with the local server
 */
function createServerChatbot() {
    const chatbot = new Chatbot();

    // Override fetch to route requests through the server
    const originalFetch = global.fetch;
    global.fetch = function (url, options) {
        if (typeof url === 'string') {
            // Content files (relative URLs, not API calls)
            if (!url.startsWith('http') && !url.startsWith('/api/')) {
                return originalFetch(`${SERVER_URL}/${url}`, options);
            }
            // API calls
            if (url.startsWith('/api/')) {
                return originalFetch(`${SERVER_URL}${url}`, options);
            }
        }
        // GitHub API and other external URLs
        return originalFetch(url, options);
    };

    return chatbot;
}

/**
 * Checks if the server is running and ready
 */
async function checkServerHealth() {
    try {
        const response = await fetch(`${SERVER_URL}/api/health`);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        return {
            isHealthy: true,
            hasApiKey: data.hasApiKey
        };
    } catch (error) {
        return {
            isHealthy: false,
            error: error.message
        };
    }
}

/**
 * Initializes a chatbot and checks server health
 */
async function initializeChatbot() {
    // Check server health
    const health = await checkServerHealth();
    if (!health.isHealthy) {
        throw new Error(`Cannot connect to server: ${health.error}`);
    }

    // Create and initialize chatbot
    const chatbot = createServerChatbot();
    await chatbot.initialize();

    return { chatbot, hasApiKey: health.hasApiKey };
}

module.exports = {
    SERVER_URL,
    createServerChatbot,
    checkServerHealth,
    initializeChatbot
}; 