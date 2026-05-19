import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  appliedDiscount: number | null; // percentage e.g. 10
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
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
      
      addItem: (product, quantity = 1, size, color) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size && item.color === color
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size && item.color === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity, size, color }] };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size && item.color === color)
          ),
        }));
      },

      updateQuantity: (productId, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size && item.color === color
              ? { ...item, quantity } 
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedDiscount: null }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => {
            const priceToUse = item.product.discountPrice ? Number(item.product.discountPrice) : Number(item.product.price);
            return total + priceToUse * item.quantity;
          },
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
