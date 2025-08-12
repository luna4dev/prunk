# Deployment Scripts Documentation

This directory contains comprehensive deployment scripts for the Prunk Data Service, implementing a robust blue-green deployment system with zero-downtime deployments.

## 🏗️ Architecture Overview

```
Internet → Nginx → Blue Instance or Green Instance
                    ↓
            Automatic traffic switching with health checks
```

## 📁 Scripts Overview

### **Core Deployment Scripts**

#### 1. `start-nginx.sh` - Infrastructure Setup
**Purpose**: Sets up the complete blue-green deployment infrastructure on your EC2 instance.

**What it does**:
- Installs and configures Nginx on Amazon Linux 2
- Creates systemd services for blue and green instances
- Sets up blue-green deployment configuration
- Creates utility scripts for switching and health checks
- Configures proper PORT environment variables 

**Usage**:
```bash
# Run from the scripts directory
./start-nginx.sh
```

**Output**:
- Nginx running
- Systemd services: `data-service-blue.service` and `data-service-green.service`
- Configuration files in `/etc/nginx/conf.d/`
- Utility scripts in `/opt/prunk/`

#### 2. `push-env.sh` - Environment Variables
**Purpose**: Pushes server environment variables to the remote server.

**What it does**:
- Copies `../.env` file to remote server
- Places in user's home directory (`/home/$REMOTE_USER/.env`)
- Optional: Can copy to root directory if needed

**Usage**:
```bash
# Run from the scripts directory
./push-env.sh
```

**Note**: Use this when you need to update environment variables on the server.

#### 3. `push-artifact.sh` - Binary Deployment
**Purpose**: Pushes the compiled binary to the designated target directory on the remote server.

**What it does**:
- Copies binary from `../bin/` to remote server
- Places in specified `REMOTE_PATH`
- Basic deployment without blue-green switching

**Usage**:
```bash
# Run from the scripts directory
./push-artifact.sh
```

**Use case**: Simple deployments when you don't need blue-green switching.

#### 4. `deploy-blue-green.sh` - Smart Deployment
**Purpose**: Performs intelligent blue-green deployment with health checks and automatic traffic switching.

**What it does**:
- Automatically determines which instance is active/inactive
- Deploys to the inactive instance
- Runs comprehensive health checks
- Switches traffic only after successful health verification
- Includes automatic rollback on failure
- Manages systemd services automatically

**Usage**:
```bash
# Run from the scripts directory
./deploy-blue-green.sh
```

**Deployment Flow**:
1. **Status Check**: Verify nginx is running
2. **Instance Analysis**: Determine active/inactive instances
3. **Service Start**: Start inactive instance service
4. **Health Verification**: Wait for healthy response
5. **Traffic Switch**: Update nginx and reload
6. **Cleanup**: Stop previous active instance
7. **Verification**: Confirm successful deployment

#### 5. `stop-nginx.sh` - Service Shutdown
**Purpose**: Completely stops nginx on the remote server.

**What it does**:
- Stops nginx service
- Verifies shutdown was successful
- Useful for maintenance or troubleshooting

**Usage**:
```bash
# Run from the scripts directory
./stop-nginx.sh
```

**Use case**: When you need to completely stop nginx for maintenance.

#### 6. `reset-nginx.sh` - Service Restart
**Purpose**: Restarts nginx (useful when environment variables change).

**What it does**:
- Stops nginx completely
- Starts nginx fresh
- Useful after configuration changes

**Usage**:
```bash
# Run from the scripts directory
./reset-nginx.sh
```

**Use case**: After updating nginx configuration or environment variables.

## 🚀 Getting Started

### **Prerequisites**

1. **Environment Configuration**:
   ```bash
   # Create .deploy.env file in scripts directory
   REMOTE_HOST=your-ec2-ip
   REMOTE_USER=some user
   REMOTE_PATH=/opt/prunk/data-service/data-service
   SSH_KEY_PATH=/path/to/your/ssh/key
   ```

2. **SSH Access**: Ensure you can SSH to your EC2 instance
3. **Sudo Access**: Scripts require sudo access on the remote server

### **Initial Setup (One-time)**

