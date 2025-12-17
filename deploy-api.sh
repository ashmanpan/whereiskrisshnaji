#!/bin/bash

set -e

echo "🚀 Deploying Lambda and API Gateway for whereiskrishnaji..."

# Variables
FUNCTION_NAME="whereiskrishnaji-locations-api"
REGION="ap-south-1"
ROLE_NAME="whereiskrishnaji-lambda-role"
API_NAME="whereiskrishnaji-api"

# Step 1: Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd lambda
npm install
cd ..

# Step 2: Create IAM role for Lambda
echo "🔐 Creating IAM role for Lambda..."

# Check if role exists
if aws iam get-role --role-name $ROLE_NAME --region $REGION 2>/dev/null; then
  echo "✓ IAM role already exists"
  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
else
  # Create trust policy
  cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create role
  ROLE_ARN=$(aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --region $REGION \
    --query 'Role.Arn' \
    --output text)

  echo "✓ Created IAM role: $ROLE_ARN"

  # Attach policies
  aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    --region $REGION

  # Create inline policy for DynamoDB access
  cat > /tmp/dynamodb-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:$REGION:*:table/whereiskrishnaji-locations"
    }
  ]
}
EOF

  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name DynamoDBAccess \
    --policy-document file:///tmp/dynamodb-policy.json \
    --region $REGION

  echo "✓ Attached DynamoDB policy"

  # Wait for role to be ready
  echo "⏳ Waiting for IAM role to propagate..."
  sleep 10
fi

# Step 3: Package Lambda function
echo "📦 Packaging Lambda function..."
cd lambda
zip -r ../function.zip . -x "*.git*"
cd ..

# Step 4: Create or update Lambda function
echo "⚡ Creating/updating Lambda function..."

if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
  # Update existing function
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION

  echo "✓ Updated Lambda function"
else
  # Create new function
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role $ROLE_ARN \
    --handler locations-api.handler \
    --zip-file fileb://function.zip \
    --region $REGION \
    --timeout 30 \
    --memory-size 256

  echo "✓ Created Lambda function"
fi

# Step 5: Create API Gateway (if not exists)
echo "🌐 Setting up API Gateway..."

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ]; then
  # Create HTTP API
  API_ID=$(aws apigatewayv2 create-api \
    --name $API_NAME \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins='*',AllowMethods='GET,POST,PUT,DELETE,OPTIONS',AllowHeaders='*' \
    --region $REGION \
    --query 'ApiId' \
    --output text)

  echo "✓ Created API Gateway: $API_ID"
else
  echo "✓ API Gateway already exists: $API_ID"
fi

# Get Lambda ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text)

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri $LAMBDA_ARN \
  --payload-format-version 2.0 \
  --region $REGION \
  --query 'IntegrationId' \
  --output text)

echo "✓ Created integration: $INTEGRATION_ID"

# Create routes
for route in "GET /locations" "POST /locations" "PUT /locations/{id}" "DELETE /locations/{id}" "GET /status" "POST /app-location" "PUT /privacy"; do
  aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "$route" \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION 2>/dev/null || echo "  Route already exists: $route"
done

# Add Lambda permission for API Gateway
# Use a specific statement ID that includes API ID to avoid conflicts
aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id "apigateway-${API_ID}-invoke" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:*:$API_ID/*/*" \
  --region $REGION 2>/dev/null || echo "✓ Lambda permission already exists"

# Create or update stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region $REGION 2>/dev/null || echo "✓ Stage already exists"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id $API_ID --region $REGION --query 'ApiEndpoint' --output text)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "API Endpoint: ${API_ENDPOINT}/prod"
echo ""
echo "Available endpoints:"
echo "  GET    ${API_ENDPOINT}/prod/locations"
echo "  POST   ${API_ENDPOINT}/prod/locations"
echo "  PUT    ${API_ENDPOINT}/prod/locations/{id}"
echo "  DELETE ${API_ENDPOINT}/prod/locations/{id}"
echo ""
echo "Next step: Update src/config/api.js with this endpoint"

# Save endpoint to config file
mkdir -p src/config
cat > src/config/api.js <<EOF
// Auto-generated API configuration
export const API_ENDPOINT = '${API_ENDPOINT}/prod';
EOF

echo "✓ Created src/config/api.js"

# Cleanup
rm -f function.zip
rm -f /tmp/trust-policy.json
rm -f /tmp/dynamodb-policy.json
