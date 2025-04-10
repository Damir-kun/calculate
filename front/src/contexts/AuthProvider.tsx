import { useEffect, createContext, useContext, useState } from 'react'
import { getUserData, removeAuthToken } from '../api/auth-token.service'
import { useNavigate } from 'react-router-dom'

export type UserContext = {
  isAuthenticated: boolean,
  user?: User,
  reload: () => any,
  logout: () => any
}

export type User = {
  user_id: number,
  role: "manager" | "admin" | "user",
  exp: number
}

const AuthContext = createContext<UserContext>({
  isAuthenticated: false,
  user: undefined,
  reload: () => {},
  logout: () => {}
})

export function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User|undefined>(undefined)

  const navigate = useNavigate()

  const reload = () => {
    const authData = getUserData()
    if (!authData) {
      navigate("/login")
      return setUser(undefined)
    }

    if (authData.exp < Date.now() / 1000) {
      navigate("/login")
      return setUser(undefined)
    }

    setUser({
      user_id: authData.user_id,
      role: authData.role === 1
        ? "admin"
        : authData.role === 2
          ? "manager"
          : "user",
      exp: authData.exp
    })
  }

  const logout = () => {
    navigate("/login")
    removeAuthToken()
    setUser(undefined)
  }

  useEffect(reload, [])
  
  return <AuthContext.Provider value={{ isAuthenticated: !!user, user, reload, logout }} children={children} />
}

export function useAuth() {
  if (!AuthContext) {
    throw new Error("useAuth must be used within a AuthProvider")
  }

  return useContext(AuthContext)
}
