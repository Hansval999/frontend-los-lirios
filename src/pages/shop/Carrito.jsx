import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@context/CartContext'
import { formatPrice } from '@utils/index'

export default function Carrito() {
  const { items, totalItems, subtotal, getDelivery, getTotal, updateQuantity, removeItem, isEmpty } = useCart()
  const navigate = useNavigate()

  if (isEmpty) {
    return (
      <div className="container-main section-padding text-center">
        <p className="text-7xl mb-4">🛒</p>
        <h2 className="font-display text-2xl font-bold text-brand-text mb-2">Tu carrito está vacío</h2>
        <p className="text-brand-muted mb-8">Aún no has agregado ningún producto.</p>
        <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="container-main py-10">
      <h1 className="font-display text-3xl font-bold text-primary-700 mb-8">Mi carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Lista de productos ── */}
        <div className="flex-1 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img
                src={item.imagen_url || 'https://placehold.co/80x80/95d5b2/fff?text=🌸'}
                alt={item.nombre}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/80x80/95d5b2/fff?text=🌸' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-text truncate">{item.nombre}</h3>
                <p className="text-primary-600 font-bold mt-1">{formatPrice(item.precio)}</p>

                <div className="flex items-center gap-3 mt-3">
                  {/* Selector de cantidad */}
                  <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-text font-bold"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-text font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-accent-500 hover:text-accent-700 text-sm font-medium ml-2 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0">
                <p className="font-bold text-brand-text">
                  {formatPrice(item.precio * item.cantidad)}
                </p>
                {item.cantidad > 1 && (
                  <p className="text-xs text-brand-muted mt-1">
                    {item.cantidad} × {formatPrice(item.precio)}
                  </p>
                )}
              </div>
            </div>
          ))}

          <Link to="/catalogo" className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center gap-1 mt-2">
            ← Seguir comprando
          </Link>
        </div>

        {/* ── Resumen ── */}
        <div className="lg:w-80 shrink-0">
          <div className="card p-6 sticky top-20">
            <h2 className="font-display font-bold text-lg text-brand-text mb-5">Resumen del pedido</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Delivery</span>
                <span className="font-medium text-green-600">Se calcula en el checkout</span>
              </div>
            </div>

            <div className="border-t border-brand-border mt-4 pt-4 flex justify-between font-bold text-base">
              <span>Total estimado</span>
              <span className="text-primary-600">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-xs text-brand-muted mt-2 mb-5">
              + S/. 10.00 si eliges delivery, gratis si recoges en tienda.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full text-base py-3.5"
            >
              Proceder al pago →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
