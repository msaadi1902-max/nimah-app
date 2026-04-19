"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, Heart, ArrowRight, Loader2, Wallet, CheckCircle, ShieldCheck, Ticket } from "lucide-react";
import { useCart } from "../context/CartContext";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function TopHeader() {
  const { cart } = useCart();
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 sticky top-0 z-20 rounded-b-[30px] shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-emerald-50 rounded-xl transition-colors active:scale-95">
          <ArrowRight className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
          سلة المشتريات
        </h1>
      </div>
      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-2 rounded-xl border border-emerald-100">
        {cart.length > 0 ? `${cart.length} وجبات` : "فارغة"}
      </span>
    </div>
  );
}

function CartItems() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 mt-20 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShoppingCart className="w-16 h-16 text-gray-300" />
        </div>
        <p className="font-black text-2xl text-gray-900 mb-2">سلتك فارغة تماماً</p>
        <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">لم تقم بإضافة أي وجبات بعد. ابدأ باستكشاف العروض المذهلة وأنقذ طعاماً لذيذاً!</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {cart.map((item: any) => (
        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[30px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-colors">
          <div className="w-24 h-24 bg-gray-100 rounded-[20px] overflow-hidden flex-shrink-0 border border-gray-50">
            {item.image?.startsWith('http') ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🍱</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 py-2">
            <h3 className="font-black text-gray-900 text-sm truncate mb-1">{item.name}</h3>
            <p className="text-[9px] font-black text-emerald-600 mb-2 truncate bg-emerald-50 inline-block px-2.5 py-1 rounded-lg">
              {item.store}
            </p>
            <div className="font-black text-gray-900 text-xl tracking-tight">
              {Number(item.price).toFixed(2)} <span className="text-xs font-bold text-emerald-600">€</span>
            </div>
          </div>

          <button 
            onClick={() => removeFromCart(item.id)}
            className="w-12 h-12 flex items-center justify-center text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-90 flex-shrink-0 border border-rose-100"
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
  
  const subtotal = cart.reduce((total: number, item: any) => total + (Number(item.price) || 0), 0);
  const serviceFee = cart.length > 0 ? 0.50 : 0;
  const totalCost = subtotal + serviceFee + donation; 

  if (cart.length === 0) return null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("يرجى تسجيل الدخول كزبون أولاً.");
        router.push('/welcome');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance, role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'merchant' || profile?.role === 'staff' || profile?.role === 'super_admin') {
         alert("عذراً، يجب استخدام حساب زبون لإتمام عمليات الشراء.");
         setLoading(false);
         return;
      }

      const currentBalance = profile?.wallet_balance || 0;

      if (currentBalance < totalCost) {
        alert(`❌ رصيدك غير كافٍ.\nالمطلوب: ${totalCost.toFixed(2)}€\nالمتوفر: ${currentBalance.toFixed(2)}€`);
        router.push('/wallet'); 
        return;
      }

      // === تنفيذ العملية المالية (Transactions) ===
      const newBalance = currentBalance - totalCost;
      const { error: balanceError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
      if (balanceError) throw new Error("فشل تحديث الرصيد.");

      // تسجيل عملية الخصم في سجل المحفظة
      await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: totalCost,
        type: 'purchase',
        status: 'completed',
        reference_number: `BUY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }]);

      // === معالجة الطلبات وإصدار التذاكر ===
      for (const item of cart) {
        const ticketCode = 'NIMAH-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        const { error: orderError } = await supabase.from('orders').insert([{
          user_id: user.id,
          customer_email: user.email,
          merchant_id: item.merchant_id,
          meal_id: item.id,
          price: item.price,
          quantity: 1,
          status: 'active',
          ticket_code: ticketCode // إصلاح: الحقل في SQL هو ticket_code
        }]);

        if (orderError) throw orderError;

        // إنقاص الكمية من المخزون
        const { data: mealData } = await supabase.from('meals').select('quantity').eq('id', item.id).single();
        if (mealData && mealData.quantity > 0) {
          await supabase.from('meals').update({ quantity: mealData.quantity - 1 }).eq('id', item.id);
        }
      }

      alert("🎉 مبروك! تم الدفع وإصدار التذاكر بنجاح. يمكنك استلام وجبتك الآن.");
      clearCart();
      router.push('/tickets'); 
      
    } catch (error: any) {
      alert("❌ خطأ تقني: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-gray-100 rounded-t-[40px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.08)]">
      
      {/* قسم التبرع */}
      <div className="mb-6 bg-rose-50 rounded-[30px] p-6 border border-rose-100 group">
        <h4 className="font-black text-xs text-rose-700 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          ادعم مرضى السرطان بلمسة كرم
        </h4>
        
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((amount) => (
            <button
              key={amount}
              onClick={() => { setIsCustom(false); setDonation(amount); setCustomAmount(""); }}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black transition-all ${
                !isCustom && donation === amount 
                  ? "bg-rose-500 text-white shadow-lg scale-105" 
                  : "bg-white text-rose-600 border border-rose-100 hover:border-rose-300"
              }`}
            >
              {amount === 0 ? "لا أريد" : `+€${amount}`}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black transition-all ${
              isCustom ? "bg-rose-500 text-white shadow-lg scale-105" : "bg-white text-rose-600 border border-rose-100"
            }`}
          >
            آخر
          </button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-rose-200 p-3 shadow-inner animate-in slide-in-from-top-2 duration-300">
            <span className="text-rose-500 font-black text-lg mr-2">€</span>
            <input
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setDonation(Number(e.target.value) || 0); }}
              className="w-full bg-transparent outline-none text-gray-900 font-black text-base"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6 px-2 bg-gray-50/50 p-5 rounded-[25px] border border-gray-100">
        <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
          <span>المجموع الفرعي ({cart.length})</span>
          <span className="text-gray-900 font-black">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
          <span>رسوم الخدمة</span>
          <span className="text-gray-900 font-black">€{serviceFee.toFixed(2)}</span>
        </div>
        {donation > 0 && (
          <div className="flex justify-between items-center text-[11px] text-rose-600 font-black pt-2 border-t border-rose-100">
            <span className="flex items-center gap-1">تبرع خيري ❤️</span>
            <span>€{donation.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-sm font-black text-gray-900">الإجمالي النهائي</span>
          <span className="text-2xl font-black text-emerald-600 tracking-tighter">€{totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="w-6 h-6 text-emerald-400" /> دفع عبر المحفظة</>}
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