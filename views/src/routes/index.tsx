import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useMediaQuery } from '@/features/shared/hooks/useMediaQuery'
import MobileRoutes from './MobileRoutes'
import WebRoutes from './WebRoutes'
import { ProtectedRoute } from '@/features/shared/components/ProtectedRoute'
import LoginPage from '@/features/auth/pages/LoginPage'

export default function AppRoutes() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes - device-specific */}
        <Route path="/" element={<ProtectedRoute><Navigate to={isMobile ? '/mobile' : '/web'} replace /></ProtectedRoute>} />
        <Route path="/mobile/*" element={<ProtectedRoute><MobileRoutes /></ProtectedRoute>} />
        <Route path="/web/*" element={<ProtectedRoute><WebRoutes /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
} 