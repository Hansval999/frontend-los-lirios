import { Link } from 'react-router-dom'

export default function Footer() {
  const whatsapp = import.meta.env.VITE_WHATSAPP || '51935758497'

  return (
    <footer className="bg-primary-600 text-white mt-auto">
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌸</span>
              <div>
                <p className="font-display font-bold text-lg leading-none">Los Lirios</p>
                <p className="text-primary-200 text-xs">Florería</p>
              </div>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              Flores frescas que expresan lo que sientes. Arreglos personalizados para cada ocasión especial.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-3 text-secondary-300">Contacto</h3>
            <ul className="space-y-2 text-sm text-primary-100">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Chorrillos, Lima, Perú</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  935 758 497
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>💌</span>
                <span>admin@floreriasloslirios.com</span>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="font-semibold mb-3 text-secondary-300">Horarios</h3>
            <ul className="space-y-1 text-sm text-primary-100">
              <li className="flex justify-between gap-4">
                <span>Lunes — Viernes</span>
                <span>8:00 — 19:00</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sábados</span>
                <span>8:00 — 18:00</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Domingos</span>
                <span>9:00 — 14:00</span>
              </li>
            </ul>
            <p className="text-primary-200 text-xs mt-3">
              Delivery en Chorrillos y distritos aledaños
            </p>
          </div>
        </div>

        <div className="border-t border-primary-500 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-300">
          <p>© {new Date().getFullYear()} Florería Los Lirios. Todos los derechos reservados.</p>
          <Link to="/admin/login" className="hover:text-white transition-colors">
            Panel admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
