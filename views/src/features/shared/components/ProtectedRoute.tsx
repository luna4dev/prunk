import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useIsAuthenticated } from '@/features/auth/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
} 