'use client';

import React, { useState } from "react";
import { ShoppingCart, Trash2, Heart, ArrowRight, Loader2, Wallet, CheckCircle, ShieldCheck, Ticket, Store, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 font-sans" dir="rtl">
      <div className="mx-auto max-w-md relative flex flex-col min-h-screen">
        <TopHeader />
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <CartItems />
        </div>
        <CheckoutSection />
      </div>
      <BottomNav activeTab="cart" />
    </div>
  );
}

function TopHeader() {
  const { cart } = useCart();
  const router = useRouter();
  
  // تأمين قراءة طول المصفوفة
  const cartLength = Array.isArray(cart) ? cart.length : 0;

  return (
    <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 rounded-b-[40px] shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 border border-slate-100">
          <ArrowRight className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            سلة المشتريات
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500"/> دفع آمن ومحمي
          </p>
        </div>
      </div>
      <div className="bg-emerald-500/10 text-emerald-600 text-xs font-black px-4 py-2.5 rounded-2xl border border-emerald-500/20 flex items-center gap-2 shadow-sm">
        <ShoppingCart size={16} />
        {cartLength > 0 ? `${cartLength} منتجات` : "فارغة"}
      </div>
    </div>
  );
}

function CartItems() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const safeCart = Array.isArray(cart) ? cart : [];

  if (safeCart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 mt-24 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-50">
          <ShoppingCart className="w-14 h-14 text-slate-200" />
        </div>
        <p className="font-black text-2xl text-slate-900 mb-2">السلة فارغة تماماً!</p>
        <p className="text-sm font-bold text-slate-400 text-center leading-relaxed mb-8">لم تقم بإضافة أي منتجات بعد. استكشف العروض المذهلة في السوق الشامل وتسوق بذكاء.</p>
        <button onClick={() => router.push('/browse')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl hover:bg-slate-800">
          استكشاف السوق الآن 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 animate-in slide-in-from-bottom-4">
      {/* تم استخدام any بشكل مدروس لتجاوز تعارض الـ Context */}
      {safeCart.map((item: any) => {
        const itemPrice = Number(item.price) || 0;
        
        return (
          <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-100 transition-all">
            <div className="w-24 h-24 bg-slate-50 rounded-[20px] overflow-hidden flex-shrink-0 border border-slate-100 relative">
              {item.image && typeof item.image === 'string' && item.image.startsWith('http') ? (
                <img src={item.image} alt={item.name || 'منتج'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">📦</div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 py-1">
              <h3 className="font-black text-slate-900 text-sm truncate mb-1">{item.name || 'عنصر غير معروف'}</h3>
              <p className="text-[10px] font-black text-slate-500 mb-2 truncate flex items-center gap-1">
                <Store size={12} className="text-emerald-500 shrink-0"/> {item.store || 'بائع نِعمة'}
              </p>
              <div className="font-black text-emerald-600 text-xl tracking-tight bg-emerald-50 w-fit px-3 py-1 rounded-xl">
                {itemPrice.toFixed(2)} <span className="text-[10px] font-bold">€</span>
              </div>
            </div>

            <button 
              onClick={() => removeFromCart(item.id)}
              className="w-12 h-12 flex items-center justify-center text-rose-400 bg-white hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-90 flex-shrink-0 border border-rose-100 shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      })}
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
  
  const safeCart = Array.isArray(cart) ? cart : [];
  
  // الحساب المالي الآمن (Strict Math Calculation)
  const subtotal = (safeCart as any[]).reduce((total: number, item: any) => {
    return total + (Number(item.price) || 0);
  }, 0);
  
  const serviceFee = safeCart.length > 0 ? 0.50 : 0;
  const totalCost = subtotal + serviceFee + donation; 

  if (safeCart.length === 0) return null;

  // 👑 استخراج مواقع الاستلام من السلة ليعرف الزبون أين سيذهب
  const uniqueLocations = Array.from(new Set(safeCart.filter((i: any) => i.state).map((i: any) => `${i.state} - ${i.city}`)));

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("يرجى تسجيل الدخول أولاً للمتابعة.");
        return router.push('/welcome');
      }

      // 1. جلب بيانات المحفظة والرتبة
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance, role')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error("لم نتمكن من الوصول لبيانات حسابك.");

      if (profile?.role !== 'customer') {
         alert("🚫 عذراً، عمليات الشراء مخصصة لحسابات الزبائن فقط.");
         setLoading(false);
         return;
      }

      const currentBalance = Number(profile?.wallet_balance) || 0;

      if (currentBalance < totalCost) {
        alert(`❌ رصيدك غير كافٍ.\nالمطلوب: ${totalCost.toFixed(2)}€\nالمتوفر: ${currentBalance.toFixed(2)}€`);
        return router.push('/wallet'); 
      }

      // 👑 2. الفحص الاستباقي للمخزون (Pre-flight Stock Check)
      for (const item of safeCart) {
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('quantity, name')
          .eq('id', item.id)
          .single();

        if (mealError || !mealData) throw new Error(`تعذر التحقق من حالة المنتج: ${item.name || 'مجهول'}`);
        if (mealData.quantity < 1) {
          throw new Error(`نفدت الكمية! عذراً، المنتج "${item.name}" لم يعد متوفراً حالياً.`);
        }
      }

      // 3. خصم الرصيد
      const newBalance = currentBalance - totalCost;
      const { error: balanceError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
      if (balanceError) throw new Error("فشل في تحديث رصيد المحفظة الآمنة.");

      // 4. تسجيل العملية في السجل المالي
      await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: totalCost,
        type: 'purchase',
        status: 'completed',
        reference_number: `NIMAH-${Date.now().toString(36).toUpperCase()}`
      }]);

      // 5. إنشاء التذاكر وإنقاص المخزون (توليد الكود الموحد)
      for (const item of safeCart) {
        const ticketCode = 'NIMAH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const merchantId = typeof item.merchant_id === 'string' ? item.merchant_id : null;

        const { error: orderError } = await supabase.from('orders').insert([{
          user_id: user.id,
          customer_email: user.email,
          merchant_id: merchantId,
          meal_id: item.id,
          price: Number(item.price) || 0,
          quantity: 1,
          status: 'active',
          ticket_code: ticketCode // 👑 هنا يتم حفظ الكود الفريد لضمان التطابق مع البائع
        }]);

        if (orderError) throw orderError;

        const { data: currentMeal } = await supabase.from('meals').select('quantity').eq('id', item.id).single();
        if (currentMeal) {
          await supabase.from('meals').update({ quantity: currentMeal.quantity - 1 }).eq('id', item.id);
        }
      }

      alert("🎉 مبروك! تم إتمام الشراء بنجاح. يمكنك الآن التوجه للبائع وتزويده بكود الاستلام.");
      clearCart();
      router.push('/tickets'); 
      
    } catch (error: any) {
      alert("⚠️ توقف: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-slate-100 rounded-t-[40px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] relative z-20 animate-in slide-in-from-bottom-8">
      
      {/* 👑 قسم التبرع الخيري الفاخر */}
      <div className="mb-6 bg-gradient-to-br from-rose-50 to-white rounded-[30px] p-6 border border-rose-100/50 shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <h4 className="font-black text-xs text-rose-700 mb-4 flex items-center gap-2 relative z-10">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          ادعم مرضى السرطان بلمسة كرم
        </h4>
        
        <div className="flex gap-2 mb-4 relative z-10">
          {[0, 1, 2].map((amount) => (
            <button
              key={amount}
              onClick={() => { setIsCustom(false); setDonation(amount); setCustomAmount(""); }}
              className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black transition-all ${
                !isCustom && donation === amount 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02] border-transparent" 
                  : "bg-white text-rose-600 border border-rose-100 hover:bg-rose-50"
              }`}
            >
              {amount === 0 ? "تخطي" : `+${amount}€`}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black transition-all ${
              isCustom ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02] border-transparent" : "bg-white text-rose-600 border border-rose-100"
            }`}
          >
            آخر
          </button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-rose-200 p-3 shadow-inner animate-in slide-in-from-top-2 duration-300 relative z-10">
            <span className="text-rose-500 font-black text-lg mr-2">€</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setDonation(Math.abs(Number(e.target.value)) || 0); }}
              className="w-full bg-transparent outline-none text-slate-900 font-black text-base"
              dir="ltr"
            />
          </div>
        )}
      </div>

      {/* 🧾 ملخص الفاتورة ومواقع الاستلام */}
      <div className="space-y-3 mb-8 px-2 bg-slate-50/50 p-5 rounded-[30px] border border-slate-100">
        
        {/* 👑 عرض مواقع الاستلام ليطمئن الزبون */}
        {uniqueLocations.length > 0 && (
          <div className="pb-3 mb-3 border-b border-slate-200/60">
            <span className="text-[10px] font-black text-slate-400 mb-2 flex items-center gap-1">
              <MapPin size={12} className="text-emerald-500"/> مناطق استلام الطلبات:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {uniqueLocations.map((loc, idx) => (
                <span key={idx} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md font-bold">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span>المجموع الفرعي ({safeCart.length} عناصر)</span>
          <span className="text-slate-900 font-black">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1">رسوم الخدمة <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">ثابت</span></span>
          <span className="text-slate-900 font-black">€{serviceFee.toFixed(2)}</span>
        </div>
        {donation > 0 && (
          <div className="flex justify-between items-center text-xs text-rose-600 font-black pt-2 border-t border-rose-100">
            <span className="flex items-center gap-1">تبرع خيري ❤️</span>
            <span>€{donation.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-2">
          <span className="text-sm font-black text-slate-900">الإجمالي النهائي</span>
          <div className="text-left">
            <span className="text-3xl font-black text-emerald-600 tracking-tighter block leading-none">€{totalCost.toFixed(2)}</span>
            <span className="text-[9px] text-slate-400 font-bold">شامل الضرائب</span>
          </div>
        </div>
      </div>
      
      {/* 🚀 زر الدفع الإمبراطوري */}
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(15,23,42,0.3)] hover:bg-slate-800 hover:shadow-[0_10px_40px_rgba(15,23,42,0.4)] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:active:scale-100"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : <><Wallet className="w-6 h-6 text-emerald-400" /> إتمام الشراء الآمن</>}
      </button>
    </div>
  );
}