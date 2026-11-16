import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

// ============================================================
// Contexto
// ============================================================
const CartContext = createContext(null)

// ============================================================
// Reducer
// ============================================================
const STORAGE_KEY = 'floreria_cart'

function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id
              ? { ...i, cantidad: i.cantidad + (action.item.cantidad ?? 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, cantidad: action.item.cantidad ?? 1 }],
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
      }

    case 'UPDATE_QUANTITY': {
      if (action.cantidad < 1) {
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.id),
        }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, cantidad: action.cantidad } : i
        ),
      }
    }

    case 'CLEAR':
      return { ...state, items: [] }

    case 'LOAD':
      return { ...state, items: action.items }

    default:
      return state
  }
}

const initialState = { items: [] }

// ============================================================
// Provider
// ============================================================
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'LOAD', items: parsed })
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Persistir en localStorage cada vez que cambian los items
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  // ── Acciones ──────────────────────────────────────────────

  function addItem(product, cantidad = 1) {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id:         product.id,
        nombre:     product.nombre,
        precio:     parseFloat(product.precio),
        imagen_url: product.imagen_url,
        stock:      product.stock,
        cantidad,
      },
    })
    toast.success(`"${product.nombre}" agregado al carrito 🌸`)
  }

  function removeItem(id) {
    dispatch({ type: 'REMOVE_ITEM', id })
  }

  function updateQuantity(id, cantidad) {
    dispatch({ type: 'UPDATE_QUANTITY', id, cantidad: parseInt(cantidad) })
  }

  function clearCart() {
    dispatch({ type: 'CLEAR' })
  }

  // ── Derivados ─────────────────────────────────────────────

  const totalItems = state.items.reduce((sum, i) => sum + i.cantidad, 0)

  const subtotal = state.items.reduce(
    (sum, i) => sum + parseFloat(i.precio) * i.cantidad,
    0
  )

  function getDelivery(tipoEntrega) {
    return tipoEntrega === 'delivery' ? 10 : 0
  }

  function getTotal(tipoEntrega = 'delivery') {
    return subtotal + getDelivery(tipoEntrega)
  }

  const value = {
    items:      state.items,
    totalItems,
    subtotal,
    getDelivery,
    getTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isEmpty: state.items.length === 0,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ============================================================
// Hook
// ============================================================
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
