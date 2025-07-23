# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `make build` - Build for local development (Darwin/arm64)
- `make build-prod` - Build for production deployment (Linux/amd64)
- `make dev` - Build and run locally
- `make clean` - Remove compiled binaries

### Testing and Code Quality
- `make test` - Run all tests with `go test ./...`
- `make lint` - Run golangci-lint for code linting
- `make fmt` - Format code with `go fmt ./...`

### Go Module Management
- `go mod tidy` - Clean up and download dependencies

## Architecture Overview

This is a Go HTTP API service for Prunk.io, replacing a Node.js/Serverless backend. It's designed for EC2 deployment via compiled binaries.

### Key Components

**Models** (`models/`):
- `User` - User data with email authentication, status (ACTIVE/SUSPENDED), preferences
- `Project` - Project data with status, preferences, timestamps
- `ProjectUser` - Relationship between users and projects
- `Authorization` - Email verification tokens for authentication

**Main Application** (`main.go`):
- Basic HTTP server with health check endpoint
- Environment variable configuration via godotenv
- Default port 8080

**Build System**:
- Makefile with cross-platform compilation (Darwin for dev, Linux for prod)
- Binaries output to `bin/` directory

### Data Storage
- **DynamoDB** tables: PrunkUsers, PrunkProjects, PrunkAuthorizations
- **AWS SES** for email authentication
- **JWT tokens** for API authentication

### Authentication Flow
1. Email-based authentication via `/auth/email` endpoints
2. SES sends verification emails with tokens
3. JWT tokens issued after email verification
4. Protected endpoints require valid JWT

### Environment Variables Required
- AWS configuration (region, DynamoDB table names)
- JWT settings (secret, issuer, audience, expiration)
- SES configuration (sender email, timing settings)

### Project Structure
- `handlers/` - HTTP route handlers (currently empty)
- `models/` - Data models and database schemas
- `scripts/` - Utility scripts (currently empty)
- `bin/` - Compiled binaries (gitignored)

The codebase is currently in early stages with basic server setup and model definitions, but no handlers or database integration implemented yet.