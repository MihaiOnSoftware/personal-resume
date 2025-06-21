#!/bin/bash

# Clean up old images and push new Docker image to DigitalOcean Container Registry
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

# Note: Using DO_REGISTRY_TOKEN for both registry login and API calls

# Set up variables for build and push
IMAGE_NAME="personal-resume"
COMMIT_HASH=$(git rev-parse --short HEAD)
REGISTRY_IMAGE="${DO_REGISTRY_URL}/${IMAGE_NAME}"

echo "=== Building new Docker image ==="

# Build the new image
./scripts/build-docker.sh

echo ""
echo "=== Pushing new image to registry ==="

echo "Logging into DigitalOcean Container Registry..."
echo "$DO_REGISTRY_TOKEN" | docker login registry.digitalocean.com --username "$DO_REGISTRY_EMAIL" --password-stdin

echo "Cleaning up local images..."
docker image prune -f

echo "Tagging images for registry..."
docker tag "${IMAGE_NAME}:${COMMIT_HASH}" "${REGISTRY_IMAGE}:${COMMIT_HASH}"
docker tag "${IMAGE_NAME}:latest" "${REGISTRY_IMAGE}:latest"

echo "Pushing images to registry..."
docker push "${REGISTRY_IMAGE}:${COMMIT_HASH}"
docker push "${REGISTRY_IMAGE}:latest"

echo "Successfully pushed Docker images:"
echo "  ${REGISTRY_IMAGE}:${COMMIT_HASH}"
echo "  ${REGISTRY_IMAGE}:latest"

echo "=== Cleaning up old images from DigitalOcean registry ==="

# Use the dedicated cleanup script
./scripts/cleanup-registry.sh

echo ""

# Logout for security
docker logout registry.digitalocean.com

echo ""
echo "=== Cleanup and push complete! ===" 