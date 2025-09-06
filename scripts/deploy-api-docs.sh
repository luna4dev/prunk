#!/bin/bash

# Deploy API documentation to S3
# This script uploads all files from the api/ folder to the developer S3 bucket
# Uses cp instead of sync to avoid deleting files from other services

set -e  # Exit on error

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Source environment variables
ENV_FILE="$SCRIPT_DIR/.deploy.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found"
    echo "Please create $ENV_FILE from .deploy.env.sample"
    exit 1
fi

echo "📋 Loading environment variables from $ENV_FILE"
source "$ENV_FILE"

# Validate required environment variables
if [ -z "$AWS_REGION" ] || [ -z "$DEVELOPER_BUCKET" ] || [ -z "$AWS_DEVELOPER_DISTRIBUTION_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Required: AWS_REGION, DEVELOPER_BUCKET, AWS_DEVELOPER_DISTRIBUTION_KEY"
    exit 1
fi

# Check if api folder exists
API_DIR="$PROJECT_ROOT/api"
if [ ! -d "$API_DIR" ]; then
    echo "❌ Error: API directory not found at $API_DIR"
    exit 1
fi

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed or not in PATH"
    exit 1
fi

echo "🚀 Deploying API documentation to S3..."
echo "   Region: $AWS_REGION"
echo "   Bucket: $DEVELOPER_BUCKET"
echo "   Source: $API_DIR"
echo "   Target: s3://$DEVELOPER_BUCKET/api/"

# Set AWS region
export AWS_DEFAULT_REGION="$AWS_REGION"

# Upload files recursively, preserving other services' files
# Using cp --recursive to only update/create our files without deleting others
aws s3 cp "$API_DIR" "s3://$DEVELOPER_BUCKET/api/" \
    --region "$AWS_REGION" \
    --recursive \
    --no-progress

if [ $? -eq 0 ]; then
    echo "✅ API documentation deployed successfully!"
    echo "   Files uploaded to: s3://$DEVELOPER_BUCKET/api/"
    
    # List our uploaded files for confirmation
    echo ""
    echo "📁 Our uploaded files:"
    aws s3 ls "s3://$DEVELOPER_BUCKET/api/" --region "$AWS_REGION" --recursive | grep -E "\.(yaml|yml|json|html)$"
    
    # Invalidate CloudFront cache for API docs
    echo ""
    echo "🔄 Invalidating CloudFront cache for /api/prunk*..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$AWS_DEVELOPER_DISTRIBUTION_KEY" \
        --paths "/api/prunk*" \
        --output text --query 'Invalidation.Id')
    
    if [ $? -eq 0 ]; then
        echo "✅ CloudFront invalidation created successfully!"
        echo "   Invalidation ID: $INVALIDATION_ID"
        echo "   Pattern: /api/prunk*"
    else
        echo "⚠️  Warning: CloudFront invalidation failed, but deployment succeeded"
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi