import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Flower2 } from 'lucide-react';

export default function Navbar() {
  const { totalItems: cartCount } = useCart();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-[#2d6a4f]">
        <Flower2 size={28} /> Los Lirios
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
        <Link to="/catalogo" className="hover:text-[#2d6a4f]">Catálogo</Link>
        <Link to="/carrito" className="relative hover:text-[#2d6a4f] flex items-center gap-1">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#e63946] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}