/**
 * Chatbot Initialization Script
 * This script initializes the AI-powered chatbot for Mihai's personal website
 */

// Import the chatbot components
import './chatbot.js';
import './chatbot-ui.js';

(function () {
    'use strict';

    function autoInitializeChatbot() {
        // Create container if it doesn't exist
        let container = document.getElementById('chatbot-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'chatbot-container';
            document.body.appendChild(container);
        }

        console.log('Chatbot initialized successfully');
    }

    // Auto-initialize when DOM is loaded (like navigation.js)
    document.addEventListener('DOMContentLoaded', autoInitializeChatbot);
})();
