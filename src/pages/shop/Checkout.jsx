import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { orderService, culqiService } from '@services/api'
import YapeModal from '@components/shop/YapeModal'
import {
  formatPrice, getMinDeliveryDate,
  validatePhone, validateEmail, validateFutureDate, formatCardNumber,
} from '@utils/index'
import toast from 'react-hot-toast'

const HORAS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']

const EMPTY = {
  nombre: '', apellido: '', telefono: '', email: '',
  direccion: '', distrito: '',
  fecha_entrega: '', hora_entrega: '10:00',
  tipo_entrega: 'delivery',
  nota_dedicatoria: '',
  metodo_pago: 'efectivo',
  // Culqi
  card_nombre: '', card_numero: '', card_mes: '', card_anio: '', card_cvv: '',
}

export default function Checkout() {
  const { items, subtotal, getDelivery, getTotal, isEmpty, clearCart } = useCart()
  const navigate = useNavigate()

  const [form,       setForm]       = useState(EMPTY)
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [yapeOpen,   setYapeOpen]   = useState(false)
  const [orderCode,  setOrderCode]  = useState(null)

  useEffect(() => {
    if (isEmpty) navigate('/carrito')
    culqiService.setup()
  }, []) // eslint-disable-line

  const delivery = getDelivery(form.tipo_entrega)
  const total    = getTotal(form.tipo_entrega)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.nombre.trim())   errs.nombre   = 'Requerido'
    if (!form.apellido.trim()) errs.apellido  = 'Requerido'
    if (!validatePhone(form.telefono)) errs.telefono = 'Celular peruano inválido (9 dígitos)'
    if (form.email && !validateEmail(form.email)) errs.email = 'Email inválido'
    if (form.tipo_entrega === 'delivery') {
      if (!form.direccion.trim()) errs.direccion = 'Requerido para delivery'
      if (!form.distrito.trim())  errs.distrito  = 'Requerido para delivery'
    }
    if (!validateFutureDate(form.fecha_entrega)) errs.fecha_entrega = 'Debe ser a partir de mañana'
    if (!form.hora_entrega) errs.hora_entrega = 'Requerido'
    if (form.metodo_pago === 'culqi') {
      if (!form.card_nombre.trim()) errs.card_nombre = 'Requerido'
      if (!form.card_numero || form.card_numero.replace(/\s/g, '').length < 16) errs.card_numero = 'Número inválido'
      if (!form.card_mes)  errs.card_mes  = 'Requerido'
      if (!form.card_anio) errs.card_anio = 'Requerido'
      if (!form.card_cvv || form.card_cvv.length < 3) errs.card_cvv = 'CVV inválido'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Por favor corrige los errores del formulario.'); return }

    setLoading(true)

    try {
      let culqiToken = null

      // Tokenizar tarjeta con Culqi si corresponde
      if (form.metodo_pago === 'culqi') {
        try {
          const token = await culqiService.createToken({
            numero: form.card_numero,
            cvv:    form.card_cvv,
            mes:    form.card_mes,
            anio:   form.card_anio,
            email:  form.email || 'cliente@floreria.com',
          })
          culqiToken = token.id
        } catch (err) {
          toast.error(err.message || 'Error al procesar la tarjeta.')
          setLoading(false)
          return
        }
      }

      const payload = {
        cliente_nombre:   form.nombre,
        cliente_apellido: form.apellido,
        cliente_telefono: form.telefono,
        cliente_email:    form.email,
        direccion:        form.direccion,
        distrito:         form.distrito,
        fecha_entrega:    form.fecha_entrega,
        hora_entrega:     form.hora_entrega,
        tipo_entrega:     form.tipo_entrega,
        nota_dedicatoria: form.nota_dedicatoria,
        metodo_pago:      form.metodo_pago,
        culqi_token:      culqiToken,
        items: items.map(i => ({
          product_id: i.id,
          cantidad:   i.cantidad,
        })),
      }

      const result = await orderService.create(payload)

      // Si es Yape, mostrar modal antes de limpiar carrito
      if (form.metodo_pago === 'yape') {
        setOrderCode(result.codigo)
        setYapeOpen(true)
        return
      }

      clearCart()
      navigate('/confirmacion', { state: { codigo: result.codigo, metodo: form.metodo_pago, nombre: form.nombre } })

    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo procesar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  function handleYapeClose() {
    setYapeOpen(false)
    clearCart()
    navigate('/confirmacion', { state: { codigo: orderCode, metodo: 'yape', nombre: form.nombre } })
  }

  const F = ({ label, name, type = 'text', placeholder = '', required = false, children, half = false }) => (
    <div className={half ? '' : 'col-span-2 sm:col-span-1'}>
      <label className="label-field">{label}{required && ' *'}</label>
      {children ?? (
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          placeholder={placeholder}
          className={`input-field ${errors[name] ? 'input-error' : ''}`}
        />
      )}
      {errors[name] && <p className="error-message">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="container-main py-10">
      <h1 className="font-display text-3xl font-bold text-primary-700 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Formulario izquierdo ── */}
          <div className="flex-1 space-y-6">

            {/* Datos del cliente */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Datos de contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F label="Nombre" name="nombre" placeholder="María" required />
                <F label="Apellido" name="apellido" placeholder="García" required />
                <div>
                  <label className="label-field">Teléfono (celular) *</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => set('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="987654321"
                    className={`input-field ${errors.telefono ? 'input-error' : ''}`}
                  />
                  {errors.telefono && <p className="error-message">{errors.telefono}</p>}
                </div>
                <div>
                  <label className="label-field">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="maria@email.com"
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                  />
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Tipo de entrega</h2>
              <div className="flex gap-4 mb-4">
                {[
                  { val: 'delivery', label: '🚚 Delivery (S/. 10.00)' },
                  { val: 'recojo',   label: '🏪 Recojo en tienda (Gratis)' },
                ].map(({ val, label }) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_entrega"
                      value={val}
                      checked={form.tipo_entrega === val}
                      onChange={() => set('tipo_entrega', val)}
                      className="accent-primary-500"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>

              {form.tipo_entrega === 'delivery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="sm:col-span-2">
                    <label className="label-field">Dirección *</label>
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={e => set('direccion', e.target.value)}
                      placeholder="Av. Huaylas 123"
                      className={`input-field ${errors.direccion ? 'input-error' : ''}`}
                    />
                    {errors.direccion && <p className="error-message">{errors.direccion}</p>}
                  </div>
                  <div>
                    <label className="label-field">Distrito *</label>
                    <input
                      type="text"
                      value={form.distrito}
                      onChange={e => set('distrito', e.target.value)}
                      placeholder="Chorrillos"
                      className={`input-field ${errors.distrito ? 'input-error' : ''}`}
                    />
                    {errors.distrito && <p className="error-message">{errors.distrito}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="label-field">Fecha de entrega *</label>
                  <input
                    type="date"
                    min={getMinDeliveryDate()}
                    value={form.fecha_entrega}
                    onChange={e => set('fecha_entrega', e.target.value)}
                    className={`input-field ${errors.fecha_entrega ? 'input-error' : ''}`}
                  />
                  {errors.fecha_entrega && <p className="error-message">{errors.fecha_entrega}</p>}
                </div>
                <div>
                  <label className="label-field">Hora de entrega *</label>
                  <select
                    value={form.hora_entrega}
                    onChange={e => set('hora_entrega', e.target.value)}
                    className="input-field"
                  >
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="label-field">Nota o dedicatoria (opcional)</label>
                <textarea
                  value={form.nota_dedicatoria}
                  onChange={e => set('nota_dedicatoria', e.target.value)}
                  placeholder="Con mucho cariño para ti ❤️"
                  rows={3}
                  maxLength={300}
                  className="input-field resize-none"
                />
                <p className="text-xs text-brand-muted mt-1">{form.nota_dedicatoria.length}/300</p>
              </div>
            </div>

            {/* Método de pago */}
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Método de pago</h2>
              <div className="space-y-3">
                {[
                  { val: 'culqi',    label: '💳 Tarjeta de crédito/débito',  desc: 'Pago seguro con Visa, Mastercard, Amex' },
                  { val: 'yape',     label: '📱 Yape',                        desc: 'Escanea el QR con tu app Yape' },
                  { val: 'efectivo', label: '💵 Efectivo',                    desc: 'Paga al momento de recibir tu pedido' },
                ].map(({ val, label, desc }) => (
                  <label key={val} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.metodo_pago === val ? 'border-primary-400 bg-primary-50' : 'border-brand-border hover:border-primary-200'
                  }`}>
                    <input
                      type="radio"
                      name="metodo_pago"
                      value={val}
                      checked={form.metodo_pago === val}
                      onChange={() => set('metodo_pago', val)}
                      className="mt-0.5 accent-primary-500"
                    />
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-brand-muted">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Formulario Culqi */}
              {form.metodo_pago === 'culqi' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                  <div>
                    <label className="label-field">Nombre en la tarjeta *</label>
                    <input
                      type="text"
                      value={form.card_nombre}
                      onChange={e => set('card_nombre', e.target.value.toUpperCase())}
                      placeholder="MARÍA GARCÍA"
                      className={`input-field ${errors.card_nombre ? 'input-error' : ''}`}
                    />
                    {errors.card_nombre && <p className="error-message">{errors.card_nombre}</p>}
                  </div>
                  <div>
                    <label className="label-field">Número de tarjeta *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.card_numero}
                      onChange={e => set('card_numero', formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className={`input-field font-mono ${errors.card_numero ? 'input-error' : ''}`}
                    />
                    {errors.card_numero && <p className="error-message">{errors.card_numero}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label-field">Mes *</label>
                      <select
                        value={form.card_mes}
                        onChange={e => set('card_mes', e.target.value)}
                        className={`input-field ${errors.card_mes ? 'input-error' : ''}`}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {errors.card_mes && <p className="error-message">{errors.card_mes}</p>}
                    </div>
                    <div>
                      <label className="label-field">Año *</label>
                      <select
                        value={form.card_anio}
                        onChange={e => set('card_anio', e.target.value)}
                        className={`input-field ${errors.card_anio ? 'input-error' : ''}`}
                      >
                        <option value="">AAAA</option>
                        {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i)).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {errors.card_anio && <p className="error-message">{errors.card_anio}</p>}
                    </div>
                    <div>
                      <label className="label-field">CVV *</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={form.card_cvv}
                        onChange={e => set('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        className={`input-field font-mono ${errors.card_cvv ? 'input-error' : ''}`}
                      />
                      {errors.card_cvv && <p className="error-message">{errors.card_cvv}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted flex items-center gap-1">
                    🔒 Datos procesados de forma segura por Culqi
                  </p>
                </div>
              )}

              {form.metodo_pago === 'efectivo' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  💵 Pagarás el monto exacto al momento de recibir tu pedido.
                </div>
              )}

              {form.metodo_pago === 'yape' && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800">
                  📱 Al confirmar, te mostraremos el QR de Yape para completar el pago.
                </div>
              )}
            </div>
          </div>

          {/* ── Resumen sticky ── */}
          <div className="lg:w-80 shrink-0">
            <div className="card p-6 sticky top-20">
              <h2 className="font-display font-bold text-lg mb-4">Resumen</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-muted truncate flex-1 mr-2">
                      {item.nombre} × {item.cantidad}
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delivery</span>
                  <span>{delivery === 0 ? 'Gratis' : formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-brand-border pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-5 py-3.5 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  `Confirmar pedido · ${formatPrice(total)}`
                )}
              </button>

              <p className="text-xs text-brand-muted text-center mt-3">
                Al confirmar aceptas nuestros términos de servicio.
              </p>

              <Link to="/carrito" className="block text-center text-sm text-primary-600 hover:text-primary-800 mt-2">
                ← Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Yape */}
      <YapeModal
        isOpen={yapeOpen}
        onClose={handleYapeClose}
        total={total}
        codigo={orderCode}
      />
    </div>
  )
}
