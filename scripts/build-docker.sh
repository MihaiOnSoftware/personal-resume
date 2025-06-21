#!/bin/bash

# Build Docker image for personal resume
set -e

# Get the current git commit hash for tagging
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_NAME="personal-resume"

echo "Building Docker image: ${IMAGE_NAME}:${COMMIT_HASH}"

# Build the image for AMD64 architecture (DigitalOcean compatibility)
docker buildx build --platform linux/amd64 -t "${IMAGE_NAME}:${COMMIT_HASH}" -t "${IMAGE_NAME}:latest" .

echo "Successfully built Docker image:"
echo "  ${IMAGE_NAME}:${COMMIT_HASH}"
echo "  ${IMAGE_NAME}:latest"

# Show the image
docker images | grep "${IMAGE_NAME}" 