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
- **Runtime**: Go 1.21+ (deployed as binary on EC2)
- **Framework**: Custom HTTP server (Go)
- **Database**: DynamoDB
- **Authentication**: JWT tokens
- **Email Service**: AWS SES
- **Build Tool**: Makefile (Go build)
- **Validation**: (Go validation libraries)

📖 **[Detailed Backend Documentation →](data-service/README.md)**

### Frontend
- **Framework**: React 19 with Vite and SWC
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Deployment**: Static hosting (Netlify, Vercel, or any static server)

📖 **[Detailed Frontend Documentation →](views/README.md)**

## 📁 Project Structure

```
prunk/
├── data-service/      # Backend API service (Go, EC2, SSH deploy)
│   ├── ...
│   └── README.md
├── services/          # (Deprecated) Node.js/TypeScript backend (see data-service)
│   ├── ...
│   └── README.md
├── views/             # Frontend React application
│   ├── src/           # React source files
│   ├── public/        # Static assets
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

📖 **[Complete Backend Setup Guide →](data-service/README.md)**

Quick start:
```bash
cd data-service
make build
# See README.md for EC2 deployment instructions
```

**Required AWS Resources:**
- DynamoDB tables with names starting with `Prunk`
- SES configuration for email sending
- IAM roles with DynamoDB and SES permissions

### Frontend Setup

📖 **[Complete Frontend Setup Guide →](views/README.md)**

Quick start:
```bash
cd views
npm install
npm run dev
```

Then navigate to `http://localhost:5173`

## 🔧 Development

### Backend Development

📖 **[Complete Backend Development Guide →](data-service/README.md)**

Quick commands:
- **Local development**: `npm run dev`
- **Deploy**: `npm run deploy`
- **Format code**: `npm run format`

### Frontend Development

📖 **[Complete Frontend Development Guide →](views/README.md)**

Quick commands:
- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## 📚 API Documentation

📖 **[Complete API Documentation →](data-service/README.md)**

### Key Endpoints

- `POST /auth/email` - Request email authentication
- `GET /auth/email/verify` - Verify email authentication
- `GET /project` - List user projects
- `POST /project` - Create new project
- `GET /project/{project_id}` - Get project details

## 🔐 Security

- JWT-based authentication
- AWS IAM roles and policies
- Encrypted data transmission
- Secure file storage with S3
- Input validation and sanitization

## 🚀 Deployment

### Backend Deployment

📖 **[Complete Backend Deployment Guide →](data-service/README.md)**

The backend is deployed by building the Go binary and copying it to your EC2 instance via SSH. See the data-service README for details.

### Frontend Deployment

📖 **[Complete Frontend Deployment Guide →](views/README.md)**

The frontend can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.) after running `npm run build`.

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

- Built with React and AWS Lambda
- Inspired by Google Drive and Dropbox
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Contact

- **Project Link**: [https://github.com/yourusername/prunk](https://github.com/yourusername/prunk)
- **Live Demo**: [https://prunk.io](https://prunk.io)

---

⭐ If you find this project helpful, please give it a star!
