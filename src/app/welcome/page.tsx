'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'merchant' | null>(null)
  
  const clickCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 👑 دالة الدخول السري - النسخة الفولاذية للموبايل
  const handleSecretClick = (e: React.MouseEvent | React.TouchEvent) => {
    // منع الوميض وتحديث الصفحة
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current += 1;

    // إظهار تنبيه بسيط في الكونسول للتأكد (اختياري)
    console.log("Click count:", clickCountRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      // استخدام window.location للتوجيه القسري لضمان كسر أي حلقة تكرار
      window.location.href = '/admin-login';
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  }

  const handleContinue = () => {
    if (!role) return;
    document.cookie = `user_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('user_role', role);

    if (role === 'merchant') {
      router.push('/merchant-register');
    } else {
      router.push(`/auth?role=${role}`);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-right p-6 flex flex-col justify-between" dir="rtl">
      
      <div className="pt-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
        {/* الزر السري مع حماية كاملة من الوميض */}
        <div 
          onClick={handleSecretClick}
          onContextMenu={(e) => e.preventDefault()} // منع ظهور قائمة "حفظ الصورة"
          className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 cursor-pointer transition-transform active:scale-90 touch-none select-none"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="text-white text-3xl font-black italic pointer-events-none">ن</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك في نِعمة</h1>
        <p className="text-gray-500 font-bold text-sm">اختر نوع حسابك للبدء في رحلتنا</p>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        <button 
          onClick={() => setRole('customer')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'customer' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className={`p-3 rounded-2xl transition-colors ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
            <User size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-lg ${role === 'customer' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا زبون</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">أبحث عن وجبات بأسعار مخفضة</p>
          </div>
          {role === 'customer' && <CheckCircle2 className="text-emerald-600 animate-in zoom-in" />}
        </button>

        <button 
          onClick={() => setRole('merchant')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'merchant' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className={`p-3 rounded-2xl transition-colors ${role === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
            <Store size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-lg ${role === 'merchant' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا صاحب متجر</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">أود بيع فائض الطعام لدي</p>
          </div>
          {role === 'merchant' && <CheckCircle2 className="text-emerald-600 animate-in zoom-in" />}
        </button>
      </div>

      <div className="pb-10">
        <button 
          onClick={handleContinue}
          disabled={!role}
          className="w-full bg-gray-900 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
        >
          متابعة <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  )
}