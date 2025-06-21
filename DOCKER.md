# Docker Setup for Personal Resume

This document describes how to containerize and deploy the personal resume application using Docker and DigitalOcean Container Registry.

## Prerequisites

1. Docker installed and running
2. DigitalOcean account with Container Registry enabled
3. Environment variables configured (see below)

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# OpenAI API Key for the chatbot
OPENAI_API_KEY=your_openai_api_key_here

# GitHub Token for commit history generation (required for build)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=MihaiOnSoftware  # Optional, defaults to MihaiOnSoftware
GITHUB_REPO=personal-resume   # Optional, defaults to personal-resume

# DigitalOcean Container Registry credentials
# The registry token is also used for API calls to manage images
DO_REGISTRY_TOKEN=your_do_registry_token_here
DO_REGISTRY_EMAIL=your_do_account_email_here
DO_REGISTRY_URL=registry.digitalocean.com/your-registry-name
```

### Getting DigitalOcean Credentials

1. **Registry Token & URL**: 
   - Go to [DigitalOcean Container Registry](https://cloud.digitalocean.com/registry)
   - Create or select your registry
   - Generate a new token or use existing one
   - The URL format is: `registry.digitalocean.com/your-registry-name`

2. **Registry Token Permissions**:
   - The same registry token is used for both pushing images and API management
   - Ensure your token has sufficient permissions to delete repository tags
   - No separate API token needed

## Scripts

### `scripts/build-docker.sh`
Builds the Docker image with git commit hash tagging:
```bash
# Make sure to set your GitHub token first for commit history
export GITHUB_TOKEN=your_github_token_here
./scripts/build-docker.sh
```

**Note**: The build script requires a `GITHUB_TOKEN` environment variable to generate commit history for the chatbot. Without it, the commit history feature will not work in the container.

### `scripts/push-docker.sh`
Pushes the built image to DigitalOcean Container Registry:
```bash
./scripts/push-docker.sh
```

### `scripts/cleanup-and-push.sh` (Recommended)
**Space-efficient workflow** that:
1. Deletes old images from the registry to free up space
2. Builds a new Docker image
3. Pushes the new image to the registry

```bash
./scripts/cleanup-and-push.sh
```

This script is recommended for limited storage plans as it automatically manages registry space by removing old image tags before uploading new ones.

## Local Development

To run the container locally:

```bash
# Build the image
./scripts/build-docker.sh

# Run locally on port 3000
docker run -d -p 3000:3000 --name personal-resume-container personal-resume:latest

# View logs
docker logs personal-resume-container

# Stop and remove
docker stop personal-resume-container
docker rm personal-resume-container
```

## Deployment

After pushing to the registry, you can deploy the image to any Docker-compatible hosting platform using:
```
registry.digitalocean.com/your-registry-name/personal-resume:latest
```

## Troubleshooting

- **Storage quota exceeded**: Use `scripts/cleanup-and-push.sh` instead of separate build/push
- **API authentication failed**: Verify your `DO_REGISTRY_TOKEN` has read/write permissions
- **Registry login failed**: Check your `DO_REGISTRY_TOKEN` and `DO_REGISTRY_EMAIL`
- **Image not found**: Ensure the `DO_REGISTRY_URL` matches your actual registry name
- **Commit history missing in container**: Make sure `GITHUB_TOKEN` is set when building the Docker image
- **"Could not generate commit history" during build**: Check that your GitHub token has access to the repository and isn't expired 