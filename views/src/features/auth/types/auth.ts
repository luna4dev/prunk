export interface User {
  userId: string
  email: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface LoginRequest {
  email: string
}

export interface LoginResponse {
  message: string
}

export interface VerifyTokenRequest {
  token: string
}

export interface VerifyTokenResponse {
  user: User
  token: string
}

export interface AuthActions {
  // Actions
  login: (email: string) => Promise<void>
  verifyToken: (token: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions 