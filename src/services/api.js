import axios from 'axios'

// ============================================================
//  Cliente HTTP — Florería Los Lirios
//  Backend: Node.js + Express (prefijo /api)
// ============================================================

// VITE_API_URL = URL del backend SIN "/api" (se tolera si la pones con él).
// Vacío => usa el proxy de Vite en desarrollo (/api -> localhost:8000).
const RAW_URL  = (import.meta.env.VITE_API_URL || '').trim()
const BASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/api$/, '')

// Mismas claves que usa AuthContext
const TOKEN_KEY = 'floreria_admin_token'
const USER_KEY  = 'floreria_admin_user'

const http = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { Accept: 'application/json' },
})

// Adjunta el JWT en las rutas protegidas
http.interceptors.request.use((config) => {
  const url = config.url || ''
  const isProtected = url.startsWith('/admin') || url.startsWith('/auth/me')
  const token = localStorage.getItem(TOKEN_KEY)
  if (isProtected && token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Sesión expirada en el panel: limpiar y volver al login
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const url    = error.config?.url || ''
    if (status === 401 && url.startsWith('/admin')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// El backend responde { success, data, message }: devolvemos solo "data"
const unwrap = (res) => res.data.data

// ============================================================
//  Auth
// ============================================================
export const authService = {
  login: (email, password) => http.post('/auth/login', { email, password }).then(unwrap),
  // Devuelve { user }
  me: (token) =>
    http
      .get('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then(unwrap),
}

// ============================================================
//  Categorías
// ============================================================
export const categoryService = {
  // Tienda: array de categorías activas
  getAll: () => http.get('/categories').then((res) => res.data.data.categories),

  // Admin
  adminGetAll: () => http.get('/admin/categories').then((res) => res.data.data.categories),
  adminCreate: (payload) => http.post('/admin/categories', payload).then(unwrap),
  adminUpdate: (id, payload) => http.put(`/admin/categories/${id}`, payload).then(unwrap),
  // Devuelve el cuerpo completo ({ success, message }): CategoryTable lee res.success
  adminDelete: (id) => http.delete(`/admin/categories/${id}`).then((res) => res.data),
}

// ============================================================
//  Productos
// ============================================================
// Quita parámetros vacíos para no mandar ?search=&category_id=
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )

export const productService = {
  // { products, total, page, per_page, total_pages }
  getAll: (params) => http.get('/products', { params: clean(params) }).then(unwrap),
  // Array de productos destacados
  getFeatured: (limit = 8) =>
    http.get('/products/featured', { params: { limit } }).then((res) => res.data.data.products),
  getById: (id) => http.get(`/products/${id}`).then((res) => res.data.data.product),

  // Admin
  adminGetAll: (params) => http.get('/admin/products', { params: clean(params) }).then(unwrap),
  adminCreate: (payload) => http.post('/admin/products', payload).then(unwrap),
  adminUpdate: (id, payload) => http.put(`/admin/products/${id}`, payload).then(unwrap),
  adminDelete: (id) => http.delete(`/admin/products/${id}`).then(unwrap),
}

// ============================================================
//  Pedidos
// ============================================================
export const orderService = {
  // { order_id, codigo, total, estado }
  create: (payload) => http.post('/orders', payload).then(unwrap),
  getByCode: (codigo) =>
    http.get(`/orders/${encodeURIComponent(codigo)}`).then((res) => res.data.data.order),

  // Admin
  // { orders, total, page, per_page, total_pages }
  adminGetAll: (params) => http.get('/admin/orders', { params: clean(params) }).then(unwrap),
  adminGetById: (id) => http.get(`/admin/orders/${id}`).then((res) => res.data.data.order),
  adminUpdate: (id, payload) => http.put(`/admin/orders/${id}`, payload).then(unwrap),
}

// ============================================================
//  Dashboard (admin)
// ============================================================
export const dashboardService = {
  getStats: () => http.get('/admin/dashboard').then(unwrap),
}

// ============================================================
//  Culqi — tokenización de tarjeta (llave PÚBLICA)
//  El cobro lo hace el backend con la llave secreta.
// ============================================================
const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY

export const culqiService = {
  setup() {
    if (window.Culqi && CULQI_PUBLIC_KEY) {
      window.Culqi.publicKey = CULQI_PUBLIC_KEY
    }
  },

  // { numero, cvv, mes, anio, email } -> token de Culqi (usa token.id)
  async createToken({ numero, cvv, mes, anio, email }) {
    if (!CULQI_PUBLIC_KEY) {
      throw new Error('El pago con tarjeta no está disponible en este momento.')
    }

    const year = String(anio).length === 2 ? `20${anio}` : String(anio)

    let response
    try {
      response = await fetch('https://secure.culqi.com/v2/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CULQI_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          card_number:      String(numero).replace(/\s+/g, ''),
          cvv:              String(cvv),
          expiration_month: String(mes).padStart(2, '0'),
          expiration_year:  year,
          email,
        }),
      })
    } catch {
      throw new Error('No se pudo conectar con el procesador de pagos.')
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.id) {
      throw new Error(data.user_message || data.merchant_message || 'No se pudo validar la tarjeta.')
    }
    return data
  },
}

export default http
