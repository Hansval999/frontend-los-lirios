import { getEstadoLabel, getEstadoBadgeClass } from '@utils/index'

export default function Badge({ estado }) {
  return (
    <span className={`badge ${getEstadoBadgeClass(estado)}`}>
      {getEstadoLabel(estado)}
    </span>
  )
}
