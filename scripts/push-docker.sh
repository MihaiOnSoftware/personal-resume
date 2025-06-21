#!/bin/bash

# Push Docker image to DigitalOcean Container Registry
set -e

# Check required environment variables
if [ -z "$DO_REGISTRY_TOKEN" ]; then
    echo "Error: DO_REGISTRY_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$DO_REGISTRY_EMAIL" ]; then
    echo "Error: DO_REGISTRY_EMAIL environment variable is required (your DigitalOcean account email)"
    exit 1
fi

if [ -z "$DO_REGISTRY_URL" ]; then
    echo "Error: DO_REGISTRY_URL environment variable is required (e.g., registry.digitalocean.com/your-registry)"
    exit 1
fi

# Get the current git commit hash for tagging
COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_NAME="personal-resume"
REGISTRY_IMAGE="${DO_REGISTRY_URL}/${IMAGE_NAME}"

echo "Logging into DigitalOcean Container Registry..."

# Login to DigitalOcean Container Registry with email as username and token as password
echo "$DO_REGISTRY_TOKEN" | docker login registry.digitalocean.com --username "$DO_REGISTRY_EMAIL" --password-stdin

echo "Tagging images for registry..."

# Tag images for the registry
docker tag "${IMAGE_NAME}:${COMMIT_HASH}" "${REGISTRY_IMAGE}:${COMMIT_HASH}"
docker tag "${IMAGE_NAME}:latest" "${REGISTRY_IMAGE}:latest"

echo "Pushing images to registry..."

# Push both tags
docker push "${REGISTRY_IMAGE}:${COMMIT_HASH}"
docker push "${REGISTRY_IMAGE}:latest"

echo "Successfully pushed Docker images:"
echo "  ${REGISTRY_IMAGE}:${COMMIT_HASH}"
echo "  ${REGISTRY_IMAGE}:latest"

# Logout for security
docker logout registry.digitalocean.com

echo "Push complete!" 