#!/bin/bash

# Stop Nginx Script
# This script stops nginx completely on the remote server

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

echo "🛑 Stopping Nginx on $REMOTE_USER@$REMOTE_HOST..."

# Stop nginx
ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
    "sudo systemctl stop nginx"

if [ $? -eq 0 ]; then
    echo "✅ Nginx stopped successfully"
else
    echo "❌ Failed to stop Nginx"
    exit 1
fi

# Verify nginx is stopped
NGINX_STATUS=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
    "systemctl is-active nginx 2>/dev/null || echo 'inactive'")

if [ "$NGINX_STATUS" = "inactive" ]; then
    echo "✅ Nginx is now completely stopped"
else
    echo "⚠️ Warning: Nginx may still be running (Status: $NGINX_STATUS)"
fi 