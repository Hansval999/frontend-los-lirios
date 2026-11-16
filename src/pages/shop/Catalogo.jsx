import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService, categoryService } from '@services/api'
import ProductCard from '@components/shop/ProductCard'
import { ProductCardSkeleton } from '@components/ui/Skeleton'
import { debounce } from '@utils/index'

const SORT_OPTIONS = [
  { value: '',            label: 'Relevancia'       },
  { value: 'precio_asc',  label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre_az',   label: 'Nombre A-Z'       },
]

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 })

  const [search,      setSearch]      = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(search)
  const [sort,        setSort]        = useState('')
  const [categoryId,  setCategoryId]  = useState(searchParams.get('category_id') || '')
  const [precioMin,   setPrecioMin]   = useState('')
  const [precioMax,   setPrecioMax]   = useState('')
  const [page,        setPage]        = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Debounce del campo de búsqueda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val)
      setPage(1)
    }, 300),
    []
  )

  useEffect(() => { categoryService.getAll().then(setCategories) }, [])

  useEffect(() => {
    fetchProducts()
  }, [search, sort, categoryId, precioMin, precioMax, page]) // eslint-disable-line

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await productService.getAll({
        search,
        sort,
        category_id: categoryId,
        precio_min:  precioMin,
        precio_max:  precioMax,
        page,
        per_page: 12,
      })
      setProducts(res.products)
      setPagination({ page: res.page, total: res.total, total_pages: res.total_pages })
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryChange(id) {
    setCategoryId(prev => prev === String(id) ? '' : String(id))
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSearchInput('')
    setSort('')
    setCategoryId('')
    setPrecioMin('')
    setPrecioMax('')
    setPage(1)
  }

  const hasFilters = search || categoryId || precioMin || precioMax || sort

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-primary-700">Catálogo</h1>
        {/* Botón filtros mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden btn-secondary text-sm px-4 py-2"
        >
          🔍 Filtros
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar filtros ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl p-5 overflow-y-auto transition-transform duration-300
          md:static md:w-64 md:shadow-none md:block md:translate-x-0 md:p-0 md:overflow-visible md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* overlay mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-[-1] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="space-y-6">
            {hasFilters && (
              <button onClick={clearFilters} className="text-accent-500 text-sm font-medium hover:text-accent-700">
                ✕ Limpiar filtros
              </button>
            )}

            {/* Categorías */}
            <div>
              <h3 className="font-semibold text-sm text-brand-text mb-3 uppercase tracking-wide">Categorías</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={categoryId === String(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="w-4 h-4 rounded accent-primary-500"
                    />
                    <span className="text-sm text-brand-text group-hover:text-primary-600">
                      {cat.icono} {cat.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rango de precio */}
            <div>
              <h3 className="font-semibold text-sm text-brand-text mb-3 uppercase tracking-wide">Precio (S/.)</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={precioMin}
                  onChange={e => { setPrecioMin(e.target.value); setPage(1) }}
                  className="input-field text-sm py-2 px-3"
                />
                <span className="text-brand-muted text-sm">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  min="0"
                  value={precioMax}
                  onChange={e => { setPrecioMax(e.target.value); setPage(1) }}
                  className="input-field text-sm py-2 px-3"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar flores, ramos, arreglos..."
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="input-field pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1) }}
              className="input-field w-auto"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Resultados */}
          {!loading && (
            <p className="text-sm text-brand-muted mb-4">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'} encontrados
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-display text-xl font-semibold text-brand-text mb-2">Sin resultados</h3>
              <p className="text-brand-muted mb-6">No encontramos productos con esos filtros.</p>
              <button onClick={clearFilters} className="btn-primary">Limpiar filtros</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Paginación */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-500 text-white'
                          : 'bg-white border border-brand-border text-brand-text hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === pagination.total_pages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
