import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true })
  }, [isAuthenticated]) // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Ingresa tu email y contraseña.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="font-display font-bold text-2xl text-primary-700">Florería Los Lirios</h1>
          <p className="text-brand-muted text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@floreriasloslirios.com"
              autoComplete="email"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-field">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted mt-6">
          ← <a href="/" className="text-primary-600 hover:text-primary-800">Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
