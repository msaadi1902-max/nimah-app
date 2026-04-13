"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, Receipt, Heart, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function TopHeader() {
  const { cart } = useCart();
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-5 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
          سلة المشتريات
        </h1>
      </div>
      <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full shadow-sm">
        {cart.length > 0 ? `${cart.length} عناصر` : "فارغة"}
      </span>
    </div>
  );
}

function CartItems() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 mt-20 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-100 mb-4" />
          <div className="absolute top-0 right-0 bg-gray-200 w-8 h-8 rounded-full border-4 border-white"></div>
        </div>
        <p className="font-black text-xl text-gray-800">سلتك فارغة حالياً</p>
        <p className="text-sm mt-2 text-gray-400">ابدأ باستكشاف العروض وأنقذ بعض الوجبات!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[25px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl overflow-hidden flex items-center justify-center">
            {item.image.startsWith('http') ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{item.image}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-gray-900 text-base">{item.name}</h3>
            <p className="text-xs font-bold text-emerald-600 mb-2">{item.store}</p>
            <div className="font-black text-gray-900">€{Number(item.price).toFixed(2)}</div>
          </div>
          <button 
            onClick={() => removeFromCart(item.id)}
            className="p-3 text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CheckoutSection() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [donation, setDonation] = useState<number>(0); 
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  
  const subtotal = cart.reduce((total, item) => total + (Number(item.price) || 0), 0);
  const serviceFee = cart.length > 0 ? 0.50 : 0;
  const total = subtotal + serviceFee + donation; 

  if (cart.length === 0) return null;

  // دالة إتمام الطلب ومعالجة البيانات في قاعدة البيانات
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("يرجى تسجيل الدخول كزبون أولاً لحجز العروض.");
        router.push('/welcome');
        return;
      }

      // 1. إرسال الطلبات إلى جدول orders
      for (const item of cart) {
        const { error: orderError } = await supabase.from('orders').insert([{
          customer_email: user.email,
          meal_name: item.name,
          price: item.price,
          status: 'pending',
          merchant_id: 'auto_fetch', // سيتم ربطه برمجياً لاحقاً
          donation_amount: donation / cart.length // توزيع التبرع على العناصر
        }]);

        if (orderError) throw orderError;

        // 2. تحديث المخزون (إنقاص الكمية)
        const { data: mealData } = await supabase.from('meals').select('quantity').eq('id', item.id).single();
        if (mealData) {
          await supabase.from('meals').update({ quantity: mealData.quantity - 1 }).eq('id', item.id);
        }
      }

      alert("تم تأكيد الحجز بنجاح! 🎉");
      clearCart();
      router.push('/tickets');
    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedClick = (amount: number) => {
    setIsCustom(false);
    setDonation(amount);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setDonation(Number(customAmount) || 0);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setDonation(Number(val) || 0);
  };

  return (
    <div className="p-6 bg-white border-t border-gray-100 rounded-t-[40px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.08)]">
      
      <div className="mb-6 bg-rose-50 rounded-[30px] p-5 border border-rose-100">
        <h4 className="font-black text-sm text-rose-700 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          تبرع لدعم مرضى السرطان
        </h4>
        
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((amount) => (
            <button
              key={amount}
              onClick={() => handlePredefinedClick(amount)}
              className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
                !isCustom && donation === amount 
                  ? "bg-rose-500 text-white shadow-lg scale-105" 
                  : "bg-white text-rose-600 border border-rose-200"
              }`}
            >
              {amount === 0 ? "بدون" : `+€${amount}`}
            </button>
          ))}
          <button
            onClick={handleCustomClick}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
              isCustom ? "bg-rose-500 text-white shadow-lg scale-105" : "bg-white text-rose-600 border border-rose-200"
            }`}
          >
            آخر
          </button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-rose-300 p-2 px-4 shadow-inner animate-in slide-in-from-top-2 duration-300">
            <span className="text-rose-500 font-black">€</span>
            <input
              type="number"
              placeholder="أدخل مبلغا..."
              value={customAmount}
              onChange={handleCustomChange}
              className="flex-1 w-full bg-transparent outline-none text-rose-700 font-black text-sm"
              dir="ltr"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6 px-2">
        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
          <span>المجموع الفرعي</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
          <span>رسوم الخدمة</span>
          <span>€{serviceFee.toFixed(2)}</span>
        </div>
        {donation > 0 && (
          <div className="flex justify-between items-center text-sm text-rose-600 font-black">
            <span>تبرع خيري</span>
            <span>€{donation.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8 px-2 text-xl font-black text-gray-900 border-t border-dashed border-gray-200 pt-5">
        <span>الإجمالي</span>
        <span className="text-emerald-600 text-2xl">€{total.toFixed(2)}</span>
      </div>
      
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-emerald-600 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Receipt className="w-6 h-6" /> تأكيد الدفع والحجز</>}
      </button>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 font-sans" dir="rtl">
      <div className="mx-auto max-w-md relative flex flex-col min-h-screen">
        <TopHeader />
        <div className="flex-1 overflow-y-auto">
          <CartItems />
        </div>
        <CheckoutSection />
      </div>
      <BottomNav activeTab="cart" />
    </div>
  );
}