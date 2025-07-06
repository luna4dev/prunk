import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AuthStore, User } from '../types/auth'
import { tokenStorage } from '../utils/token'

// TODO: Replace with actual API client
const apiClient = {
  requestEmailAuth: async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: 'Email sent successfully' }
  },
  
  verifyEmailToken: async (token: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      user: {
        userId: 'user-123',
        email: 'test@example.com',
      },
      token: 'mock-jwt-token'
    }
  }
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string) => {
          set({ isLoading: true, error: null })
          
          try {
            await apiClient.requestEmailAuth(email)
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Login failed' 
            })
          }
        },

        verifyToken: async (token: string) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await apiClient.verifyEmailToken(token)
            
            // Save to localStorage
            tokenStorage.setToken(response.token)
            tokenStorage.setUser(response.user)
            
            set({
              isAuthenticated: true,
              user: response.user,
              token: response.token,
              isLoading: false,
              error: null
            })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Token verification failed' 
            })
          }
        },

        logout: () => {
          // Clear localStorage
          tokenStorage.clear()
          
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null
          })
        },

        refreshToken: async () => {
          const token = get().token
          if (!token) return
          
          set({ isLoading: true })
          
          try {
            // TODO: Implement token refresh API call
            set({ isLoading: false })
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Token refresh failed' 
            })
            // If refresh fails, logout
            get().logout()
          }
        },

        setUser: (user: User) => {
          tokenStorage.setUser(user)
          set({ user })
        },

        setToken: (token: string) => {
          tokenStorage.setToken(token)
          set({ token })
        },

        setError: (error: string | null) => {
          set({ error })
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
) 