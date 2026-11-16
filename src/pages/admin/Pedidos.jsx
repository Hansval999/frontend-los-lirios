import OrderTable from '@components/admin/OrderTable'

export default function AdminPedidos() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-brand-text">Pedidos</h1>
      <OrderTable />
    </div>
  )
}
