# Prunk.io

A modern file sharing service similar to Google Drive, built as a hobby project.

## 🚀 Overview

Prunk.io is a cloud-based file sharing platform that allows users to store, organize, and share files securely. Built with modern web technologies, it provides an intuitive interface for managing your digital assets.

## ✨ Features

- **File Upload & Storage**: Secure cloud storage for your files
- **File Organization**: Create folders and organize your content
- **File Sharing**: Share files and folders with others via links
- **User Authentication**: Secure login and user management
- **Real-time Collaboration**: Work together on shared files
- **Cross-platform Access**: Access your files from any device
- **Version Control**: Track file changes and restore previous versions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: AWS Lambda with API Gateway
- **Database**: DynamoDB
- **Authentication**: JWT tokens
- **Email Service**: AWS SES
- **Build Tool**: esbuild

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📁 Project Structure

```
prunk/
├── services/          # Backend API services
│   ├── src/
│   │   ├── authorizers/    # AWS Lambda authorizers
│   │   ├── contexts/       # Database contexts
│   │   ├── controllers/    # API controllers
│   │   ├── handlers/       # Lambda handlers
│   │   ├── libs/          # Shared libraries
│   │   └── models/        # Data models
│   └── package.json
├── view/              # Frontend Next.js application
│   ├── src/
│   │   └── app/      # Next.js app directory
│   └── package.json
└── readme.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS CLI configured
- AWS account with appropriate permissions

### Backend Setup

1. **Navigate to the services directory**:
   ```bash
   cd services
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

4. **Set up serverless.yml configuration**:
   
   The `serverless.yml` file contains sensitive configuration (AWS account details, JWT secrets, etc.) and is gitignored for security reasons. You need to create your own configuration file based on the project structure.
   
   Create a `serverless.yml` file in the `services/` directory with the following key configurations:
   
   **Required Environment Variables:**
   - `JWT_SECRET`: A strong secret key for JWT token signing
   - `SERVICE_DOMAIN`: Your domain name
   - `EMAIL_AUTH_SENDER`: Your SES verified email address
   - `JWT_ISSUER` and `JWT_AUDIENCE`: Your domain name
   - `accountId`: Your AWS account ID
   
   **Required AWS Resources:**
   - DynamoDB tables with names starting with `Prunk`
   - SES configuration for email sending
   - IAM roles with DynamoDB and SES permissions
   
   **CORS Configuration:**
   - Update `allowOrigins` to include your frontend domain
   
   **Functions:**
   - Email authentication handlers
   - Project management handlers
   - JWT token authorizer
   
   Refer to the Serverless Framework documentation for the complete configuration structure.

5. **Set up AWS resources**:
   
   Before deploying, you need to set up the required AWS resources:
   
   - **DynamoDB Tables**: Create tables with names starting with `Prunk` (e.g., `PrunkProjects`, `PrunkUsers`)
   - **SES Configuration**: Verify your email domain and set up SES for sending emails
   - **IAM Permissions**: Ensure your AWS credentials have the necessary permissions
   
6. **Deploy the backend**:
   ```bash
   npm run deploy
   ```

### Frontend Setup

1. **Navigate to the view directory**:
   ```bash
   cd view
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=your-api-gateway-url
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🔧 Development

### Backend Development

- **Build**: `npm run build`
- **Test**: `npm test`
- **Deploy**: `npm run deploy`
- **Local development**: `npm run dev`

### Frontend Development

- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Production preview**: `npm run start`
- **Lint**: `npm run lint`

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/request-email` - Request email authentication
- `POST /auth/verify-email` - Verify email authentication
- `POST /auth/login` - User login

### Project Endpoints

- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### User Management

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /project-users` - Get project users

## 🔐 Security

- JWT-based authentication
- AWS IAM roles and policies
- Encrypted data transmission
- Secure file storage with S3
- Input validation and sanitization

## 🚀 Deployment

### Backend Deployment

The backend is deployed using AWS SAM (Serverless Application Model):

```bash
cd services
npm run deploy
```

### Frontend Deployment

The frontend is deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## 🤝 Contributing

This is a hobby project, but contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and AWS Lambda
- Inspired by Google Drive and Dropbox
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Contact

- **Project Link**: [https://github.com/yourusername/prunk](https://github.com/yourusername/prunk)
- **Live Demo**: [https://prunk.io](https://prunk.io)

---

⭐ If you find this project helpful, please give it a star!
