import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '@services/api'
import StatsCard from '@components/admin/StatsCard'
import Badge from '@components/ui/Badge'
import { StatsCardSkeleton } from '@components/ui/Skeleton'
import { formatPrice, formatDateTime } from '@utils/index'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard
              title="Pedidos hoy"
              value={stats?.pedidos_hoy ?? 0}
              icon="📦"
              color="primary"
              subtitle="Pedidos recibidos hoy"
            />
            <StatsCard
              title="Pedidos pendientes"
              value={stats?.pedidos_pendientes ?? 0}
              icon="⏳"
              color="amber"
              subtitle="Requieren atención"
            />
            <StatsCard
              title="Ingresos del mes"
              value={formatPrice(stats?.ingresos_mes ?? 0)}
              icon="💰"
              color="blue"
              subtitle={new Date().toLocaleString('es-PE', { month: 'long', year: 'numeric' })}
            />
            <StatsCard
              title="Productos activos"
              value={stats?.productos_activos ?? 0}
              icon="🌸"
              color="primary"
              subtitle="En catálogo"
            />
          </>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/productos',  label: 'Gestionar Productos',  icon: '🌸', desc: 'Agregar, editar o eliminar productos' },
          { to: '/admin/pedidos',    label: 'Ver Pedidos',          icon: '📦', desc: 'Revisar y actualizar estados' },
          { to: '/admin/categorias', label: 'Categorías',           icon: '🗂️',  desc: 'Organizar el catálogo' },
        ].map(({ to, label, icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="card p-5 hover:shadow-card-hover transition-shadow flex items-start gap-4 group"
          >
            <div className="text-3xl">{icon}</div>
            <div>
              <p className="font-semibold text-brand-text group-hover:text-primary-600 transition-colors">{label}</p>
              <p className="text-sm text-brand-muted">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Últimos pedidos */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="font-semibold text-brand-text">Últimos 10 pedidos</h2>
          <Link to="/admin/pedidos" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-brand-border">
              <tr>
                {['Código','Cliente','Total','Estado','Fecha'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded" style={{ width: `${50 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
                : (stats?.ultimos_pedidos ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-brand-muted">
                        No hay pedidos aún.
                      </td>
                    </tr>
                  )
                  : (stats.ultimos_pedidos).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-600">{order.codigo}</td>
                      <td className="px-4 py-3 font-medium">{order.cliente}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3"><Badge estado={order.estado} /></td>
                      <td className="px-4 py-3 text-xs text-brand-muted">{formatDateTime(order.created_at)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
