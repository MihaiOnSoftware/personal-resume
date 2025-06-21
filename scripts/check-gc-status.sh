#!/bin/bash

# Check garbage collection status in DigitalOcean Container Registry
set -e

# Check required environment variables
if [ -z "$DO_REGISTRY_TOKEN" ]; then
    echo "Error: DO_REGISTRY_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$DO_REGISTRY_URL" ]; then
    echo "Error: DO_REGISTRY_URL environment variable is required"
    exit 1
fi

# Extract registry name from URL
REGISTRY_NAME=$(echo "$DO_REGISTRY_URL" | sed 's|registry.digitalocean.com/||')

echo "=== Checking garbage collection status ==="
echo "Registry: $REGISTRY_NAME"
echo ""

# Get garbage collection history
echo "Fetching garbage collection operations..."
GC_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/garbage-collections")

echo "Garbage collection operations:"
echo "$GC_RESPONSE" | jq '.' 2>/dev/null || echo "$GC_RESPONSE"

echo ""
echo "=== Registry storage usage ==="

# Get registry info to see storage usage
REGISTRY_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME")

echo "Registry details:"
echo "$REGISTRY_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTRY_RESPONSE" 