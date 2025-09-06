#!/bin/bash

# Push Environment Variables Script
# This script copies the ../.env file to the root directory of the remote server

set -e

# Load environment variables from .deploy.env file
if [ -f "./.deploy.env" ]; then
    source ./.deploy.env
else
    echo "Error: .deploy.env file not found in scripts directory"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$REMOTE_HOST" ]; then
    echo "Error: REMOTE_HOST environment variable is not set"
    exit 1
fi

if [ -z "$REMOTE_USER" ]; then
    echo "Error: REMOTE_USER environment variable is not set"
    exit 1
fi

if [ -z "$SSH_KEY_PATH" ]; then
    echo "Error: SSH_KEY_PATH environment variable is not set"
    exit 1
fi

# Check if ../.env file exists
if [ ! -f "../.env" ]; then
    echo "Error: ../.env file not found"
    exit 1
fi

echo "📤 Pushing environment variables to $REMOTE_USER@$REMOTE_HOST..."

# Copy the .env file to the remote server's root directory
scp -i $SSH_KEY_PATH ../.env $REMOTE_USER@$REMOTE_HOST:/home/$REMOTE_USER/.env

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed .env file to remote server"
    echo "📁 Location: /home/$REMOTE_USER/.env"
else
    echo "❌ Failed to push .env file to remote server"
    exit 1
fi

# Optionally, you can also copy it to the root directory if needed
# Uncomment the following lines if you want to copy to root directory as well
# echo "📤 Copying .env to root directory..."
# ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
#     "sudo cp /home/$REMOTE_USER/.env /.env && sudo chown root:root /.env && sudo chmod 600 /.env"

echo ""
echo "🎉 Environment variables pushed successfully!"
echo "📋 Next steps:"
echo "  - Restart services that need the new environment variables"
echo "  - Use reset-nginx.sh if nginx needs new environment variables" 