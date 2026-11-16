import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

const LINKS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/admin/pedidos',    label: 'Pedidos',    icon: '📦' },
  { to: '/admin/productos',  label: 'Productos',  icon: '🌸' },
  { to: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-500 text-white shadow'
        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
    }`

  return (
    <>
      {/* Barra superior (solo móvil) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-primary-800 text-white flex items-center justify-between px-4 shadow">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 -ml-2 rounded hover:bg-primary-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display font-semibold">🌸 Los Lirios · Admin</span>
        <span className="w-6" />
      </div>

      {/* Overlay móvil */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-primary-700">
          <p className="font-display text-xl font-bold">🌸 Los Lirios</p>
          <p className="text-xs text-primary-200 mt-0.5">Panel de administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {LINKS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
              <span className="text-lg leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-primary-700">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-700 hover:text-white transition-colors"
            >
              <span className="text-lg leading-none">🛍️</span>
              Ver tienda
            </Link>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-primary-700">
          {user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold truncate">{user.nombre}</p>
              <p className="text-xs text-primary-200 truncate">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-700 hover:bg-accent-500 transition-colors"
          >
            ↩ Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
