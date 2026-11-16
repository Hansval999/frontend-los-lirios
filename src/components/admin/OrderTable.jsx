import { useState, useEffect } from 'react'
import { orderService } from '@services/api'
import { formatPrice, formatDateTime, getMetodoPagoLabel } from '@utils/index'
import Badge from '@components/ui/Badge'
import Modal from '@components/ui/Modal'
import { TableRowSkeleton } from '@components/ui/Skeleton'
import toast from 'react-hot-toast'

const ESTADOS = ['pendiente','confirmado','preparando','enviado','entregado','cancelado']

export default function OrderTable() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [newEstado,   setNewEstado]   = useState('')
  const [filters,     setFilters]     = useState({ estado: '', fecha: '', search: '' })
  const [pagination,  setPagination]  = useState({ page: 1, total_pages: 1, total: 0 })

  useEffect(() => { fetchOrders() }, [filters, pagination.page]) // eslint-disable-line

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await orderService.adminGetAll({ ...filters, page: pagination.page })
      setOrders(res.orders)
      setPagination(p => ({ ...p, total_pages: res.total_pages, total: res.total }))
    } catch {
      toast.error('Error al cargar pedidos.')
    } finally {
      setLoading(false)
    }
  }

  async function openDetail(order) {
    try {
      const full = await orderService.adminGetById(order.id)
      setSelected(full)
      setNewEstado(full.estado)
      setModalOpen(true)
    } catch {
      toast.error('No se pudo cargar el detalle.')
    }
  }

  async function saveEstado() {
    if (!selected || newEstado === selected.estado) {
      setModalOpen(false)
      return
    }
    setSaving(true)
    try {
      await orderService.adminUpdate(selected.id, { estado: newEstado })
      toast.success('Estado actualizado.')
      setModalOpen(false)
      fetchOrders()
    } catch {
      toast.error('Error al actualizar el estado.')
    } finally {
      setSaving(false)
    }
  }

  function handleFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
    setPagination(p => ({ ...p, page: 1 }))
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar código, cliente..."
          value={filters.search}
          onChange={e => handleFilter('search', e.target.value)}
          className="input-field max-w-xs"
        />
        <select
          value={filters.estado}
          onChange={e => handleFilter('estado', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <input
          type="date"
          value={filters.fecha}
          onChange={e => handleFilter('fecha', e.target.value)}
          className="input-field w-auto"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-brand-border">
              <tr>
                {['Código','Cliente','Total','Pago','Estado','Fecha',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : orders.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-brand-muted">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  )
                  : orders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openDetail(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-600">
                        {order.codigo}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-text">{order.cliente_nombre} {order.cliente_apellido}</p>
                        <p className="text-xs text-brand-muted">{order.cliente_telefono}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-xs">{getMetodoPagoLabel(order.metodo_pago)}</td>
                      <td className="px-4 py-3"><Badge estado={order.estado} /></td>
                      <td className="px-4 py-3 text-xs text-brand-muted">{formatDateTime(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="text-primary-500 hover:text-primary-700 text-xs font-medium">Ver →</span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted">{pagination.total} pedidos</p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-40"
              >← Anterior</button>
              <span className="text-sm text-brand-muted self-center">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                disabled={pagination.page === pagination.total_pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-40"
              >Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Pedido ${selected?.codigo}`} size="lg">
        {selected && (
          <div className="space-y-5">
            {/* Cliente */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="label-field">Cliente</p>
                <p className="font-medium">{selected.cliente_nombre} {selected.cliente_apellido}</p>
              </div>
              <div>
                <p className="label-field">Teléfono</p>
                <p>{selected.cliente_telefono}</p>
              </div>
              <div>
                <p className="label-field">Email</p>
                <p>{selected.cliente_email || '—'}</p>
              </div>
              <div>
                <p className="label-field">Tipo entrega</p>
                <p className="capitalize">{selected.tipo_entrega}</p>
              </div>
              {selected.tipo_entrega === 'delivery' && (
                <div className="col-span-2">
                  <p className="label-field">Dirección</p>
                  <p>{selected.direccion}, {selected.distrito}</p>
                </div>
              )}
              <div>
                <p className="label-field">Fecha entrega</p>
                <p>{selected.fecha_entrega}</p>
              </div>
              <div>
                <p className="label-field">Hora entrega</p>
                <p>{selected.hora_entrega}</p>
              </div>
              {selected.nota_dedicatoria && (
                <div className="col-span-2">
                  <p className="label-field">Dedicatoria</p>
                  <p className="italic text-brand-muted">"{selected.nota_dedicatoria}"</p>
                </div>
              )}
            </div>

            {/* Ítems */}
            <div>
              <p className="label-field mb-2">Productos</p>
              <div className="space-y-2">
                {selected.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    {item.imagen_url && (
                      <img src={item.imagen_url} alt={item.nombre_producto}
                        className="w-10 h-10 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.nombre_producto}</p>
                      <p className="text-xs text-brand-muted">
                        {formatPrice(item.precio_unitario)} × {item.cantidad}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(selected.delivery)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-brand-border pt-2 mt-2">
                <span>Total</span><span className="text-primary-600">{formatPrice(selected.total)}</span>
              </div>
            </div>

            {/* Cambiar estado */}
            <div>
              <label className="label-field">Cambiar estado</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={newEstado}
                  onChange={e => setNewEstado(e.target.value)}
                  className="input-field flex-1"
                >
                  {ESTADOS.map(e => (
                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={saveEstado}
                  disabled={saving}
                  className="btn-primary px-5"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
