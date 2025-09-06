#!/bin/bash

# Start Nginx Script
# This script checks if nginx is installed. If not, the script installs it and populate config, making sure the nginx is running on the server

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

echo "🔍 Checking Nginx status on $REMOTE_USER@$REMOTE_HOST..."

# Check if nginx is installed and running
NGINX_STATUS=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
    "systemctl is-active nginx 2>/dev/null || echo 'not-installed'")

if [ "$NGINX_STATUS" = "active" ]; then
    echo "✅ Nginx is already installed and running on the remote server"
    echo "📊 Nginx Status: Active"
    exit 0
elif [ "$NGINX_STATUS" = "inactive" ]; then
    echo "⚠️ Nginx is installed but not running"
    echo "🚀 Starting Nginx..."
    
    # Start nginx
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl start nginx"
    
    # Verify it's running
    NEW_STATUS=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "systemctl is-active nginx")
    
    if [ "$NEW_STATUS" = "active" ]; then
        echo "✅ Nginx started successfully"
    else
        echo "❌ Failed to start Nginx"
        exit 1
    fi
else
    echo "📦 Nginx is not installed. Installing and configuring..."
    
    # Install nginx
    echo "📥 Installing Nginx..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo yum update -y && sudo yum install -y nginx"
    
    # Enable nginx to start on boot
    echo "🔧 Enabling Nginx to start on boot..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl enable nginx"
    
    # Create basic nginx configuration for blue-green deployment
    echo "⚙️ Creating basic Nginx configuration..."
    scp -i $SSH_KEY_PATH ./remote-scripts/blue-green.conf $REMOTE_USER@$REMOTE_HOST:~/blue-green.conf
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mv ~/blue-green.conf /etc/nginx/conf.d/blue-green.conf"
    
    # Create systemd service files for blue and green instances with correct PORT environment variables
    echo "🔧 Creating systemd service files with PORT environment variables..."
    
    # Blue service (port 8080)
    scp -i $SSH_KEY_PATH ./remote-scripts/$TARGET-blue.service $REMOTE_USER@$REMOTE_HOST:~/$TARGET-blue.service
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mv ~/$TARGET-blue.service /etc/systemd/system/$TARGET-blue.service"

    # Green service (port 8081)
    scp -i $SSH_KEY_PATH ./remote-scripts/$TARGET-green.service $REMOTE_USER@$REMOTE_HOST:~/$TARGET-green.service
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mv ~/$TARGET-green.service /etc/systemd/system/$TARGET-green.service"
    
    # Create deployment directory
    echo "📁 Creating deployment directory..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mkdir -p /opt/prunk/$TARGET && sudo chown $REMOTE_USER:$REMOTE_USER /opt/prunk/$TARGET"
    
    # Create blue-green switching script
    echo "🔄 Creating blue-green switching script..."
    scp -i $SSH_KEY_PATH ./remote-scripts/switch-blue-green.sh $REMOTE_USER@$REMOTE_HOST:~switch-blue-green.sh
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mv ~/switch-blue-green.sh /opt/prunk/switch-blue-green.sh"
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo chmod +x /opt/prunk/switch-blue-green.sh"

    # Create health check script
    echo "🏥 Creating health check script..."
    scp -i $SSH_KEY_PATH ./remote-scripts/health-check.sh $REMOTE_USER@$REMOTE_HOST:~health-check.sh
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo mv ~/health-check.sh /opt/prunk/health-check.sh"
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo chmod +x /opt/prunk/health-check.sh"

    # Reload systemd and start services
    echo "🔄 Reloading systemd..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl daemon-reload"

    # Start Nginx
    echo "🚀 Starting Nginx..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl start nginx"

    # Verify it's running
    FINAL_STATUS=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "systemctl is-active nginx")

    if [ "$FINAL_STATUS" = "active" ]; then
        echo "✅ Nginx installed, configured, and started successfully"
        echo "📊 Nginx Status: Active"
        echo "🌐 Nginx is listening on port 80"
        echo "📁 Configuration: /etc/nginx/conf.d/blue-green.conf"
        echo "🔧 Blue Service: /etc/systemd/system/$TARGET-blue.service (PORT=8080)"
        echo "🔧 Green Service: /etc/systemd/system/$TARGET-green.service (PORT=8081)"
    else
        echo "❌ Failed to start Nginx after installation"
        exit 1
    fi
fi

echo ""
echo "🎉 Nginx setup completed successfully!"
echo "📋 Next steps:"
echo "  - Deploy your service binary to /opt/prunk/$TARGET/"
echo "  - Start the blue service: sudo systemctl start $TARGET-blue"
echo "  - Test the deployment: curl http://localhost/health"
echo "  - Switch between instances: sudo /opt/prunk/switch-blue-green.sh [blue|green]"
echo "  - Check health: sudo /opt/prunk/health-check.sh"
echo ""
echo "📁 Configuration files:"
echo "  - Nginx config: /etc/nginx/conf.d/blue-green.conf"
echo "  - Blue service: /etc/systemd/system/$TARGET-blue.service (PORT=8080)"
echo "  - Green service: /etc/systemd/system/$TARGET-green.service (PORT=8081)"
echo "  - Switch script: /opt/prunk/switch-blue-green.sh"
echo "  - Health check: /opt/prunk/health-check.sh" 
