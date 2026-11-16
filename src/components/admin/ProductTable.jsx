import { useState, useEffect } from 'react'
import { productService, categoryService } from '@services/api'
import { formatPrice } from '@utils/index'
import Modal from '@components/ui/Modal'
import { TableRowSkeleton } from '@components/ui/Skeleton'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  nombre: '', descripcion: '', precio: '', stock: '',
  categoria_id: '', imagen_url: '', activo: true, featured: false,
}

export default function ProductTable() {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [saving,      setSaving]      = useState(false)
  const [filters,     setFilters]     = useState({ search: '', category_id: '' })
  const [pagination,  setPagination]  = useState({ page: 1, total_pages: 1, total: 0 })

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchProducts() }, [filters, pagination.page]) // eslint-disable-line

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await productService.adminGetAll({ ...filters, page: pagination.page })
      setProducts(res.products)
      setPagination(p => ({ ...p, total_pages: res.total_pages, total: res.total }))
    } catch { toast.error('Error al cargar productos.') }
    finally { setLoading(false) }
  }

  async function fetchCategories() {
    try {
      const cats = await categoryService.adminGetAll()
      setCategories(cats)
    } catch {}
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setForm({
      nombre:      product.nombre,
      descripcion: product.descripcion || '',
      precio:      product.precio,
      stock:       product.stock,
      categoria_id: product.category_id,
      imagen_url:  product.imagen_url || '',
      activo:      Boolean(product.activo),
      featured:    Boolean(product.featured),
    })
    setModalOpen(true)
  }

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await productService.adminDelete(product.id)
      toast.success('Producto eliminado.')
      fetchProducts()
    } catch { toast.error('Error al eliminar.') }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.precio || !form.categoria_id) {
      toast.error('Nombre, precio y categoría son requeridos.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        nombre:      form.nombre,
        descripcion: form.descripcion,
        precio:      parseFloat(form.precio),
        stock:       parseInt(form.stock) || 0,
        category_id: parseInt(form.categoria_id),
        imagen_url:  form.imagen_url,
        activo:      form.activo,
        featured:    form.featured,
      }
      if (editing) {
        await productService.adminUpdate(editing.id, payload)
        toast.success('Producto actualizado.')
      } else {
        await productService.adminCreate(payload)
        toast.success('Producto creado.')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  function handleFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
    setPagination(p => ({ ...p, page: 1 }))
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={filters.search}
          onChange={e => handleFilter('search', e.target.value)}
          className="input-field max-w-xs"
        />
        <select
          value={filters.category_id}
          onChange={e => handleFilter('category_id', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
        <button onClick={openCreate} className="btn-primary ml-auto">
          + Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-brand-border">
              <tr>
                {['Imagen','Nombre','Categoría','Precio','Stock','Estado','Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-brand-muted">
                        No se encontraron productos.
                      </td>
                    </tr>
                  )
                  : products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={p.imagen_url || 'https://placehold.co/60x60/95d5b2/fff?text=🌸'}
                          alt={p.nombre}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={e => { e.target.src = 'https://placehold.co/60x60/95d5b2/fff?text=🌸' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.nombre}</p>
                        {p.featured === 1 && <span className="text-xs text-accent-500">⭐ Destacado</span>}
                      </td>
                      <td className="px-4 py-3 text-brand-muted">{p.category_nombre}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(p.precio)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock <= 5 ? 'text-accent-500 font-semibold' : ''}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${p.activo ? 'badge-entregado' : 'badge-cancelado'}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-primary-600 hover:text-primary-800 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="text-accent-500 hover:text-accent-700 text-xs font-medium px-2 py-1 rounded hover:bg-accent-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted">{pagination.total} productos</p>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-40">← Anterior</button>
              <span className="text-sm text-brand-muted self-center">{pagination.page} / {pagination.total_pages}</span>
              <button disabled={pagination.page === pagination.total_pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="btn-ghost text-sm px-3 py-1.5 disabled:opacity-40">Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-field">Nombre *</label>
              <input {...field('nombre')} className="input-field" placeholder="Ramo de Rosas Rojas x12" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Descripción</label>
              <textarea {...field('descripcion')} rows={3} className="input-field resize-none" placeholder="Descripción del producto..." />
            </div>
            <div>
              <label className="label-field">Precio (S/.) *</label>
              <input {...field('precio')} type="number" min="0.01" step="0.01" className="input-field" placeholder="45.00" required />
            </div>
            <div>
              <label className="label-field">Stock *</label>
              <input {...field('stock')} type="number" min="0" className="input-field" placeholder="20" required />
            </div>
            <div>
              <label className="label-field">Categoría *</label>
              <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))} className="input-field" required>
                <option value="">Seleccionar categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">URL de imagen</label>
              <input {...field('imagen_url')} type="url" className="input-field" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6 sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-sm font-medium">Activo (visible en tienda)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-sm font-medium">⭐ Destacado (aparece en Home)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
