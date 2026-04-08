"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, Receipt, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import BottomNav from "@/components/BottomNav";

function TopHeader() {
  const { cart } = useCart();
  return (
    <div className="flex items-center justify-between p-5 bg-white border-b border-gray-100 sticky top-0 z-10">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-emerald-600" />
        سلة المشتريات
      </h1>
      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
        {cart.length > 0 ? `${cart.length} عناصر` : "فارغة"}
      </span>
    </div>
  );
}

function CartItems() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 mt-10">
        <ShoppingCart className="w-20 h-20 mx-auto text-gray-200 mb-4" />
        <p className="font-bold text-lg text-gray-700">سلتك فارغة حالياً</p>
        <p className="text-sm mt-2">اذهب للرئيسية وأنقذ بعض الوجبات اللذيذة!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl">
            {item.image}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{item.store}</p>
            <div className="font-bold text-emerald-600">€{parseFloat(String(item.price).replace(/[^\d.]/g, '')).toFixed(2)}</div>
          </div>
          <button 
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CheckoutSection() {
  const { cart } = useCart();
  
  // الذواكر الجديدة للتحكم بالتبرع المخصص
  const [donation, setDonation] = useState<number>(0); 
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  
  const subtotal = cart.reduce((total, item) => {
    const priceNumber = parseFloat(String(item.price).replace(/[^\d.]/g, '')) || 0;
    return total + priceNumber;
  }, 0);
  
  const serviceFee = cart.length > 0 ? 0.50 : 0;
  const total = subtotal + serviceFee + donation; 

  if (cart.length === 0) return null;

  // دالة التعامل مع الأزرار الجاهزة
  const handlePredefinedClick = (amount: number) => {
    setIsCustom(false);
    setDonation(amount);
    setCustomAmount("");
  };

  // دالة التعامل مع زر "مبلغ آخر"
  const handleCustomClick = () => {
    setIsCustom(true);
    setDonation(Number(customAmount) || 0);
  };

  // دالة الكتابة داخل المربع
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setDonation(Number(val) || 0);
  };

  return (
    <div className="p-5 bg-white border-t border-gray-100 mt-4 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      
      {/* صندوق التبرع لمرضى السرطان */}
      <div className="mb-5 bg-rose-50 rounded-xl p-4 border border-rose-100">
        <h4 className="font-bold text-sm text-rose-700 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          تبرع لدعم رعاية مرضى السرطان
        </h4>
        
        {/* أزرار التبرع */}
        <div className="flex gap-2 mb-3">
          {[0, 1, 2].map((amount) => (
            <button
              key={amount}
              onClick={() => handlePredefinedClick(amount)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                !isCustom && donation === amount 
                  ? "bg-rose-500 text-white shadow-md transform scale-105" 
                  : "bg-white text-rose-600 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              {amount === 0 ? "بدون" : `+€${amount}`}
            </button>
          ))}
          <button
            onClick={handleCustomClick}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              isCustom 
                ? "bg-rose-500 text-white shadow-md transform scale-105" 
                : "bg-white text-rose-600 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            مبلغ آخر
          </button>
        </div>

        {/* مربع الكتابة يظهر فقط إذا اختار "مبلغ آخر" */}
        {isCustom && (
          <div className="flex items-center gap-2 bg-white rounded-lg border border-rose-300 p-1 px-3 shadow-inner animate-in fade-in slide-in-from-top-2">
            <span className="text-gray-500 font-bold">€</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="أدخل المبلغ..."
              value={customAmount}
              onChange={handleCustomChange}
              className="flex-1 w-full py-2 bg-transparent outline-none text-rose-700 font-bold"
              dir="ltr"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
        <span>المجموع الفرعي</span>
        <span>€{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
        <span>رسوم الخدمة (لدعم التطبيق)</span>
        <span>€{serviceFee.toFixed(2)}</span>
      </div>
      
      {donation > 0 && (
        <div className="flex justify-between items-center mb-4 text-sm text-rose-600 font-bold">
          <span>تبرع خيري (مرضى السرطان)</span>
          <span>€{donation.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 text-lg font-bold text-gray-900 border-t border-dashed border-gray-200 pt-4">
        <span>الإجمالي</span>
        <span className="text-emerald-600">€{total.toFixed(2)}</span>
      </div>
      
      <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 transition-colors">
        <Receipt className="w-5 h-5" />
        تأكيد الدفع والاستلام
      </button>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 font-sans" dir="rtl">
      <div className="mx-auto max-w-md relative flex flex-col min-h-screen">
        <TopHeader />
        <div className="flex-1">
          <CartItems />
        </div>
        <CheckoutSection />
      </div>
      <BottomNav activeTab="home" />
    </div>
  );
}