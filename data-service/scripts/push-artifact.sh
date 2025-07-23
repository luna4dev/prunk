#!/bin/bash

# Load environment variables from .env file
if [ -f "../.env" ]; then
    source ../.env
else
    echo "Error: .env file not found in data-service directory"
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

if [ -z "$REMOTE_PATH" ]; then
    echo "Error: REMOTE_PATH environment variable is not set"
    exit 1
fi

if [ -z "$SSH_KEY_PATH" ]; then
    echo "Error: SSH_KEY_PATH environment variable is not set"
    exit 1
fi

# Check if bin directory exists and contains files
if [ ! -d "../bin" ]; then
    echo "Error: bin directory not found"
    exit 1
fi

if [ ! "$(ls -A ../bin)" ]; then
    echo "Error: bin directory is empty"
    exit 1
fi

echo "Connecting to $REMOTE_USER@$REMOTE_HOST..."
echo "Pushing binary files to $REMOTE_PATH..."

# Push all files from bin directory to remote server
scp -i $SSH_KEY_PATH ../bin/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

if [ $? -eq 0 ]; then
    echo "Successfully pushed binary files to remote server"
else
    echo "Error: Failed to push binary files"
    exit 1
fi
