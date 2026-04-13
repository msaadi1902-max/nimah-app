"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Deal = {
  id: string;
  name: string;
  store: string;
  price: number;
  image: string;
};

type CartContextType = {
  cart: Deal[];
  addToCart: (deal: Deal) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Deal[]>([]);

  // تحميل السلة من التخزين المحلي عند فتح التطبيق
  useEffect(() => {
    const savedCart = localStorage.getItem('nimah_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // حفظ السلة تلقائياً عند أي تغيير
  useEffect(() => {
    localStorage.setItem('nimah_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (deal: Deal) => {
    if (!cart.find(item => item.id === deal.id)) {
      setCart([...cart, deal]);
      // تنبيه بسيط (يمكنك استبداله بـ Toast لاحقاً)
      alert("تمت إضافة الوجبة للسلة! 🎉");
    } else {
      alert("الوجبة موجودة بالفعل في السلة");
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

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}