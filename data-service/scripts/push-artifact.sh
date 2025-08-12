#!/bin/bash

# Load environment variables from .env file
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
echo "Pushing $TARGET to $REMOTE_PATH..."

# Push all files from bin directory to remote server
scp -i $SSH_KEY_PATH ../bin/$TARGET $REMOTE_USER@$REMOTE_HOST:~$TARGET
ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
    "sudo mv ~/$TARGET /opt/prunk/$TARGET/$TARGET"

if [ $? -eq 0 ]; then
    echo "Successfully pushed $TARGET to remote server"
else
    echo "Error: Failed to push $TARGET"
    exit 1
fi
