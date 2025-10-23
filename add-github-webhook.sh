#!/bin/bash

# GitHub webhook setup script
# This requires a GitHub Personal Access Token with repo:hooks scope

WEBHOOK_URL="https://webhooks.amplify.ap-south-1.amazonaws.com/prod/webhooks?id=bdeb7818-077e-4fe9-afea-9546a03d6125&token=k5pg9rVaEKrk4lSqfFnKvmGmgFSpfZbGmsPi2lWAdk"
GITHUB_REPO="ashmanpan/whereiskrisshnaji"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN='your_token_here'"
    echo ""
    echo "Or provide it as argument:"
    echo "./add-github-webhook.sh YOUR_TOKEN"
    exit 1
fi

# Use token from argument if provided
if [ -n "$1" ]; then
    GITHUB_TOKEN="$1"
fi

echo "Creating GitHub webhook..."
echo "Repository: $GITHUB_REPO"
echo ""

# Create webhook using GitHub API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$GITHUB_REPO/hooks \
  -d @- <<EOF
{
  "name": "web",
  "active": true,
  "events": ["push"],
  "config": {
    "url": "$WEBHOOK_URL",
    "content_type": "json",
    "insecure_ssl": "0"
  }
}
EOF
)

# Check if successful
if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✓ Webhook created successfully!"
    echo ""
    echo "Webhook ID:" $(echo "$RESPONSE" | grep -o '"id": [0-9]*' | head -1 | cut -d' ' -f2)
    echo ""
    echo "Test it now:"
    echo "  git commit --allow-empty -m 'test auto-deploy'"
    echo "  git push"
    echo ""
    echo "Watch deployment at:"
    echo "  https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d6fzxseu4c8kk"
else
    echo "✗ Failed to create webhook"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    echo ""
    echo "Common issues:"
    echo "- Token doesn't have 'admin:repo_hook' or 'repo' scope"
    echo "- Repository doesn't exist or you don't have access"
    echo "- Token is invalid or expired"
fi
