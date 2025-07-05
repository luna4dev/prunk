# Prunk.io Backend Services

The backend API services for Prunk.io, built with AWS Lambda, API Gateway, and DynamoDB. This serverless architecture provides scalable, secure file sharing capabilities.

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x with TypeScript
- **Framework**: AWS Lambda with API Gateway
- **Database**: DynamoDB
- **Authentication**: JWT tokens
- **Email Service**: AWS SES
- **Build Tool**: esbuild
- **Deployment**: Serverless Framework
- **Validation**: Zod schema validation

## 📁 Project Structure

```
services/
├── src/
│   ├── authorizers/     # Auth middleware that intercepts requests before API handlers
│   ├── contexts/        # Context classes that restrict information each request has access to
│   ├── controllers/     # MVC controllers that access database models and return/modify data
│   ├── handlers/        # Lambda handlers that process API requests
│   ├── libs/           # Shared utility libraries
│   └── models/         # Data models and database schemas
├── serverless.yml       # Serverless configuration
├── esbuild.config.js    # Build configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS CLI configured
- AWS account with appropriate permissions

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

3. **Set up environment variables**:
   
   The `serverless.yml` file contains configuration for the current deployment. For development, you may need to update:
   
   - `accountId`: Your AWS account ID
   - `JWT_SECRET`: A strong secret key for JWT token signing
   - `SERVICE_DOMAIN`: Your domain name
   - `EMAIL_AUTH_SENDER`: Your SES verified email address
   - `JWT_ISSUER` and `JWT_AUDIENCE`: Your domain name

4. **Set up AWS resources**:
   
   Before deploying, ensure you have:
   
   - **DynamoDB Tables**: Create tables with names starting with `Prunk` (e.g., `PrunkProjects`, `PrunkUsers`)
   - **SES Configuration**: Verify your email domain and set up SES for sending emails
   - **IAM Permissions**: Ensure your AWS credentials have the necessary permissions

5. **Run locally**:
   ```bash
   npm run dev
   ```

6. **Deploy to AWS**:
   ```bash
   npm run deploy
   ```

### Available Scripts

- `npm run dev` - Start local development server
- `npm run deploy` - Deploy to AWS
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

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
   - Token is validated by the `token-authorizer` Lambda function
   - Token contains user information and permissions

### Security Features

- JWT-based authentication with configurable expiration
- AWS IAM roles and policies for resource access
- Encrypted data transmission via HTTPS
- Input validation using Zod schemas
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

Key environment variables configured in `serverless.yml`:

```yaml
# Email authentication
EMAIL_AUTH_SENDER: noreply-prunk@luna4.me
EMAIL_AUTH_DEBOUNCE_TIME: 180000 # 3 minutes
EMAIL_AUTH_TOKEN_EXPIRATION_TIME: 1800000 # 30 minutes

# JWT
JWT_SECRET: your-secret-key
JWT_ISSUER: prunk.luna4.me
JWT_AUDIENCE: prunk.luna4.me
JWT_EXPIRATION_TIME: 2592000000 # 30 days
```

### CORS Configuration

The API is configured with CORS to allow requests from the frontend domain:

```yaml
cors:
  allowOrigins:
    - 'https://prunk.luna4.me'
  allowMethods:
    - 'GET'
    - 'POST'
    - 'PUT'
    - 'DELETE'
    - 'OPTIONS'
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
   - Lambda execution permissions

### Deployment Commands

```bash
# Deploy to development
npm run deploy -- --stage dev

# Deploy to production
npm run deploy -- --stage prod

# Deploy specific function
npm run deploy -- --function function-name
```

## 📊 Monitoring

### CloudWatch Logs

All Lambda functions log to CloudWatch with structured logging:

```typescript
import { log } from './libs/log'

log.info('User authentication requested', { email, timestamp })
log.error('Authentication failed', { error, email })
```

### Metrics

Key metrics to monitor:
- Lambda function duration and errors
- API Gateway request count and latency
- DynamoDB read/write capacity
- SES email delivery rates

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