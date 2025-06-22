Status: [![CircleCI](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master.svg?style=svg)](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master)

# Purpose

This is the repo for my personal website [mihai.software](https://mihai.software). Originally just a couple of flat html files with a touch of javascript, now it's got a little server to connect to various APIs so it doesn't have to serve secrets over the web.

## Setup

### Environment Variables

The application requires API keys for the chatbot and weather functionality. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Get your API keys from:
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys)
- OpenWeatherMap: [OpenWeatherMap API](https://openweathermap.org/api)
- Github Token: [Github Tokens](https://github.com/settings/personal-access-tokens)

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

