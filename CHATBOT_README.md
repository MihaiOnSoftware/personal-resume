# AI Chatbot Integration for Mihai Popescu's Personal Website

## Overview

This project integrates an AI-powered chatbot into Mihai Popescu's personal website. The chatbot uses OpenAI's GPT-3.5-turbo model and is equipped with comprehensive knowledge about Mihai's professional experience, skills, projects, and can fetch real-time GitHub statistics.

## Features

### 🤖 AI-Powered Responses
- Uses OpenAI GPT-3.5-turbo for natural, conversational responses
- Responds in first person as Mihai Popescu
- Maintains conversation context and history

### 📚 Knowledge Base
- **Professional Experience**: Details about software development and engineering management roles
- **Technical Skills**: Programming languages, frameworks, tools, and methodologies
- **Achievements**: Notable accomplishments at companies like Nulogy and Shopify
- **Content**: Information about presentations and blog posts
- **Personal Interests**: D&D, reading, guitar, gaming

### 🔄 Real-time GitHub Integration
- Fetches current GitHub statistics (repositories, followers, etc.)
- Integrates GitHub data into AI responses when relevant
- Handles API errors gracefully

### 💬 Modern UI
- Beautiful, responsive chat interface
- Floating chat button with notification indicator
- Typing indicators and smooth animations
- Mobile-friendly design
- Font Awesome icons for visual appeal

## Files Created

### Core Components
- `src/chatbot.js` - Main chatbot logic and OpenAI integration
- `src/chatbot-ui.js` - User interface components and interactions
- `src/chatbot.css` - Styling for the chat interface
- `src/chatbot-init.js` - Initialization script

### Testing
- `test/chatbot.test.js` - Unit tests for chatbot functionality
- `test/chatbot-ui.test.js` - UI component tests
- `test/chatbot-integration.test.js` - Integration tests with mocked APIs

### Demo
- `dist/chatbot-demo.html` - Standalone demo page for testing

## Setup and Configuration

### 1. API Key Configuration
The chatbot requires an OpenAI API key. Configure it using environment variables:

```bash
# Create a .env file in the project root
OPENAI_API_KEY=your_openai_api_key_here

# Or set it when building
OPENAI_API_KEY=your_key npm run build
```

**Important**: 
- Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- The API key is injected at build time using webpack's DefinePlugin
- Never commit your actual API key to version control
- Use the provided `.env.example` file as a template

If no API key is provided, the chatbot will display a helpful configuration message to users.

### 2. Integration into Existing Pages
The chatbot is automatically integrated into your website pages:

- `src/index.html` - Main page
- `src/resume.html` - Resume page
- Other pages can be updated similarly

### 3. Build Process
```bash
npm run build    # Build the project
npm test        # Run all tests
npm run lint    # Check code style
```

## Usage Examples

### Sample Questions
Users can ask the chatbot questions like:
- "Tell me about your professional experience"
- "What programming languages do you know?"
- "How many GitHub repositories do you have?"
- "What is pair programming?"
- "What presentations have you given?"
- "Tell me about your management experience"

### Programmatic Usage
```javascript
// Access chatbot instances globally
window.chatbot.processMessage("Hello!");
window.chatbotUI.sendProgrammaticMessage("What are your skills?");
```

## Technical Architecture

### AI Integration
- **Model**: OpenAI GPT-3.5-turbo
- **Context Management**: Includes conversation history and system prompts
- **Dynamic Context**: Adds GitHub stats when relevant to the question

### Knowledge Base Structure
```javascript
{
  personal: { name, role, description, interests },
  experience: { summary, achievements, companies },
  skills: { languages, frameworks, tools, methodologies },
  content: [{ topic, description, url }]
}
```

### Error Handling
- Graceful degradation when API is unavailable
- Fallback chatbot with basic information
- User-friendly error messages

## Testing Strategy

### Unit Tests
- Core chatbot functionality
- Knowledge base initialization
- Message processing logic

### Integration Tests
- API request structure validation
- System prompt inclusion
- GitHub integration workflow

### UI Tests
- Component rendering
- User interactions
- Message display and formatting

## Performance Considerations

- **Lazy Loading**: Chatbot loads only when needed
- **Optimized Requests**: Includes only necessary context in API calls
- **Caching**: Conversation history maintained locally
- **Responsive Design**: Works well on all device sizes

## Security Notes

- API key should be properly secured in production
- CORS policies configured for API endpoints
- Input sanitization for user messages
- Rate limiting considerations for API usage

## Future Enhancements

Potential improvements could include:
- Voice interaction capabilities
- Multi-language support
- Integration with more data sources
- Advanced conversation analytics
- Custom training on additional content

## Demo

Visit the demo page at `dist/chatbot-demo.html` to test the chatbot functionality. The demo includes:
- Beautiful landing page with feature descriptions
- Sample questions for easy testing
- Status indicator showing chatbot readiness
- Full mobile responsiveness

## Development Notes

The implementation follows TDD principles with comprehensive test coverage. The code is linted and follows consistent style guidelines. The modular architecture allows for easy extension and maintenance. 