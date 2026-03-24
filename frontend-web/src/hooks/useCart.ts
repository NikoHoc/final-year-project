import { useState, useMemo } from "react";
import { Menu, CartItemPayload } from "@/types";

export interface CartItem extends CartItemPayload {
  unique_id: string;
  menu: Menu;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [useTax, setUseTax] = useState(false);

  const addItem = (menu: Menu, isHalfPortion: boolean = false) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.menu_id === menu.id && item.is_half_portion === isHalfPortion && !item.note
      );

      if (existingItemIndex >= 0) {
        return prev.map((item, index) => {
          if (index === existingItemIndex) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }

      return [
        ...prev,
        {
          unique_id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          menu_id: menu.id,
          quantity: 1,
          is_half_portion: isHalfPortion,
          menu: menu,
        },
      ];
    });
  };

  const removeItem = (uniqueId: string) => {
    setCartItems((prev) => prev.filter((item) => item.unique_id !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.unique_id === uniqueId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const updateNote = (uniqueId: string, note: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.unique_id === uniqueId ? { ...item, note } : item))
    );
  };

  const toggleHalfPortion = (uniqueId: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.unique_id === uniqueId && item.menu.half_price) {
          return { ...item, is_half_portion: !item.is_half_portion };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totals = useMemo(() => {
    let subtotal = 0;

    cartItems.forEach((item) => {
      const priceToUse = item.is_half_portion && item.menu.half_price ? item.menu.half_price : item.menu.price;
      subtotal += priceToUse * item.quantity;
    });

    const taxAmount = useTax ? subtotal * 0.1 : 0;
    const grandTotal = subtotal + taxAmount;

    return { subtotal, taxAmount, grandTotal };
  }, [cartItems, useTax]);

  return {
    cartItems,
    setCartItems,
    useTax,
    setUseTax,
    addItem,
    removeItem,
    updateQuantity,
    updateNote,
    toggleHalfPortion,
    clearCart,
    totals,
  };
};