import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      couponDiscount: 0,
      pointsToRedeem: 0,

      // Add item to cart
      addItem: (product, size, toppings = [], quantity = 1, notes = '') => {
        const items = get().items;
        
        // Calculate price
        let unitPrice = product.basePrice;
        if (size && product.sizes?.length > 0) {
          const sizeObj = product.sizes.find(s => s.name === size);
          if (sizeObj) unitPrice += sizeObj.priceModifier;
        }
        
        let toppingsTotal = 0;
        const toppingsList = [];
        toppings.forEach(toppingName => {
          const topping = product.toppings?.find(t => t.name === toppingName);
          if (topping) {
            toppingsTotal += topping.price;
            toppingsList.push({ name: topping.name, price: topping.price });
          }
        });
        
        const subtotal = (unitPrice + toppingsTotal) * quantity;
        
        const cartItem = {
          id: `${product._id}-${size}-${Date.now()}`,
          product: product._id,
          name: product.name,
          image: product.primaryImage || product.images?.[0]?.url,
          size,
          toppings: toppingsList,
          unitPrice,
          quantity,
          notes,
          subtotal,
        };
        
        set({ items: [...items, cartItem] });
      },

      // Update quantity
      updateQuantity: (itemId, quantity) => {
        const items = get().items.map(item => {
          if (item.id === itemId) {
            const newSubtotal = (item.unitPrice + 
              item.toppings.reduce((sum, t) => sum + t.price, 0)) * quantity;
            return { ...item, quantity, subtotal: newSubtotal };
          }
          return item;
        });
        set({ items });
      },

      // Remove item
      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) });
      },

      // Apply coupon
      setCoupon: (coupon, discount) => {
        set({ coupon, couponDiscount: discount });
      },

      // Remove coupon
      removeCoupon: () => {
        set({ coupon: null, couponDiscount: 0 });
      },

      // Set points to redeem
      setPointsToRedeem: (points) => {
        set({ pointsToRedeem: points });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], coupon: null, couponDiscount: 0, pointsToRedeem: 0 });
      },

      // Get subtotal
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0);
      },

      // Get total discount
      getTotalDiscount: () => {
        const { couponDiscount, pointsToRedeem } = get();
        return couponDiscount + (pointsToRedeem / 100) * 1000; // 100 points = 1000 VND
      },

      // Get final total
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getTotalDiscount();
        return Math.max(0, subtotal - discount);
      },

      // Get item count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Check if product is in cart
      isInCart: (productId) => {
        return get().items.some(item => item.product === productId);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        couponDiscount: state.couponDiscount,
        pointsToRedeem: state.pointsToRedeem,
      }),
    }
  )
);