1. **Set up infrastructure**:
   ```bash
   ./start-nginx.sh
   ```

2. **Verify setup**:
   ```bash
   ssh $REMOTE_USER@$REMOTE_HOST 'sudo systemctl status nginx'
   ssh $REMOTE_USER@$REMOTE_HOST 'sudo systemctl status data-service-blue'
   ```

### **Regular Deployment**

1. **Build your service**:
   ```bash
   make build-prod
   ```

2. **Deploy using blue-green**:
   ```bash
   ./deploy-blue-green.sh
   ```

## 🔧 Service Management

### **Systemd Services**

- **Blue Service**: `data-service-blue.service` (Port 8080)
- **Green Service**: `data-service-green.service` (Port 8081)

### **Service Commands**

```bash
# Start services
sudo systemctl start data-service-blue
sudo systemctl start data-service-green

# Stop services
sudo systemctl stop data-service-blue
sudo systemctl stop data-service-green

# Check status
sudo systemctl status data-service-blue
sudo systemctl status data-service-green

# View logs
sudo journalctl -u data-service-blue -f
sudo journalctl -u data-service-green -f
```

### **Nginx Management**

```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx
```

## 🏥 Health Checks

### **Health Endpoint**

Your Go service must implement a `/health` endpoint that returns HTTP 200:

```go
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("healthy"))
}
```

### **Health Check Commands**

```bash
# Check health directly
curl http://localhost:PORT/health  # Blue instance
curl http://localhost:PORT/health  # Green instance

# Use the health check script
sudo /opt/prunk/health-check.sh
```

## 🔄 Traffic Switching

### **Manual Switching**

```bash
# Switch to blue instance
sudo /opt/prunk/switch-blue-green.sh blue

# Switch to green instance
sudo /opt/prunk/switch-blue-green.sh green
```

### **Automatic Switching**

The `deploy-blue-green.sh` script automatically handles traffic switching after successful health checks.

## 📊 Monitoring

### **Check Current Active Instance**

```bash
# View nginx configuration to see which backend is active
grep "proxy_pass" /etc/nginx/conf.d/blue-green.conf
```

### **Monitor Traffic**

```bash
# Watch nginx access logs
sudo tail -f /var/log/nginx/access.log

# Monitor service status
watch -n 5 'sudo systemctl status data-service-blue data-service-green'
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Service Won't Start**
```bash
# Check service logs
sudo journalctl -u data-service-blue -n 50

# Check if binary exists and is executable
ls -la /opt/prunk/data-service/

# Check service configuration
sudo systemctl cat data-service-blue
```

#### **Health Check Fails**
```bash
# Test health endpoint directly
curl http://localhost:PORT/health
curl http://localhost:PORT/health

# Check if service is listening on port
sudo netstat -tlnp | grep :808
```

#### **Nginx Configuration Issues**
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload nginx configuration
sudo systemctl reload nginx
```

#### **Port Conflicts**
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :808
sudo lsof -i :PORT
sudo lsof -i :PORT
```

### **Debug Mode**

For detailed debugging, you can run scripts with verbose output:

```bash
# Add debug output to scripts
set -x  # Add this to any script for verbose output
```

## 🔒 Security Notes

- **SSH Key Authentication**: All remote operations use SSH key authentication
- **Sudo Access**: Scripts require sudo access on the remote server
- **Service User**: Services run as root
- **File Permissions**: Sensitive files have appropriate permissions
- **Health Endpoints**: Health check endpoints are publicly accessible (consider restricting if needed)

## 📚 Additional Resources

- **Nginx Documentation**: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- **Systemd Service Management**: [https://systemd.io/](https://systemd.io/)
- **Amazon Linux 2 User Guide**: [https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2.html)
- **Blue-Green Deployment Best Practices**: Industry standard deployment methodology

## 🤝 Support

If you encounter issues:

1. **Check the logs** using the commands above
2. **Verify environment variables** are set correctly
3. **Ensure SSH access** works properly
4. **Check sudo permissions** on the remote server
5. **Review the troubleshooting section** above

---

**Note**: These scripts are designed to be production-ready and handle edge cases gracefully. Always test in a staging environment before using in production.
