#!/usr/bin/env node

const { initializeChatbot } = require('./chatbot-utils.js');

async function testChatbot() {
    console.log('🤖 Testing Chatbot...\n');

    try {
        // Initialize chatbot and check server
        const { chatbot, hasApiKey } = await initializeChatbot();
        console.log('✅ Server connection OK');
        console.log(`✅ OpenAI API configured: ${hasApiKey}`);
        console.log('✅ Chatbot initialized\n');

        // Test messages
        const testMessages = [
            "Hi! What technologies do you work with?",
            "Tell me about your recent GitHub activity",
            "What's your experience with JavaScript?",
            "How did you build this website?"
        ];

        for (const message of testMessages) {
            console.log(`👤 User: ${message}`);
            console.log('🤔 Processing...');

            try {
                const response = await chatbot.processMessage(message);
                console.log(`🤖 Mihai: ${response}`);
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }

            console.log('─'.repeat(50));
        }

        console.log('\n✅ Chatbot test completed!');

    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        console.log('   Make sure the server is running with: npm start');
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testChatbot();
}

module.exports = { testChatbot }; 