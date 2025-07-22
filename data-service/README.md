# Prunk.io Data Service

The backend API service for Prunk.io, rewritten in Go for performance and flexibility. This service provides the same API as the original Node.js/Serverless backend, but is designed to run on EC2 instances and is deployed via SSH.

## 🚀 Tech Stack

- **Language**: Go (Golang)
- **Deployment**: Compiled binary deployed to EC2 via SSH
- **Database**: DynamoDB
- **Authentication**: JWT tokens
- **Email Service**: AWS SES
- **Testing**: Go test
- **Linting**: golangci-lint

## 📁 Project Structure

```
data-service/
├── bin/                # Compiled binaries
├── handlers/           # HTTP handlers
├── models/             # Data models and database schemas
├── scripts/            # Utility scripts
├── main.go             # Application entry point
├── Makefile            # Build, test, lint, and deployment commands
└── go.mod              # Go module definition
```

## 🛠️ Development

### Prerequisites

- Go 1.21+
- AWS CLI configured
- AWS account with appropriate permissions
- golangci-lint (for linting)
- SSH access to your EC2 deployment target

### Getting Started

1. **Install dependencies** (Go modules):
   ```bash
   go mod tidy
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

3. **Set up environment variables**:
   
   The service expects environment variables for AWS, JWT, and SES configuration. You can use a `.env` file or set them in your EC2 environment. Example variables:
   
   - `AWS_REGION`: AWS region
   - `DYNAMODB_TABLE_USERS`: DynamoDB users table name
   - `DYNAMODB_TABLE_PROJECTS`: DynamoDB projects table name
   - `DYNAMODB_TABLE_AUTHORIZATIONS`: DynamoDB authorizations table name
   - `EMAIL_AUTH_SENDER`: SES verified sender email
   - `JWT_SECRET`: Secret key for JWT signing
   - `JWT_ISSUER`: JWT issuer
   - `JWT_AUDIENCE`: JWT audience
   - `SERVICE_DOMAIN`: Your domain name

4. **Set up AWS resources**:
   - **DynamoDB Tables**: Create tables with names starting with `Prunk` (e.g., `PrunkProjects`, `PrunkUsers`)
   - **SES Configuration**: Verify your email domain and set up SES for sending emails
   - **IAM Permissions**: Ensure your AWS credentials have the necessary permissions

5. **Build the service**:
   - For local development (macOS/arm64):
     ```bash
     make build
     ```
   - For production (Linux/amd64, for EC2):
     ```bash
     make build-prod
     ```
   - Binaries are output to the `bin/` directory.

6. **Run locally**:
   ```bash
   make dev
   ```

7. **Test and lint**:
   ```bash
   make test
   make lint
   make fmt
   ```

### Deployment

1. **Build the production binary**:
   ```bash
   make build-prod
   ```
   This creates `bin/data-service-linux`.

2. **Copy the binary to your EC2 instance via SSH**:
   ```bash
   scp -i <your-ec2-key.pem> bin/data-service-linux ec2-user@<ec2-ip>:/home/ec2-user/data-service
   ```

3. **SSH into your EC2 instance and run the service**:
   ```bash
   ssh -i <your-ec2-key.pem> ec2-user@<ec2-ip>
   chmod +x /home/ec2-user/data-service
   ./data-service
   ```
   Ensure your environment variables are set on the EC2 instance (via `.env` or systemd service, etc).

## 📚 API Endpoints

### Authentication

- `POST /auth/email` - Request email authentication
- `GET /auth/email/verify` - Verify email authentication

### Projects

- `GET /project` - List user projects (requires authentication)
- `POST /project` - Create new project (requires authentication)
- `GET /project/{project_id}` - Get project details (requires authentication)

## 🔐 Security

### Authentication Flow

1. **Email Authentication**:
   - User requests authentication via email
   - System sends verification link to user's email
   - User clicks link to verify and receive JWT token
   - Token is used for subsequent API calls

2. **JWT Token Authorization**:
   - All protected endpoints require valid JWT token
   - Token is validated by the service
   - Token contains user information and permissions

### Security Features

- JWT-based authentication with configurable expiration
- AWS IAM roles and policies for resource access
- Encrypted data transmission via HTTPS (when behind a reverse proxy)
- Input validation
- Rate limiting and debouncing for email requests

## 🗄️ Database Schema

### DynamoDB Tables

#### PrunkUsers
- `id` (String, Partition Key) - User unique identifier
- `email` (String) - User email address
- `created_at` (String) - User creation timestamp
- `updated_at` (String) - Last update timestamp

#### PrunkProjects
- `id` (String, Partition Key) - Project unique identifier
- `user_id` (String, GSI Partition Key) - Owner user ID
- `name` (String) - Project name
- `description` (String) - Project description
- `created_at` (String) - Project creation timestamp
- `updated_at` (String) - Last update timestamp

#### PrunkAuthorizations
- `id` (String, Partition Key) - Authorization unique identifier
- `email` (String) - User email
- `token` (String) - Verification token
- `expires_at` (String) - Token expiration timestamp
- `created_at` (String) - Authorization creation timestamp

## 🔧 Configuration

### Environment Variables

Set these in your EC2 environment or via a `.env` file:

```
EMAIL_AUTH_SENDER=noreply-prunk@luna4.me
EMAIL_AUTH_DEBOUNCE_TIME=180000 # 3 minutes
EMAIL_AUTH_TOKEN_EXPIRATION_TIME=1800000 # 30 minutes
JWT_SECRET=your-secret-key
JWT_ISSUER=prunk.luna4.me
JWT_AUDIENCE=prunk.luna4.me
JWT_EXPIRATION_TIME=2592000000 # 30 days
```

## 🚀 Deployment

### AWS Resources Required

1. **DynamoDB Tables**:
   - `PrunkUsers` - User data storage
   - `PrunkProjects` - Project data storage
   - `PrunkAuthorizations` - Email verification tokens

2. **SES Configuration**:
   - Verified email domain
   - Email sending permissions

3. **IAM Roles**:
   - DynamoDB read/write permissions
   - SES send email permissions
   - EC2 instance permissions as needed

## 📊 Monitoring

- Use CloudWatch or your preferred logging/monitoring solution on EC2.
- Log output is written to stdout/stderr by default.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Related

- **Frontend**: [views/](../views/) - React frontend application
- **Main Project**: [readme.md](../readme.md) - Complete project overview

---

⭐ If you find this project helpful, please give it a star! 