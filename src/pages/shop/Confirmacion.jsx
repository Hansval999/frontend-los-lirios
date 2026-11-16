import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { orderService } from '@services/api'
import { formatPrice, formatDate, getMetodoPagoLabel } from '@utils/index'

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '51935758497'

export default function Confirmacion() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!state?.codigo) {
      navigate('/')
      return
    }
    orderService.getByCode(state.codigo)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  if (loading) {
    return (
      <div className="container-main section-padding text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  const codigo  = state?.codigo  ?? order?.codigo
  const nombre  = state?.nombre  ?? order?.cliente_nombre
  const metodo  = state?.metodo  ?? order?.metodo_pago

  const waMsg = encodeURIComponent(
    `Hola, acabo de hacer el pedido ${codigo} y adjunto mi comprobante de Yape. 🌸`
  )

  return (
    <div className="container-main py-12 max-w-2xl">
      {/* ── Ícono animado ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-5 animate-fade-in">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
              className="animate-checkmark"
              style={{ strokeDasharray: 100, strokeDashoffset: 0 }}
            />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold text-primary-700 mb-2">
          ¡Gracias{nombre ? `, ${nombre}` : ''}!
        </h1>
        <p className="text-brand-muted text-lg">Tu pedido fue recibido correctamente.</p>

        {codigo && (
          <div className="inline-block mt-4 bg-primary-50 border border-primary-200 rounded-xl px-6 py-3">
            <p className="text-xs text-brand-muted mb-0.5">Código de pedido</p>
            <p className="font-mono font-bold text-xl text-primary-700">{codigo}</p>
          </div>
        )}
      </div>

      {/* ── Instrucciones según método de pago ── */}
      <div className={`rounded-2xl p-5 mb-6 ${
        metodo === 'culqi'    ? 'bg-blue-50   border border-blue-200'   :
        metodo === 'yape'     ? 'bg-purple-50 border border-purple-200' :
                                'bg-amber-50  border border-amber-200'
      }`}>
        <p className="font-semibold mb-2">
          {metodo === 'culqi'    ? '💳 Pago procesado correctamente'     :
           metodo === 'yape'     ? '📱 Instrucciones de pago por Yape'   :
                                   '💵 Pago contra entrega'}
        </p>

        {metodo === 'culqi' && (
          <p className="text-sm text-blue-800">
            Tu pago fue procesado exitosamente con tarjeta. Recibirás confirmación y seguimiento de tu pedido.
          </p>
        )}

        {metodo === 'yape' && (
          <div className="text-sm text-purple-800 space-y-2">
            <p>Envía tu comprobante de pago al WhatsApp <strong>935 758 497</strong> con el código <strong>{codigo}</strong>.</p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mt-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              </svg>
              Enviar comprobante por WhatsApp
            </a>
          </div>
        )}

        {metodo === 'efectivo' && (
          <p className="text-sm text-amber-800">
            Prepara el monto exacto para pagar al momento de la entrega. El repartidor no lleva cambio.
          </p>
        )}
      </div>

      {/* ── Resumen del pedido ── */}
      {order && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-4">Resumen del pedido</h2>

          {/* Ítems */}
          <div className="space-y-2 mb-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-brand-muted">{item.nombre_producto} × {item.cantidad}</span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Delivery</span>
              <span>{parseFloat(order.delivery) === 0 ? 'Gratis' : formatPrice(order.delivery)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-brand-border pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Info de entrega */}
          <div className="mt-4 pt-4 border-t border-brand-border grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-brand-muted text-xs">Fecha de entrega</p>
              <p className="font-medium">{formatDate(order.fecha_entrega)}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Hora</p>
              <p className="font-medium">{order.hora_entrega}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Tipo</p>
              <p className="font-medium capitalize">{order.tipo_entrega}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Pago</p>
              <p className="font-medium">{getMetodoPagoLabel(order.metodo_pago)}</p>
            </div>
            {order.tipo_entrega === 'delivery' && (
              <div className="col-span-2">
                <p className="text-brand-muted text-xs">Dirección</p>
                <p className="font-medium">{order.direccion}, {order.distrito}</p>
              </div>
            )}
            {order.nota_dedicatoria && (
              <div className="col-span-2">
                <p className="text-brand-muted text-xs">Dedicatoria</p>
                <p className="italic text-brand-muted">"{order.nota_dedicatoria}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/" className="btn-primary px-8">
          Volver a la tienda 🌸
        </Link>
      </div>
    </div>
  )
}
