#!/bin/bash

# Setup DynamoDB and AppSync for whereiskrishnaji

echo "Creating DynamoDB table for travel locations..."

# Create DynamoDB table
aws dynamodb create-table \
  --table-name whereiskrishnaji-locations \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1 \
  --tags Key=Project,Value=whereiskrishnaji

echo "DynamoDB table created: whereiskrishnaji-locations"
echo ""
echo "Table details:"
aws dynamodb describe-table --table-name whereiskrishnaji-locations --region ap-south-1 --query 'Table.[TableName,TableStatus,TableArn]' --output table

echo ""
echo "✓ DynamoDB setup complete!"
echo ""
echo "Next steps:"
echo "1. Install AWS Amplify libraries: npm install aws-amplify"
echo "2. Update frontend code to use DynamoDB"
echo "3. Create API Gateway or use AppSync for GraphQL"
