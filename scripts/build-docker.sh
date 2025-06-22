#!/bin/bash

# Build Docker image for personal resume
set -e

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Warning: GITHUB_TOKEN environment variable is not set."
    echo "The commit history will not be available in the Docker container."
    echo "Set GITHUB_TOKEN before building: export GITHUB_TOKEN=your_token_here"
fi

# Get the current git commit hash for tagging
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_NAME="personal-resume"

echo "Building Docker image: ${IMAGE_NAME}:${COMMIT_HASH}"

# Build the image for AMD64 architecture (DigitalOcean compatibility)
# Pass GitHub token and repo info as build arguments
docker buildx build --platform linux/amd64 \
  --build-arg GITHUB_TOKEN="$GITHUB_TOKEN" \
  --build-arg GITHUB_OWNER="${GITHUB_OWNER:-MihaiOnSoftware}" \
  --build-arg GITHUB_REPO="${GITHUB_REPO:-personal-resume}" \
  --load \
  -t "${IMAGE_NAME}:${COMMIT_HASH}" \
  -t "${IMAGE_NAME}:latest" .

echo "Successfully built Docker image:"
echo "  ${IMAGE_NAME}:${COMMIT_HASH}"
echo "  ${IMAGE_NAME}:latest"

# Show the image
docker images | grep "${IMAGE_NAME}" 