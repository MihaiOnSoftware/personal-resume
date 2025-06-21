(function () {
    'use strict';

    // UI Configuration (like navigation.js constants)
    const CHATBOT_UI_CONFIG = {
        containerId: 'chatbot-container',
        welcomeDelay: 500,
        focusDelay: 100,
    };

    // UI Template (like navigation.js SOCIAL_LINKS_HTML)
    const CHATBOT_HTML = `
      <div class="chatbot-toggle" title="Chat with AI Assistant">
        <i class="fas fa-comments"></i>
        <div class="chatbot-notification">💬</div>
      </div>
      
      <div class="chatbot-window" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <i class="fas fa-robot"></i>
            <span>Ask about Mihai</span>
          </div>
          <button class="chatbot-close" title="Close chat">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="chatbot-messages"></div>
        
        <div class="chatbot-input-container">
          <form class="chatbot-input-form">
            <input 
              type="text" 
              class="chatbot-input" 
              placeholder="Ask me about my experience, skills, or projects..."
              autocomplete="off"
            />
            <button type="submit" class="chatbot-send" title="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    const WELCOME_MESSAGE = "👋 Hi there! I'm an AI assistant that can answer questions about Mihai Popescu. I know about his experience, skills, projects, and can even fetch his latest GitHub stats. What would you like to know?";

    // Global state (like hamburger.js simple state)
    let isOpen = false;

    // Helper functions (like hamburger.js helper functions)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/(content\/[^\s]+\.html)/g, '<a href="$1" target="_blank" class="chatbot-link">$1</a>')
            .replace(/^• /gm, '<span class="bullet">•</span> ');
    }

    function scrollToBottom() {
        const messagesContainer = document.querySelector('.chatbot-messages');
        if (messagesContainer) {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth',
            });
        }
    }

    function addMessage(content, sender, isError = false) {
        const messagesContainer = document.querySelector('.chatbot-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        if (isError) messageElement.classList.add('error');

        const formattedContent = formatMessage(content);
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.innerHTML = `
          <div class="message-content">${formattedContent}</div>
          <div class="message-time">${timestamp}</div>
        `;

        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const messagesContainer = document.querySelector('.chatbot-messages');
        if (!messagesContainer) return null;

        const typingElement = document.createElement('div');
        typingElement.className = 'message bot typing';
        typingElement.innerHTML = `
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        `;

        messagesContainer.appendChild(typingElement);
        scrollToBottom();
        return typingElement;
    }

    function removeTypingIndicator(typingElement) {
        if (typingElement && typingElement.parentNode) {
            typingElement.parentNode.removeChild(typingElement);
        }
    }

    function toggleChatbot() {
        const chatbotWindow = document.querySelector('.chatbot-window');
        const notification = document.querySelector('.chatbot-notification');

        if (!chatbotWindow) return;

        if (isOpen) {
            closeChatbot();
        } else {
            chatbotWindow.style.display = 'flex';
            isOpen = true;
            if (notification) notification.style.display = 'none';

            const input = document.querySelector('.chatbot-input');
            if (input) {
                setTimeout(() => input.focus(), CHATBOT_UI_CONFIG.focusDelay);
            }
        }
    }

    function closeChatbot() {
        const chatbotWindow = document.querySelector('.chatbot-window');
        if (chatbotWindow) {
            chatbotWindow.style.display = 'none';
            isOpen = false;
        }
    }

    async function sendMessage(message) {
        if (!message.trim()) return;

        addMessage(message, 'user');
        const typingIndicator = showTypingIndicator();

        try {
            // Access processMessage from global scope or module
            const processMessageFn = typeof window !== 'undefined' && window.processMessage
                ? window.processMessage
                : (typeof processMessage !== 'undefined' ? processMessage : null);

            if (!processMessageFn) {
                throw new Error('processMessage function not available');
            }

            const response = await processMessageFn(message);
            removeTypingIndicator(typingIndicator);
            addMessage(response, 'bot');
        } catch (error) {
            removeTypingIndicator(typingIndicator);
            console.error('Error sending message:', error);
            addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
        }
    }

    function createChatbotContainer() {
        let container = document.getElementById(CHATBOT_UI_CONFIG.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = CHATBOT_UI_CONFIG.containerId;
            document.body.appendChild(container);
        }
        return container;
    }

    function attachEventListeners() {
        const toggle = document.querySelector('.chatbot-toggle');
        const closeBtn = document.querySelector('.chatbot-close');
        const form = document.querySelector('.chatbot-input-form');
        const input = document.querySelector('.chatbot-input');

        if (toggle) {
            toggle.addEventListener('click', toggleChatbot);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeChatbot);
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = input.value.trim();
                if (message) {
                    sendMessage(message);
                    input.value = '';
                }
            });
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (form) {
                        // eslint-disable-next-line no-undef
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            });
        }
    }

    function showWelcomeMessage() {
        setTimeout(() => {
            addMessage(WELCOME_MESSAGE, 'bot');
        }, CHATBOT_UI_CONFIG.welcomeDelay);
    }

    function clearChat() {
        const messagesContainer = document.querySelector('.chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        // Access clearHistory from global scope or module
        const clearHistoryFn = typeof window !== 'undefined' && window.clearHistory
            ? window.clearHistory
            : (typeof clearHistory !== 'undefined' ? clearHistory : null);

        if (clearHistoryFn) {
            clearHistoryFn();
        }

        showWelcomeMessage();
    }

    function autoInitializeChatbot() {
        const container = createChatbotContainer();
        container.innerHTML = CHATBOT_HTML;
        attachEventListeners();
        showWelcomeMessage();
    }

    // Export for testing (like hamburger.js exports)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            toggleChatbot,
            sendMessage,
            clearChat,
            addMessage,
        };
    }

    // Make available globally (like hamburger.js)
    if (typeof window !== 'undefined') {
        window.toggleChatbot = toggleChatbot;
        window.clearChat = clearChat;
        window.sendMessage = sendMessage;
        window.addMessage = addMessage;
    }

    // Auto-initialize (like navigation.js)
    document.addEventListener('DOMContentLoaded', autoInitializeChatbot);
})(); 