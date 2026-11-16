import { QRCodeSVG } from 'qrcode.react'
import Modal from '@components/ui/Modal'
import { formatPrice } from '@utils/index'

export default function YapeModal({ isOpen, onClose, total, codigo }) {
  const yapeNumber = import.meta.env.VITE_YAPE_NUMBER || '935758497'
  const whatsapp   = import.meta.env.VITE_WHATSAPP    || '51935758497'

  // El QR de Yape apunta al número del negocio
  const qrValue = `yape://pay?phone=${yapeNumber}&amount=${total}`

  const waMessage = encodeURIComponent(
    `Hola, acabo de realizar el pago por Yape para el pedido ${codigo ?? ''}. Adjunto el comprobante. 🌸`
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar con Yape" size="sm">
      <div className="text-center space-y-4">
        {/* QR */}
        <div className="flex justify-center">
          <div className="p-4 bg-white border-2 border-primary-200 rounded-2xl shadow-card inline-block">
            <QRCodeSVG
              value={qrValue}
              size={180}
              fgColor="#2d6a4f"
              bgColor="#ffffff"
              level="M"
            />
          </div>
        </div>

        {/* Número */}
        <div>
          <p className="text-brand-muted text-sm">Número Yape</p>
          <p className="text-2xl font-bold text-primary-600 tracking-widest">
            {yapeNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
          </p>
        </div>

        {/* Monto */}
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="text-sm text-brand-muted">Monto exacto a pagar</p>
          <p className="text-3xl font-bold text-primary-700">{formatPrice(total)}</p>
        </div>

        {/* Instrucciones */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 space-y-1">
          <p className="font-semibold">📋 Pasos:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre tu app Yape</li>
            <li>Escanea el QR o ingresa el número</li>
            <li>Paga el monto exacto</li>
            <li>Envía el comprobante por WhatsApp</li>
          </ol>
        </div>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsapp}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
          </svg>
          Enviar comprobante por WhatsApp
        </a>

        <p className="text-xs text-brand-muted">
          Tu pedido será confirmado una vez que verifiquemos el pago. Tiempo estimado: 15-30 min.
        </p>
      </div>
    </Modal>
  )
}
