import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@services/api'

// ============================================================
// Contexto
// ============================================================
const AuthContext = createContext(null)

const TOKEN_KEY = 'floreria_admin_token'
const USER_KEY  = 'floreria_admin_user'

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // ── Verificar token al montar o cuando cambia ─────────────
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    // Intentar restaurar usuario desde localStorage primero
    // (para evitar flicker mientras verifica con el backend)
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }

    // Verificar con el backend que el token siga siendo válido
    authService.me(token)
      .then(({ user: serverUser }) => {
        setUser(serverUser)
        localStorage.setItem(USER_KEY, JSON.stringify(serverUser))
      })
      .catch(() => {
        // Token inválido o expirado
        clearSession()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Guardar sesión ────────────────────────────────────────
  function saveSession(newToken, newUser) {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  // ── Limpiar sesión ────────────────────────────────────────
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  // ── Login ─────────────────────────────────────────────────
  async function login(email, password) {
    const data = await authService.login(email, password)
    saveSession(data.token, data.user)
    toast.success(`¡Bienvenido, ${data.user.nombre}!`)
    return data
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession()
    toast.success('Sesión cerrada.')
    // La redirección la maneja el PrivateRoute en App.jsx
  }, [])

  // ── Obtener token para pasarlo a los servicios ────────────
  function getToken() {
    return localStorage.getItem(TOKEN_KEY)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================
// Hook
// ============================================================
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
