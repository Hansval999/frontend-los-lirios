import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService, categoryService } from '@services/api'
import ProductCard from '@components/shop/ProductCard'
import { ProductCardSkeleton } from '@components/ui/Skeleton'

export default function Home() {
  const [featured,    setFeatured]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loadingProds, setLoadingProds] = useState(true)
  const [loadingCats,  setLoadingCats]  = useState(true)

  const whatsapp = import.meta.env.VITE_WHATSAPP || '51935758497'

  useEffect(() => {
    productService.getFeatured(8)
      .then(setFeatured)
      .finally(() => setLoadingProds(false))

    categoryService.getAll()
      .then(setCategories)
      .finally(() => setLoadingCats(false))
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-brand-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🌸</div>
          <div className="absolute bottom-10 right-10 text-9xl">💐</div>
          <div className="absolute top-1/2 left-1/3 text-7xl">🌹</div>
        </div>
        <div className="container-main py-20 md:py-28 relative z-10 text-center">
          <p className="text-secondary-300 font-medium text-sm uppercase tracking-widest mb-3">
            Florería Los Lirios — Chorrillos, Lima
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-4">
            Flores que hablan
            <span className="block text-secondary-300">por ti</span>
          </h1>
          <p className="text-primary-100 text-lg md:text-xl max-w-xl mx-auto mb-8">
            Ramos, arreglos y plantas frescas con delivery en Chorrillos y delivery express en Lima.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalogo" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 focus:ring-white text-base px-8 py-3.5">
              Ver catálogo 🌸
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-white text-white hover:bg-white/10 focus:ring-white text-base px-8 py-3.5"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <h2 className="font-display text-3xl font-bold text-center text-primary-700 title-underline-center mb-10">
            Explora nuestras categorías
          </h2>
          {loadingCats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalogo?category_id=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group text-center"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                    {cat.icono}
                  </span>
                  <span className="text-sm font-medium text-brand-text">{cat.nombre}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Productos destacados ── */}
      <section className="section-padding bg-brand-bg">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl font-bold text-primary-700 title-underline">
              Productos destacados
            </h2>
            <Link to="/catalogo" className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
              Ver todo →
            </Link>
          </div>

          {loadingProds ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-center text-brand-muted py-10">No hay productos destacados por el momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <h2 className="font-display text-3xl font-bold text-center text-primary-700 title-underline-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🌹',
                title: 'Frescura garantizada',
                desc: 'Trabajamos con flores de temporada seleccionadas diariamente. Si no estás satisfecho, lo resolvemos sin preguntas.',
              },
              {
                icon: '🚚',
                title: 'Delivery en Chorrillos',
                desc: 'Entregamos en Chorrillos y distritos aledaños. Delivery a S/. 10 o recoge en nuestra tienda sin costo adicional.',
              },
              {
                icon: '✍️',
                title: 'Personalización',
                desc: 'Agrega una dedicatoria especial a tu pedido. También hacemos arreglos personalizados bajo pedido vía WhatsApp.',
              },
            ].map(item => (
              <div key={item.title} className="text-center px-4">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display font-semibold text-xl text-primary-700 mb-2">{item.title}</h3>
                <p className="text-brand-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA WhatsApp ── */}
      <section className="bg-secondary-300 py-12">
        <div className="container-main text-center">
          <h2 className="font-display text-2xl font-bold text-primary-800 mb-2">
            ¿Necesitas un arreglo personalizado?
          </h2>
          <p className="text-primary-700 mb-6">Escríbenos por WhatsApp y lo creamos juntos 🌸</p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, me gustaría hacer un pedido personalizado.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 text-base px-8 py-3.5 inline-flex"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            </svg>
            Chatear por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
