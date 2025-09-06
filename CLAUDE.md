# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `make run` - Run the application locally with environment variables from .env (currently the only Makefile target)
- `go run .` - Alternative way to run locally (with .env file automatically loaded)

### Testing and Code Quality
- `go test ./...` - Run all tests 
- `go fmt ./...` - Format code
- `golangci-lint run` - Run linting (if golangci-lint is installed)

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
- Gin HTTP framework with health check (`/health`) and root (`/`) endpoints
- Environment variable configuration via godotenv
- Default port 8010
- Currently only has basic health check functionality

### Data Storage
- **DynamoDB** tables: PrunkUsers, PrunkProjects, PrunkAuthorizations
- **AWS SES** for email authentication
- **JWT tokens** for API authentication

### Project Structure
- `internal/models/` - Data models and database schemas (User, Project, ProjectUser, Authorization)
  - Models are defined with JSON tags for DynamoDB integration
  - User and Project models have status enums (ACTIVE/SUSPENDED)
- `main.go` - Entry point with basic Gin server setup
- `scripts/` - Deployment and utility scripts
- `legacy/` - Previous Node.js implementation (not actively used)
- `bin/` - Compiled binaries (gitignored)

### Current Implementation Status
- **✅ Completed**: Basic Gin server with health check endpoint, data models defined
- **🚧 In Progress**: Full HTTP handlers, database integration, authentication system

### Dependencies
- **Gin** (v1.10.1) - HTTP web framework for Go  
- **godotenv** (v1.5.1) - Environment variable loading from .env files

The codebase currently has basic server infrastructure and complete data models but lacks the HTTP handlers and database integration described in the README.md.