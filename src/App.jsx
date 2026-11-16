import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

// Layout
import Navbar  from '@components/layout/Navbar'
import Footer  from '@components/layout/Footer'
import AdminSidebar from '@components/layout/AdminSidebar'

// Páginas tienda
import Home         from '@pages/shop/Home'
import Catalogo     from '@pages/shop/Catalogo'
import Carrito      from '@pages/shop/Carrito'
import Checkout     from '@pages/shop/Checkout'
import Confirmacion from '@pages/shop/Confirmacion'

// Páginas admin
import AdminLogin      from '@pages/admin/Login'
import AdminDashboard  from '@pages/admin/Dashboard'
import AdminProductos  from '@pages/admin/Productos'
import AdminPedidos    from '@pages/admin/Pedidos'
import AdminCategorias from '@pages/admin/Categorias'

// ============================================================
// PrivateRoute — protege rutas admin
// ============================================================
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-muted text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

// ============================================================
// Layout de la tienda pública
// ============================================================
function ShopLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

// ============================================================
// Layout del panel admin
// ============================================================
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64">
        <main className="flex-1 min-w-0 p-4 pt-16 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// ============================================================
// App — definición de rutas
// ============================================================
export default function App() {
  return (
    <Routes>

      {/* ── Tienda pública ── */}
      <Route path="/" element={
        <ShopLayout><Home /></ShopLayout>
      } />

      <Route path="/catalogo" element={
        <ShopLayout><Catalogo /></ShopLayout>
      } />

      <Route path="/carrito" element={
        <ShopLayout><Carrito /></ShopLayout>
      } />

      <Route path="/checkout" element={
        <ShopLayout><Checkout /></ShopLayout>
      } />

      <Route path="/confirmacion" element={
        <ShopLayout><Confirmacion /></ShopLayout>
      } />

      {/* ── Admin: login (sin sidebar) ── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Admin: rutas protegidas ── */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </PrivateRoute>
      } />

      <Route path="/admin/productos" element={
        <PrivateRoute>
          <AdminLayout><AdminProductos /></AdminLayout>
        </PrivateRoute>
      } />

      <Route path="/admin/pedidos" element={
        <PrivateRoute>
          <AdminLayout><AdminPedidos /></AdminLayout>
        </PrivateRoute>
      } />

      <Route path="/admin/categorias" element={
        <PrivateRoute>
          <AdminLayout><AdminCategorias /></AdminLayout>
        </PrivateRoute>
      } />

      {/* ── Redirecciones ── */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ── 404 ── */}
      <Route path="*" element={
        <ShopLayout>
          <div className="container-main section-padding text-center">
            <p className="text-8xl mb-4">🌸</p>
            <h1 className="text-4xl font-display font-bold text-primary-600 mb-3">
              Página no encontrada
            </h1>
            <p className="text-brand-muted mb-8">
              La página que buscas no existe o fue movida.
            </p>
            <a href="/" className="btn-primary">
              Volver al inicio
            </a>
          </div>
        </ShopLayout>
      } />

    </Routes>
  )
}
