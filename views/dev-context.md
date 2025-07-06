# prunk view
a webpage for prunk io which is a google drive like service. In this project, vite react is used. the detailed context can be found from ./README.md 

## basic data structure context
- project: a project is a collection of folders and files.
- folder: a folder is a collection of files.
- file: a file is a collection of files.
- user: a user is a collection of projects.

## some basic rules
user can create a project and add folders and files to the project.
user can create a folder and add files to the folder.
user can create a file and add files to the file.
project-user is n-n relation, and there is one owner user in the project 
user login is only done by email. no password login.

## basic layout structure
- The webpage layouts are different between mobile and web view. So we should separate route
- We will develope mobile view first and then web

### mobile view
- login
- main layout: a mobile layout consist of top bar, bottom bar(project, search, user)
  - project list
  - project detail(including root folder and files)
  - folder detail(including files)
  - search
  - user
- modals
  - file preview

### web view
- login: not sure if we share the same login page. if not, we should separate route
- main layout: dashboard like layout.
  - top bar: ci, search bar, user icon
  - left sidebar: project list, folder structure, some action buttons
  - right sidebar: details for file, folder, project
  - main content: folder view, file preview

### shared(mobile and web) components
- modal
  - create project
  - create folder
  - create file
  - upload file
  - delete file
  - delete folder
  - delete project
  - rename file
  - rename folder
  - rename project

## Action Items

### Phase 1: Foundation & Authentication
- [x] Set up routing structure (React Router)
  - Feature-based structure with auth, mobile, web, and shared modules
  - Device detection for mobile vs web routing
  - Protected routes for authenticated pages
- [ ] Create authentication context/store (Zustand)
- [ ] Implement email login flow
- [ ] Create protected route wrapper
- [ ] Set up API client for backend communication
- [ ] Create basic error handling and loading states

### Phase 2: Mobile View Development
- [ ] Create mobile layout components
  - [ ] Top bar component
  - [ ] Bottom navigation bar
  - [ ] Mobile navigation context
- [ ] Implement mobile routes
  - [ ] Login page
  - [ ] Project list page
  - [ ] Project detail page
  - [ ] Folder detail page
  - [ ] Search page
  - [ ] User profile page
- [ ] Create mobile-specific components
  - [ ] Project card component
  - [ ] File/folder list item component
  - [ ] Search input component
  - [ ] User avatar component

### Phase 3: Shared Components & Modals
- [ ] Create modal system
  - [ ] Modal wrapper component
  - [ ] Modal context/store
- [ ] Implement shared modals
  - [ ] Create project modal
  - [ ] Create folder modal
  - [ ] Create file modal
  - [ ] Upload file modal
  - [ ] Delete confirmation modal
  - [ ] Rename modal
- [ ] Create form components
  - [ ] Input components
  - [ ] Button components
  - [ ] Form validation

### Phase 4: Web View Development
- [ ] Create web layout components
  - [ ] Top bar with search and user icon
  - [ ] Left sidebar with project list and folder structure
  - [ ] Right sidebar for details
  - [ ] Main content area
- [ ] Implement web-specific routes
  - [ ] Dashboard layout
  - [ ] Project management view
  - [ ] File preview view
- [ ] Create web-specific components
  - [ ] Project sidebar component
  - [ ] Folder tree component
  - [ ] File grid/list view
  - [ ] Detail panel component

### Phase 5: File Management Features
- [ ] Implement file operations
  - [ ] File upload functionality
  - [ ] File download functionality
  - [ ] File preview (images, documents, etc.)
  - [ ] File sharing
- [ ] Implement folder operations
  - [ ] Folder creation
  - [ ] Folder navigation
  - [ ] Folder sharing
- [ ] Implement project operations
  - [ ] Project creation
  - [ ] Project settings
  - [ ] Project sharing

### Phase 6: Advanced Features
- [ ] Search functionality
  - [ ] Global search
  - [ ] Search within project
  - [ ] Search filters
- [ ] User management
  - [ ] User profile page
  - [ ] User settings
  - [ ] Project collaboration
- [ ] Real-time updates
  - [ ] WebSocket integration
  - [ ] Real-time file changes
  - [ ] Collaboration indicators

### Phase 7: Polish & Optimization
- [ ] Responsive design improvements
- [ ] Performance optimization
  - [ ] Lazy loading
  - [ ] Virtual scrolling for large lists
  - [ ] Image optimization
- [ ] Accessibility improvements
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] ARIA labels
- [ ] Error handling
  - [ ] Network error handling
  - [ ] Offline support
  - [ ] Retry mechanisms

### Phase 8: Testing & Deployment
- [ ] Unit tests
  - [ ] Component tests
  - [ ] Hook tests
  - [ ] Utility function tests
- [ ] Integration tests
  - [ ] API integration tests
  - [ ] User flow tests
- [ ] E2E tests
  - [ ] Critical user journeys
  - [ ] Cross-browser testing
- [ ] Deployment setup
  - [ ] Build optimization
  - [ ] Environment configuration
  - [ ] CI/CD pipeline

### Technical Debt & Maintenance
- [ ] Code organization
  - [ ] Component structure
  - [ ] State management patterns
  - [ ] API integration patterns
- [ ] Documentation
  - [ ] Component documentation
  - [ ] API documentation
  - [ ] Development guidelines
- [ ] Performance monitoring
  - [ ] Bundle size analysis
  - [ ] Runtime performance
  - [ ] User experience metrics