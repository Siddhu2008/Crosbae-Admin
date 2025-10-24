"use client"

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
}

interface AuthState {
  user_data: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<string>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user_data: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        throw new Error("No refresh token")
      }

      const response = await authAPI.refreshToken(refreshToken)
      localStorage.setItem("access_token", response.access)

      const userData = await authAPI.getCurrentUser()
      setAuthState({
        user_data: userData,
        isLoading: false,
        isAuthenticated: true,
      })

      return response.access
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
      throw error
    }
  }, [])

  const login = async (username: string, password: string) => {
  try {
    const response = await authAPI.login(username, password)
    localStorage.setItem("access_token", response.access)
    localStorage.setItem("refresh_token", response.refresh)

    const userData = response.user_data  // ✅ use directly

    if (!(userData.is_staff ?? userData.isStaff)) {
      throw new Error("Access denied. Admin privileges required.")
    }

    setAuthState({
      user_data: userData,
      isLoading: false,
      isAuthenticated: true,
    })

    router.push("/dashboard")
  } catch (error: any) {
    console.error("Login failed:", error)
    throw error
  }
}


  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setAuthState({
      user_data: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push("/login")
  }, [router])

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setAuthState({
          user_data: null,
          isLoading: false,
          isAuthenticated: false,
        })
        return
      }

      const userData = await authAPI.getCurrentUser()

      if (!userData.is_staff && !userData.is_superuser) {
        logout()
        return
      }

      setAuthState({
        user_data: userData,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error: any) {
      console.error("Auth check failed:", error)

      if (error.response?.status === 401) {
        try {
          await refreshToken()
        } catch (refreshError) {
          logout()
        }
      } else {
        logout()
      }
    }
  }, [refreshToken, logout])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    checkAuth,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
