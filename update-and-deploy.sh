#!/bin/bash

echo "Building application..."
npm run build

echo "Creating deployment package..."
cd dist && zip -r ../deploy.zip . && cd ..

echo "Creating deployment..."
DEPLOYMENT=$(aws amplify create-deployment --app-id d6fzxseu4c8kk --branch-name main --region ap-south-1)
UPLOAD_URL=$(echo $DEPLOYMENT | jq -r '.zipUploadUrl')
JOB_ID=$(echo $DEPLOYMENT | jq -r '.jobId')

echo "Uploading build artifacts..."
curl -X PUT -T deploy.zip "$UPLOAD_URL"

echo "Starting deployment..."
aws amplify start-deployment --app-id d6fzxseu4c8kk --branch-name main --job-id $JOB_ID --region ap-south-1

echo ""
echo "Deployment started! Job ID: $JOB_ID"
echo "Your site will be updated in 1-2 minutes at:"
echo "https://main.d6fzxseu4c8kk.amplifyapp.com"
echo ""
echo "Check deployment status with:"
echo "aws amplify get-job --app-id d6fzxseu4c8kk --branch-name main --job-id $JOB_ID --region ap-south-1"
