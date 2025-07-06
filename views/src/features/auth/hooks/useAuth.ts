import { useAuthStore } from '../store/authStore'
import type { User } from '../types/auth'

export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    // State
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    login: store.login,
    verifyToken: store.verifyToken,
    logout: store.logout,
    refreshToken: store.refreshToken,
    setUser: store.setUser,
    setToken: store.setToken,
    setError: store.setError,
    setLoading: store.setLoading,
    clearError: store.clearError,
    
    // Computed values
    isLoggedIn: store.isAuthenticated && !!store.user,
    userEmail: store.user?.email,
    userId: store.user?.userId
  }
}

// Hook for checking if user is authenticated
export const useIsAuthenticated = () => {
  return useAuthStore(state => state.isAuthenticated)
}

// Hook for getting user data
export const useUser = (): User | null => {
  return useAuthStore(state => state.user)
}

// Hook for getting auth loading state
export const useAuthLoading = () => {
  return useAuthStore(state => state.isLoading)
}

// Hook for getting auth error
export const useAuthError = () => {
  return useAuthStore(state => state.error)
} 