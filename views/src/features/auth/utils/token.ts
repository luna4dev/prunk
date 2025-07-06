const TOKEN_KEY = 'prunk_auth_token' // store auth token
const USER_KEY = 'prunk_user' // store user object

export const tokenStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
      console.error('Failed to save token:', error)
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      console.error('Failed to remove token:', error)
    }
  },

  getUser: (): any => {
    try {
      const userStr = localStorage.getItem(USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  setUser: (user: any): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Failed to remove user:', error)
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Failed to clear auth data:', error)
    }
  }
} 