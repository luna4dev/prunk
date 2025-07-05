# Prunk.io Frontend

The frontend application for Prunk.io, a modern file sharing service similar to Google Drive. Built with React, TypeScript, and modern web technologies.

## 🚀 Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Build Tool**: Vite with SWC
- **Package Manager**: npm

## ✨ Features

- **Modern UI/UX**: Clean, responsive design with shadcn/ui components
- **Type Safety**: Full TypeScript support for better development experience
- **Fast Development**: Hot Module Replacement (HMR) with Vite
- **Optimized Builds**: SWC compiler for faster builds
- **State Management**: Lightweight state management with Zustand
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📁 Project Structure

```
views/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── components.json       # shadcn/ui configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 UI Components

This project uses shadcn/ui for consistent, accessible components. Components are located in `src/components/ui/` and can be customized through the `components.json` configuration.

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 📦 State Management

State is managed with Zustand, providing a lightweight and flexible solution for global state management.

### Example Store Setup

```typescript
import { create } from 'zustand'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## 🎯 Key Features

- **File Management**: Upload, organize, and share files
- **User Authentication**: Secure login and user management
- **Real-time Updates**: Live collaboration features
- **Responsive Design**: Works on all devices
- **Dark Mode**: Built-in theme support
- **Accessibility**: WCAG compliant components

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your-backend-api-url
VITE_APP_NAME=Prunk.io
```

### Tailwind CSS

Tailwind is configured in `tailwind.config.js` with custom colors and spacing that match the Prunk.io brand.

### shadcn/ui

Components are configured in `components.json` with:
- TypeScript support
- Tailwind CSS integration
- Custom color scheme
- Responsive design utilities

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options

- **Netlify**: Connect your repository and set build command to `npm run build`
- **Vercel**: Automatic deployment from Git repository
- **GitHub Pages**: Deploy from the `dist/` folder
- **Any Static Host**: Upload the `dist/` folder contents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Related

- **Backend API**: [services/](../services/) - AWS Lambda backend
- **Main Project**: [readme.md](../readme.md) - Complete project overview

---

⭐ If you find this project helpful, please give it a star!
