# Docker Deployment

This project includes Docker support for containerized deployment.

## Building the Docker Image

```bash
./scripts/build-docker.sh
```

This will:
- Build a Docker image tagged with the current git commit hash
- Also tag it as `latest`
- Show the built images

## Pushing to DigitalOcean Container Registry

First, set up your environment variables:

```bash
export DO_REGISTRY_EMAIL="your-digitalocean-account-email@example.com"
export DO_REGISTRY_TOKEN="your-digitalocean-registry-token"
export DO_REGISTRY_URL="registry.digitalocean.com/your-registry-name"
```

Then push:

```bash
./scripts/push-docker.sh
```

This will:
- Login to DigitalOcean Container Registry using your email and token
- Tag the images for the registry
- Push both the commit hash and latest tags
- Logout for security

## Environment Variables for Production

The Docker container expects these environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key for the chatbot
- `PORT` - Port to run the server on (defaults to 3000)

## Running the Container

```bash
docker run -p 3000:3000 -e OPENAI_API_KEY="your-key" personal-resume:latest
```

Or from the registry:

```bash
docker run -p 3000:3000 -e OPENAI_API_KEY="your-key" registry.digitalocean.com/your-registry/personal-resume:latest
``` 