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

# Extract registry name from URL (e.g., "my-registry" from "registry.digitalocean.com/my-registry")
REGISTRY_NAME=$(echo "$DO_REGISTRY_URL" | sed 's|registry.digitalocean.com/||')
IMAGE_NAME="personal-resume"
COMMIT_HASH=$(git rev-parse --short HEAD)
REGISTRY_IMAGE="${DO_REGISTRY_URL}/${IMAGE_NAME}"

echo "=== Cleaning up old images from DigitalOcean registry ==="

# List existing tags and delete old ones (keep only the 2 most recent)
echo "Fetching existing image tags..."
TAGS_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/repositories/$IMAGE_NAME/tags")

# Extract tag names (excluding 'latest' and current commit)
OLD_TAGS=$(echo "$TAGS_RESPONSE" | jq -r '.tags[]?.name' | grep -v "latest" | grep -v "$COMMIT_HASH" | head -n -1)

if [ -n "$OLD_TAGS" ]; then
    echo "Deleting old image tags to free up space..."
    for tag in $OLD_TAGS; do
        echo "Deleting tag: $tag"
        curl -s -X DELETE \
          -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
          "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/repositories/$IMAGE_NAME/tags/$tag" || echo "Failed to delete $tag (may not exist)"
    done
else
    echo "No old tags to delete"
fi

echo ""
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

# Logout for security
docker logout registry.digitalocean.com

echo ""
echo "=== Cleanup and push complete! ===" 