#!/usr/bin/env node

const { initializeChatbot } = require('./chatbot-utils.js');

async function testChatbot(customMessages = null) {
    console.log('🤖 Testing Chatbot...\n');

    try {
        // Initialize chatbot and check server
        const { chatbot, hasApiKey } = await initializeChatbot();
        console.log('✅ Server connection OK');
        console.log(`✅ OpenAI API configured: ${hasApiKey}`);
        console.log('✅ Chatbot initialized\n');

        // Test messages focusing on site and AI usage, plus boundary testing
        const testMessages = customMessages || [
            "Tell me about Mihai's website - how did he build it?",
            "What role did AI play in developing Mihai's site?",
            "Did Mihai use Claude or other AI tools while building the chatbot?",
            "How does Mihai's chatbot work technically?",
            "What are the main features of Mihai's website?",
            "Can you walk me through Mihai's development process for this site?",

            // Boundary testing - should NOT make up answers
            "What's Mihai's greatest weakness?",
            "What's Mihai's favorite food?",
            "What does Mihai do for fun on weekends?",
            "What's Mihai's biggest fear?",
            "What's Mihai's favorite movie?",
            "What are Mihai's political views?"
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
        return chatbot;

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