import { useState, useEffect } from 'react'
import { categoryService } from '@services/api'
import Modal from '@components/ui/Modal'
import { TableRowSkeleton } from '@components/ui/Skeleton'
import toast from 'react-hot-toast'

const EMPTY_FORM = { nombre: '', descripcion: '', icono: '', activo: true }

export default function CategoryTable() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const cats = await categoryService.adminGetAll()
      setCategories(cats)
    } catch { toast.error('Error al cargar categorías.') }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '', icono: cat.icono || '', activo: Boolean(cat.activo) })
    setModalOpen(true)
  }

  async function handleDelete(cat) {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    try {
      const res = await categoryService.adminDelete(cat.id)
      if (res.success) {
        toast.success('Categoría eliminada.')
        fetchCategories()
      } else {
        toast.error(res.message || 'No se pudo eliminar.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('El nombre es requerido.'); return }
    setSaving(true)
    try {
      if (editing) {
        await categoryService.adminUpdate(editing.id, form)
        toast.success('Categoría actualizada.')
      } else {
        await categoryService.adminCreate(form)
        toast.success('Categoría creada.')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary">+ Nueva categoría</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-brand-border">
            <tr>
              {['Ícono','Nombre','Descripción','Productos','Estado','Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : categories.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-brand-muted">
                      No hay categorías creadas.
                    </td>
                  </tr>
                )
                : categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-2xl">{cat.icono}</td>
                    <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                    <td className="px-4 py-3 text-brand-muted max-w-xs truncate">{cat.descripcion || '—'}</td>
                    <td className="px-4 py-3 text-center">{cat.total_productos ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${cat.activo ? 'badge-entregado' : 'badge-cancelado'}`}>
                        {cat.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(cat)}
                          className="text-primary-600 hover:text-primary-800 text-xs font-medium px-2 py-1 rounded hover:bg-primary-50">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(cat)}
                          className="text-accent-500 hover:text-accent-700 text-xs font-medium px-2 py-1 rounded hover:bg-accent-50">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre *</label>
            <input {...field('nombre')} className="input-field" placeholder="Ramos" required />
          </div>
          <div>
            <label className="label-field">Ícono (emoji)</label>
            <input {...field('icono')} className="input-field" placeholder="💐" maxLength={10} />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <textarea {...field('descripcion')} rows={2} className="input-field resize-none" placeholder="Descripción breve..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary-500"
            />
            <span className="text-sm font-medium">Activa (visible en tienda)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
