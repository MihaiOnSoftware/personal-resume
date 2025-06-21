#!/usr/bin/env node

const readline = require('readline');
const { initializeChatbot } = require('./chatbot-utils.js');

const COLORS = {
    user: '\x1b[36m',
    bot: '\x1b[32m',
    error: '\x1b[31m',
    system: '\x1b[33m',
    reset: '\x1b[0m',
};

class ChatCLI {
    constructor() {
        this.chatbot = null;
        this.rl = null;
        this.conversationCount = 0;
    }

    async start() {
        console.clear();
        console.log(`${COLORS.system}=== Mihai Popescu Chatbot CLI ===${COLORS.reset}`);

        try {
            // Initialize chatbot
            const { chatbot, hasApiKey } = await initializeChatbot();
            this.chatbot = chatbot;

            console.log(`${COLORS.system}✓ Server connection OK${COLORS.reset}`);
            console.log(`${COLORS.system}✓ OpenAI API configured: ${hasApiKey}${COLORS.reset}`);
            console.log(`${COLORS.system}✓ Chatbot initialized${COLORS.reset}`);

            this.setupReadline();
            this.showWelcome();

        } catch (error) {
            console.log(`${COLORS.error}✗ Failed to start: ${error.message}${COLORS.reset}`);
            console.log(`${COLORS.system}  Make sure the server is running with: npm start${COLORS.reset}`);
            process.exit(1);
        }
    }

    setupReadline() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${COLORS.user}You: ${COLORS.reset}`,
        });

        this.rl.on('line', (line) => this.handleInput(line.trim()));
        this.rl.on('close', () => this.exit());
    }

    async handleInput(input) {
        if (!input) return this.rl.prompt();

        // Handle commands
        if (input.startsWith('/')) {
            this.handleCommand(input);
            return;
        }

        // Process message
        try {
            const response = await this.chatbot.processMessage(input);
            this.conversationCount++;
            console.log(`${COLORS.bot}Mihai: ${response}${COLORS.reset}\n`);
        } catch (error) {
            console.log(`${COLORS.error}Error: ${error.message}${COLORS.reset}\n`);
        }

        this.rl.prompt();
    }

    handleCommand(command) {
        switch (command.toLowerCase()) {
            case '/help':
                this.showHelp();
                break;
            case '/clear':
                this.chatbot.clearHistory();
                this.conversationCount = 0;
                console.log(`${COLORS.system}History cleared.${COLORS.reset}\n`);
                break;
            case '/history':
                this.showHistory();
                break;
            case '/stats':
                console.log(`${COLORS.system}Messages: ${this.conversationCount}, History: ${this.chatbot.getHistory().length}${COLORS.reset}\n`);
                break;
            case '/quit':
            case '/exit':
                this.exit();
                return;
            default:
                console.log(`${COLORS.error}Unknown command. Type /help for available commands.${COLORS.reset}\n`);
        }
        this.rl.prompt();
    }

    showWelcome() {
        console.log(`${COLORS.bot}AI Assistant: Hi! I'm an AI chatbot that can answer questions about Mihai Popescu's experience, skills, and projects.${COLORS.reset}`);
        console.log(`${COLORS.system}Type '/help' for commands or just start chatting!${COLORS.reset}\n`);
        this.rl.prompt();
    }

    showHelp() {
        console.log(`${COLORS.system}Commands: /help /clear /history /stats /quit${COLORS.reset}\n`);
    }

    showHistory() {
        const history = this.chatbot.getHistory();
        if (history.length === 0) {
            console.log(`${COLORS.system}No history.${COLORS.reset}\n`);
            return;
        }

        history.forEach(msg => {
            const color = msg.role === 'user' ? COLORS.user : COLORS.bot;
            const sender = msg.role === 'user' ? 'You' : 'Mihai';
            console.log(`${color}${sender}: ${msg.content}${COLORS.reset}`);
        });
        console.log('');
    }

    exit() {
        console.log(`${COLORS.system}\nThanks for chatting! 👋${COLORS.reset}`);
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

// Start the CLI
if (require.main === module) {
    const cli = new ChatCLI();
    cli.start();
}

module.exports = { ChatCLI }; 