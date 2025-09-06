#!/bin/bash

# Blue-Green Deployment Script
# This script implements blue-green deployment with health checks and traffic switching

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

if [ -z "$REMOTE_PATH" ]; then
    echo "Error: REMOTE_PATH environment variable is not set"
    exit 1
fi

if [ -z "$SSH_KEY_PATH" ]; then
    echo "Error: SSH_KEY_PATH environment variable is not set"
    exit 1
fi

# Configuration
HEALTH_CHECK_ENDPOINT="/health"
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_INTERVAL=2

echo "🚀 Starting Blue-Green Deployment..."

# Function to get current active instance from nginx config
get_active_instance() {
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "grep -o 'proxy_pass http://[^;]*;' /etc/nginx/conf.d/blue-green.conf | grep -o 'blue_backend\|green_backend' | head -1"
}

# Function to get inactive instance
get_inactive_instance() {
    local active=$(get_active_instance)
    if [ "$active" = "blue_backend" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Function to check instance health
check_instance_health() {
    local instance=$1
    local port=""
    
    if [ "$instance" = "blue" ]; then
        port=$BLUE_PORT
    else
        port=$GREEN_PORT
    fi
    
    local health_status=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "curl -s -o /dev/null -w '%{http_code}' http://localhost:$port$HEALTH_CHECK_ENDPOINT || echo '000'")
    
    echo $health_status
}

# Function to wait for instance to be healthy
wait_for_health() {
    local instance=$1
    local port=""
    
    if [ "$instance" = "blue" ]; then
        port=$BLUE_PORT
    else
        port=$GREEN_PORT
    fi
    
    echo "🏥 Waiting for $instance instance to be healthy (port $port)..."
    
    local attempts=0
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))
    
    while [ $attempts -lt $max_attempts ]; do
        local health_status=$(check_instance_health $instance)
        
        if [ "$health_status" = "200" ]; then
            echo "✅ $instance instance is healthy!"
            return 0
        fi
        
        echo "⏳ $instance instance health check: HTTP $health_status (attempt $((attempts + 1))/$max_attempts)"
        sleep $HEALTH_CHECK_INTERVAL
        attempts=$((attempts + 1))
    done
    
    echo "❌ $instance instance failed to become healthy after $HEALTH_CHECK_TIMEOUT seconds"
    return 1
}

# Function to check if nginx is running
check_nginx_status() {
    local nginx_status=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "systemctl is-active nginx 2>/dev/null || echo 'inactive'")
    echo $nginx_status
}

# Function to start instance service
start_instance_service() {
    local instance=$1
    echo "🚀 Starting $instance service..."
    
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl start $TARGET-$instance"
    
    # Check if service started successfully
    local service_status=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "systemctl is-active $TARGET-$instance")
    
    if [ "$service_status" = "active" ]; then
        echo "✅ $instance service started successfully"
        return 0
    else
        echo "❌ Failed to start $instance service"
        return 1
    fi
}

# Function to stop instance service
stop_instance_service() {
    local instance=$1
    echo "🛑 Stopping $instance service..."
    
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl stop $TARGET-$instance || true"
    
    echo "✅ $instance service stopped"
}

# Function to switch traffic
switch_traffic() {
    local target_instance=$1
    local upstream=""
    
    if [ "$target_instance" = "blue" ]; then
        upstream="blue_backend"
    else
        upstream="green_backend"
    fi
    
    echo "🔄 Switching traffic to $target_instance instance..."
    
    # Update nginx configuration
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo sed -i 's/proxy_pass http:\/\/[^;]*;/proxy_pass http:\/\/$upstream;/' /etc/nginx/conf.d/blue-green.conf"
    
    # Test nginx configuration
    echo "🧪 Testing Nginx configuration..."
    local config_test=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo nginx -t 2>&1 || echo 'config-error'")
    
    if [[ "$config_test" == *"config-error"* ]]; then
        echo "❌ Nginx configuration test failed:"
        echo "$config_test"
        return 1
    fi
    
    echo "✅ Nginx configuration test passed"
    
    # Reload nginx
    echo "🔄 Reloading Nginx..."
    ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
        "sudo systemctl reload nginx"
    
    # Verify the switch
    local new_active=$(get_active_instance)
    if [[ "$new_active" == *"$target_instance"* ]]; then
        echo "✅ Traffic successfully switched to $target_instance instance"
        return 0
    else
        echo "❌ Traffic switch failed"
        return 1
    fi
}

# Main deployment logic
echo "🔍 Checking current deployment status..."

# Check if nginx is running
nginx_status=$(check_nginx_status)
if [ "$nginx_status" != "active" ]; then
    echo "❌ Nginx is not running. Please start nginx first using start-nginx.sh"
    exit 1
fi

echo "✅ Nginx is running"

# Get current active and inactive instances
current_active=$(get_active_instance | sed 's/_backend//')
inactive_instance=$(get_inactive_instance)

echo "📊 Current Status:"
echo "  Active Instance: $current_active"
echo "  Inactive Instance: $inactive_instance (deployment target)"

# Check if inactive instance is already running
inactive_service_status=$(ssh -i $SSH_KEY_PATH $REMOTE_USER@$REMOTE_HOST \
    "systemctl is-active $TARGET-$inactive_instance 2>/dev/null || echo 'inactive'")

if [ "$inactive_service_status" = "active" ]; then
    echo "⚠️ $inactive_instance service is already running"
    
    # Check if it's healthy
    if check_instance_health $inactive_instance | grep -q "200"; then
        echo "✅ $inactive_instance instance is healthy, switching traffic..."
        
        if switch_traffic $inactive_instance; then
            echo "🎉 Deployment completed successfully!"
            echo "📊 New Active Instance: $inactive_instance"
            echo "📊 Previous Active Instance: $current_active (now inactive)"
            exit 0
        else
            echo "❌ Traffic switch failed"
            exit 1
        fi
    else
        echo "❌ $inactive_instance service is running but not healthy"
        echo "🛑 Stopping unhealthy service..."
        stop_instance_service $inactive_instance
    fi
fi

# Start the inactive instance service
if ! start_instance_service $inactive_instance; then
    echo "❌ Failed to start $inactive_instance service"
    exit 1
fi

# Wait for the instance to become healthy
if ! wait_for_health $inactive_instance; then
    echo "❌ Deployment failed: $inactive_instance instance is not healthy"
    echo "🔄 Rolling back..."
    stop_instance_service $inactive_instance
    exit 1
fi

# Switch traffic to the new instance
if ! switch_traffic $inactive_instance; then
    echo "❌ Failed to switch traffic to $inactive_instance instance"
    echo "🔄 Rolling back..."
    stop_instance_service $inactive_instance
    exit 1
fi

# Stop the previous active instance
echo "🛑 Stopping previous active instance ($current_active)..."
stop_instance_service $current_active

echo ""
echo "🎉 Blue-Green Deployment Completed Successfully!"
echo "📊 New Active Instance: $inactive_instance"
echo "📊 Previous Active Instance: $current_active (now inactive)"
echo ""
echo "🔍 You can verify the deployment with:"
echo "  ssh $REMOTE_USER@$REMOTE_HOST 'curl http://localhost/health'" 