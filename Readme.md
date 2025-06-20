Status: [![CircleCI](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master.svg?style=svg)](https://circleci.com/gh/MihaiOnSoftware/personal-resume/tree/master)

# Purpose

This is the repo for my personal website [mihai.software](https://mihai.software). Currently just a couple of flat html files with a touch of javascript.

## Setup

### Environment Variables

The chatbot requires an OpenAI API key to function. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### Build and Run

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

