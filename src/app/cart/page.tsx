"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, Receipt, Heart, ArrowRight, Loader2, Wallet, CheckCircle } from "lucide-react";
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
      <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-4 py-2 rounded-xl border border-emerald-100">
        {cart.length > 0 ? `${cart.length} وجبات` : "فارغة"}
      </span>
    </div>
  );
}

function CartItems() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 mt-20 animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
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
        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[30px] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="w-24 h-24 bg-gray-100 rounded-[20px] overflow-hidden flex-shrink-0">
            {item.image?.startsWith('http') ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🍱</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 py-2">
            <h3 className="font-black text-gray-900 text-sm truncate mb-1">{item.name}</h3>
            <p className="text-[10px] font-bold text-gray-500 mb-2 truncate bg-gray-50 inline-block px-2 py-1 rounded-lg">
              {item.store}
            </p>
            <div className="font-black text-emerald-600 text-lg">
              {Number(item.price).toFixed(2)} <span className="text-sm">€</span>
            </div>
          </div>

          <button 
            onClick={() => removeFromCart(item.id)}
            className="w-12 h-12 flex items-center justify-center text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-90 flex-shrink-0"
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
  
  // نظام التبرع
  const [donation, setDonation] = useState<number>(0); 
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  
  // الحسابات المالية
  const subtotal = cart.reduce((total: number, item: any) => total + (Number(item.price) || 0), 0);
  const serviceFee = cart.length > 0 ? 0.50 : 0;
  const totalCost = subtotal + serviceFee + donation; 

  if (cart.length === 0) return null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. جلب بيانات الزبون من قاعدة البيانات
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("يرجى تسجيل الدخول كزبون لإتمام عملية الشراء.");
        router.push('/auth');
        return;
      }

      // جلب رصيد المحفظة الحالي
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance, role')
        .eq('id', user.id)
        .single();

      // منع التجار والموظفين من الشراء (نظام حماية إضافي)
      if (profile?.role === 'merchant' || profile?.role === 'staff' || profile?.role === 'super_admin') {
         alert("عذراً، لا يمكن لأصحاب المتاجر أو الإدارة إجراء عمليات شراء. يرجى الدخول بحساب زبون.");
         return;
      }

      const currentBalance = profile?.wallet_balance || 0;

      // 2. التحقق من كفاية الرصيد
      if (currentBalance < totalCost) {
        alert(`❌ رصيدك غير كافٍ. المطلوب: ${totalCost.toFixed(2)}€، المتاح: ${currentBalance.toFixed(2)}€`);
        router.push('/payment-methods'); // توجيهه لصفحة الشحن
        return;
      }

      // 3. خصم المبلغ من محفظة الزبون
      const newBalance = currentBalance - totalCost;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (balanceError) throw new Error("فشل في تحديث الرصيد، يرجى المحاولة لاحقاً.");

      // 4. معالجة كل وجبة في السلة (الطلب وإنقاص المخزون)
      for (const item of cart) {
        // توليد رقم تذكرة عشوائي (مثال: TKT-A8F2)
        const ticketNumber = 'TKT-' + Math.random().toString(36).substr(2, 4).toUpperCase();

        // إدخال الطلب في سجل الطلبات
        const { error: orderError } = await supabase.from('orders').insert([{
          user_id: user.id, // ربط الطلب بالزبون
          merchant_id: item.merchant_id, // ربط الطلب بالتاجر
          meal_id: item.id, // ربط الطلب بالوجبة
          ticket_number: ticketNumber,
          total_price: item.price,
          currency: '€',
          status: 'completed', // نعتبره مكتملاً بمجرد الدفع
          donation_amount: donation / cart.length // تقسيم التبرع على الطلبات
        }]);

        if (orderError) throw orderError;

        // إنقاص الكمية المتاحة من الوجبة لدى التاجر
        const { data: mealData } = await supabase.from('meals').select('quantity').eq('id', item.id).single();
        if (mealData && mealData.quantity > 0) {
          await supabase.from('meals').update({ quantity: mealData.quantity - 1 }).eq('id', item.id);
        }
      }

      // 5. إنهاء العملية بنجاح
      alert("✅ تم تأكيد الحجز وخصم المبلغ بنجاح! شكراً لك.");
      clearCart(); // إفراغ السلة
      router.push('/orders'); // توجيهه لصفحة طلباته ليرى التذاكر
      
    } catch (error: any) {
      alert("❌ حدث خطأ غير متوقع: " + error.message);
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
    <div className="p-6 bg-white border-t border-gray-100 rounded-t-[40px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
      
      {/* صندوق التبرع */}
      <div className="mb-6 bg-rose-50 rounded-[30px] p-6 border border-rose-100">
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
                  ? "bg-rose-500 text-white shadow-md scale-105" 
                  : "bg-white text-rose-600 border border-rose-100 hover:border-rose-300"
              }`}
            >
              {amount === 0 ? "بدون" : `+€${amount}`}
            </button>
          ))}
          <button
            onClick={handleCustomClick}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
              isCustom ? "bg-rose-500 text-white shadow-md scale-105" : "bg-white text-rose-600 border border-rose-100 hover:border-rose-300"
            }`}
          >
            مبلغ آخر
          </button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-rose-200 p-3 px-5 shadow-inner animate-in slide-in-from-top-2 duration-300">
            <span className="text-rose-500 font-black text-lg">€</span>
            <input
              type="number"
              min="0"
              placeholder="أدخل المبلغ..."
              value={customAmount}
              onChange={handleCustomChange}
              className="flex-1 w-full bg-transparent outline-none text-gray-900 font-black text-base"
              dir="ltr"
            />
          </div>
        )}
      </div>

      {/* تفاصيل الفاتورة */}
      <div className="space-y-4 mb-6 px-2 bg-gray-50 p-5 rounded-[25px]">
        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
          <span>المجموع الفرعي ({cart.length} وجبات)</span>
          <span className="text-gray-900">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
          <span>رسوم الخدمة وتطوير التطبيق</span>
          <span className="text-gray-900">€{serviceFee.toFixed(2)}</span>
        </div>
        {donation > 0 && (
          <div className="flex justify-between items-center text-sm text-rose-600 font-black pt-2 border-t border-rose-100">
            <span className="flex items-center gap-1"><Heart size={14} className="fill-rose-500"/> تبرع خيري</span>
            <span>€{donation.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8 px-2 text-xl font-black text-gray-900">
        <span>الإجمالي النهائي</span>
        <span className="text-emerald-600 text-3xl tracking-tight">€{totalCost.toFixed(2)}</span>
      </div>
      
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gray-900 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><CheckCircle className="w-6 h-6 text-emerald-400" /> تأكيد الدفع وإصدار التذكرة</>}
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