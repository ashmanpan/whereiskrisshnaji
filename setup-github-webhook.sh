#!/bin/bash

# AWS Amplify Webhook URL
WEBHOOK_URL="https://webhooks.amplify.ap-south-1.amazonaws.com/prod/webhooks?id=bdeb7818-077e-4fe9-afea-9546a03d6125&token=k5pg9rVaEKrk4lSqfFnKvmGmgFSpfZbGmsPi2lWAdk"

# GitHub Repository (owner/repo)
GITHUB_REPO="ashmanpan/whereiskrisshnaji"

echo "Setting up GitHub webhook for automatic AWS Amplify deployments..."
echo ""
echo "Webhook URL: $WEBHOOK_URL"
echo "Repository: $GITHUB_REPO"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI to create webhook..."
    gh api repos/$GITHUB_REPO/hooks \
        -f name='web' \
        -f active=true \
        -F config[url]="$WEBHOOK_URL" \
        -F config[content_type]='json' \
        -f events[]='push' \
        -f events[]='pull_request'

    if [ $? -eq 0 ]; then
        echo "✓ Webhook created successfully!"
        echo "Your site will now auto-deploy on every git push!"
    else
        echo "✗ Failed to create webhook via CLI"
        echo "Please follow manual instructions below"
    fi
else
    echo "GitHub CLI (gh) not found. Please add webhook manually:"
    echo ""
    echo "MANUAL SETUP INSTRUCTIONS:"
    echo "=========================="
    echo ""
    echo "1. Go to: https://github.com/ashmanpan/whereiskrisshnaji/settings/hooks"
    echo ""
    echo "2. Click 'Add webhook'"
    echo ""
    echo "3. Fill in the form:"
    echo "   Payload URL: $WEBHOOK_URL"
    echo "   Content type: application/json"
    echo "   Which events: Just the push event"
    echo "   Active: ✓ (checked)"
    echo ""
    echo "4. Click 'Add webhook'"
    echo ""
    echo "5. Test it:"
    echo "   - Make any change to your code"
    echo "   - git add ."
    echo "   - git commit -m 'test auto-deploy'"
    echo "   - git push"
    echo "   - Watch AWS Amplify console for automatic build!"
    echo ""
fi
