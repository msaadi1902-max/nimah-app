"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// تعريف شكل الوجبة (الآن يدعم رقم التاجر والكمية والموقع الجغرافي)
type Deal = {
  id: string;
  name: string;
  store: string;
  price: number;
  image: string;
  merchant_id?: string;
  quantity?: number; // 👑 تمت إضافة حقل الكمية
  state?: string;    // 👑 لحفظ المحافظة
  city?: string;     // 👑 لحفظ المدينة
};

type CartContextType = {
  cart: Deal[];
  addToCart: (deal: Deal) => void;
  updateQuantity: (id: string, newQuantity: number) => void; // 👑 ميزة متطورة للتحكم بالكمية من السلة لاحقاً
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

  // 👑 الدالة المطورة: تضيف المنتج الجديد، أو تزيد كمية المنتج الموجود مسبقاً
  const addToCart = (deal: Deal) => {
    setCart(prevCart => {
      // البحث عما إذا كان المنتج موجوداً مسبقاً في السلة
      const existingItemIndex = prevCart.findIndex(item => item.id === deal.id);
      
      // تحديد الكمية المضافة (إذا لم يتم تمريرها نعتبرها 1)
      const addedQuantity = deal.quantity || 1;

      if (existingItemIndex >= 0) {
        // ✅ المنتج موجود: ننسخ السلة الحالية ونزيد كمية المنتج المطلوب فقط
        const updatedCart = [...prevCart];
        const currentQuantity = updatedCart[existingItemIndex].quantity || 1;
        
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: currentQuantity + addedQuantity
        };
        
        return updatedCart;
      } else {
        // ✅ المنتج غير موجود: نضيفه كعنصر جديد مع كميته
        return [...prevCart, { ...deal, quantity: addedQuantity }];
      }
    });
    
    // ملاحظة: تم إزالة الـ alert من هنا لأننا أضفناه بشكل أكثر تفصيلاً في صفحة الوجبة 
    // لكي لا يظهر تنبيهان للزبون في نفس اللحظة.
  };

  // 👑 دالة جديدة: لتعديل الكمية لاحقاً من داخل صفحة عرض السلة (+ و -)
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id); // إذا أصبحت الكمية صفر، نحذفه
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
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