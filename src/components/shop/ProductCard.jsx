import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.imagen_url || 'https://placehold.co/400x400'}
        alt={product.nombre}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{product.nombre}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.descripcion?.slice(0, 60)}...</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[#2d6a4f] font-bold">S/. {parseFloat(product.precio || 0).toFixed(2)}</span>
          <button
            onClick={() => addToCart({...product, precio: parseFloat(product.precio)})}
            className="bg-[#2d6a4f] text-white p-2 rounded-full hover:bg-[#1b4332] transition-colors"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}