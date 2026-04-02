"use client";

import React, { createContext, useContext, useState } from 'react';

// تعريف شكل الوجبة
type Deal = {
  id: string;
  name: string;
  store: string;
  price: number;
  image: string;
};

// تعريف شكل السحابة (ماذا تحمل؟)
type CartContextType = {
  cart: Deal[];
  addToCart: (deal: Deal) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

// إنشاء السحابة
const CartContext = createContext<CartContextType | undefined>(undefined);

// هذا هو الموزع الذي سيغلف التطبيق
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Deal[]>([]);

  const addToCart = (deal: Deal) => {
    // التأكد من عدم إضافة الوجبة مرتين
    if (!cart.find(item => item.id === deal.id)) {
      setCart([...cart, deal]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// أداة سريعة لاستخدام السحابة في أي شاشة
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}