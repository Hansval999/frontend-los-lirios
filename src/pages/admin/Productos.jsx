import ProductTable from '@components/admin/ProductTable'

export default function AdminProductos() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand-text">Productos</h1>
      <ProductTable />
    </div>
  )
}
