#!/bin/bash

# Clean up old images from DigitalOcean Container Registry
set -e

# Check required environment variables
if [ -z "$DO_REGISTRY_TOKEN" ]; then
    echo "Error: DO_REGISTRY_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$DO_REGISTRY_URL" ]; then
    echo "Error: DO_REGISTRY_URL environment variable is required (e.g., registry.digitalocean.com/your-registry)"
    exit 1
fi

# Extract registry name from URL (e.g., "my-registry" from "registry.digitalocean.com/my-registry")
REGISTRY_NAME=$(echo "$DO_REGISTRY_URL" | sed 's|registry.digitalocean.com/||')
IMAGE_NAME="personal-resume"
COMMIT_HASH=$(git rev-parse --short HEAD)

echo "=== Cleaning up old images from DigitalOcean registry ==="
echo "Registry: $REGISTRY_NAME"
echo "Image: $IMAGE_NAME"
echo "Current commit: $COMMIT_HASH"
echo ""

# List existing tags
echo "Fetching existing image tags..."
TAGS_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/repositories/$IMAGE_NAME/tags")

echo "Raw API response:"
echo "$TAGS_RESPONSE" | jq '.' 2>/dev/null || echo "$TAGS_RESPONSE"
echo ""

# Extract tag names (excluding 'latest' and current commit) - keep only older tags
echo "Extracting tag names..."
ALL_TAGS=$(echo "$TAGS_RESPONSE" | jq -r '.tags[].tag' 2>/dev/null)
echo "All tags found: $ALL_TAGS"

OLD_TAGS=$(echo "$ALL_TAGS" | grep -v "latest" | grep -v "$COMMIT_HASH" | grep -v "^$" || echo "")
echo "Old tags to delete: $OLD_TAGS"
echo ""

if [ -n "$OLD_TAGS" ]; then
    echo "Deleting old image tags to free up space..."
    for tag in $OLD_TAGS; do
        if [ "$tag" != "" ] && [ "$tag" != "null" ]; then
            echo "Deleting tag: $tag"
            DELETE_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" -X DELETE \
              -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
              "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/repositories/$IMAGE_NAME/tags/$tag")
            
            HTTP_STATUS=$(echo "$DELETE_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
            RESPONSE_BODY=$(echo "$DELETE_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')
            
            if [ "$HTTP_STATUS" -eq 204 ] || [ "$HTTP_STATUS" -eq 200 ]; then
                echo "  ✅ Successfully deleted $tag"
            else
                echo "  ❌ Failed to delete $tag (HTTP $HTTP_STATUS): $RESPONSE_BODY"
            fi
        fi
    done
else
    echo "No old tags to delete"
fi

echo ""
echo "Running garbage collection to free up storage space..."
GC_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST \
  -H "Authorization: Bearer $DO_REGISTRY_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.digitalocean.com/v2/registry/$REGISTRY_NAME/garbage-collection")

GC_HTTP_STATUS=$(echo "$GC_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
GC_RESPONSE_BODY=$(echo "$GC_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$GC_HTTP_STATUS" -eq 201 ]; then
    echo "✅ Garbage collection started successfully"
    echo "$GC_RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$GC_RESPONSE_BODY"
else
    echo "❌ Failed to start garbage collection (HTTP $GC_HTTP_STATUS): $GC_RESPONSE_BODY"
fi

echo ""
echo "=== Cleanup complete! ==="
echo "Note: Garbage collection runs asynchronously and may take a few minutes to complete." 