// ============================================================
//  Florería Los Lirios — Utilidades
// ============================================================

// Formatear precio en soles peruanos
export function formatPrice(amount) {
  return `S/. ${parseFloat(amount || 0).toFixed(2)}`
}

// Formatear fecha legible
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
  return date.toLocaleDateString('es-PE', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  })
}

// Formatear fecha y hora
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('es-PE', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// Fecha mínima de entrega (mañana) en formato YYYY-MM-DD
export function getMinDeliveryDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

// Etiqueta legible del estado del pedido
export function getEstadoLabel(estado) {
  const labels = {
    pendiente:  'Pendiente',
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    enviado:    'Enviado',
    entregado:  'Entregado',
    cancelado:  'Cancelado',
  }
  return labels[estado] ?? estado
}

// Clase CSS del badge según estado
export function getEstadoBadgeClass(estado) {
  const classes = {
    pendiente:  'badge-pendiente',
    confirmado: 'badge-confirmado',
    preparando: 'badge-preparando',
    enviado:    'badge-enviado',
    entregado:  'badge-entregado',
    cancelado:  'badge-cancelado',
  }
  return classes[estado] ?? 'badge'
}

// Etiqueta del método de pago
export function getMetodoPagoLabel(metodo) {
  const labels = {
    culqi:    '💳 Tarjeta',
    yape:     '📱 Yape',
    efectivo: '💵 Efectivo',
  }
  return labels[metodo] ?? metodo
}

// Validar teléfono celular peruano (9 dígitos empezando en 9)
export function validatePhone(phone) {
  const clean = phone.replace(/\D/g, '')
  return /^9\d{8}$/.test(clean)
}

// Validar email
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Validar que una fecha sea al menos mañana
export function validateFutureDate(dateStr) {
  if (!dateStr) return false
  const date     = new Date(dateStr + 'T00:00:00')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return date >= tomorrow
}

// Formatear número de tarjeta con espacios cada 4 dígitos
export function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

// Truncar texto a N caracteres
export function truncate(text, n = 80) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n) + '…' : text
}

// Debounce genérico
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
