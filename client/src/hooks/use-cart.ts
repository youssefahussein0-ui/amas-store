import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  appliedDiscount: number | null; // percentage e.g. 10
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getDiscountedTotal: () => number;
  getCartCount: () => number;
  setDiscount: (discount: number | null) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscount: null,
      
      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity, size }] };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size 
              ? { ...item, quantity } 
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0
        );
      },

      getDiscountedTotal: () => {
        const total = get().getCartTotal();
        const discount = get().appliedDiscount;
        if (discount) {
          return total * (1 - discount / 100);
        }
        return total;
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      setDiscount: (discount) => set({ appliedDiscount: discount }),
    }),
    {
      name: 'amas-cart-storage',
    }
  )
);
