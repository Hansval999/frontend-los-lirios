import CategoryTable from '@components/admin/CategoryTable'

export default function AdminCategorias() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand-text">Categorías</h1>
      <CategoryTable />
    </div>
  )
}
