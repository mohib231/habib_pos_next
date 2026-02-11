'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Helper to fetch user data using the token
  const fetchUser = async (token: string) => {
    try {
      // We only send the token. Middleware handles decoding and finding the user.
      const response = await fetch('/api/profile', {
        method: 'GET', // Ensure you have a GET route for this!
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Assuming your API returns { user: { ... } } or { data: { ... } }
        // Adjust 'data.user' based on your exact API response structure
        const userData = data.user || data.data

        setUser({
          id: userData._id || userData.id,
          username: userData.username,
          email: userData.email,
        })
        setIsAuthenticated(true)
      } else {
        // Token invalid or expired according to server
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        await fetchUser(token)
      } else {
        setLoading(false)
      }
    }
    initializeUser()
  }, [])

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    await fetchUser(token) // Immediately fetch user details
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
  }

  return (
    <UserContext.Provider
      value={{ user, loading, isAuthenticated, login, logout }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
