#!/bin/bash

# ECR repository URL
ECR_REPO="public.ecr.aws/z6p0z7l2/luna4/prunk"

# Image name and tag
IMAGE_NAME="data-service"
TAG="latest"

# Full image name
FULL_IMAGE_NAME="${ECR_REPO}:${IMAGE_NAME}-${TAG}"

echo "🚀 Building Docker image..."
docker build -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "🏷️  Tagging image for ECR..."
docker tag ${IMAGE_NAME}:latest ${FULL_IMAGE_NAME}

if [ $? -ne 0 ]; then
    echo "❌ Docker tag failed"
    exit 1
fi

echo "📤 Pushing to ECR..."
docker push ${FULL_IMAGE_NAME}

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed"
    exit 1
fi

echo "✅ Successfully pushed ${FULL_IMAGE_NAME} to ECR!"
echo "🌐 Image available at: https://${ECR_REPO}" 