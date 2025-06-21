Status: [![CircleCI](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master.svg?style=svg)](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master)

# Purpose

This is the repo for my personal website [mihai.software](https://mihai.software). Currently just a couple of flat html files with a touch of javascript.

## Setup

### Environment Variables

The application requires API keys for the chatbot and weather functionality. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
```

Get your API keys from:
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)
- OpenWeatherMap: [OpenWeatherMap API](https://openweathermap.org/api)

### Build and Run

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server (serves static files and provides API proxy)
npm start

# Or build and start in one command
npm run dev

# Run tests
npm test
```

The server will start on port 3000 by default. The application uses secure server-side proxies to handle API requests (OpenAI for chatbot, OpenWeatherMap for weather), keeping your API keys safe from client-side exposure.

