'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'merchant' | null>(null)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

  // هندسة الضغط المطول الاحترافية (للموبايل والكمبيوتر)
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = setTimeout(() => {
      setIsAdminUnlocked(true)
      // اهتزاز خفيف للموبايل للتنبيه (إذا كان مدعوماً)
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 2000) // ثانيتين من الضغط المستمر
  }

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  // منع ظهور قائمة الموبايل عند الضغط المطول
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleContinue = () => {
    if (!role) return;
    
    // تخزين الرتبة للـ Middleware
    document.cookie = `user_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('user_role', role);

    if (role === 'merchant') {
      router.push('/merchant-register');
    } else {
      router.push(`/auth?role=${role}`);
    }
  }

  // تنظيف المؤقت لتجنب تسرب الذاكرة
  useEffect(() => {
    return () => { if (pressTimer.current) clearTimeout(pressTimer.current) }
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-right p-6 flex flex-col justify-between" dir="rtl">
      
      <div className="pt-10 text-center animate-in fade-in duration-700">
        <div 
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onContextMenu={handleContextMenu}
          className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(5,150,105,0.3)] transition-transform active:scale-95 select-none touch-none cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }} // منع مربع التحديد في الآيفون
        >
          <span className="text-white text-3xl font-black italic pointer-events-none">ن</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">مرحباً بك في نِعمة</h1>
        <p className="text-gray-500 font-bold text-sm">اختر نوع حسابك للبدء في رحلتنا</p>
      </div>

      <div className="space-y-4 w-full max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-500">
        <button 
          onClick={() => setRole('customer')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all duration-300 flex items-center gap-4 ${role === 'customer' ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100/50 scale-[1.02]' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
            <User size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-xl ${role === 'customer' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا زبون</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">أبحث عن وجبات بأسعار مخفضة</p>
          </div>
          {role === 'customer' && <CheckCircle2 className="text-emerald-600 animate-in zoom-in" />}
        </button>

        <button 
          onClick={() => setRole('merchant')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all duration-300 flex items-center gap-4 ${role === 'merchant' ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100/50 scale-[1.02]' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${role === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
            <Store size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-xl ${role === 'merchant' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا صاحب متجر</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">أود بيع فائض الطعام لدي</p>
          </div>
          {role === 'merchant' && <CheckCircle2 className="text-emerald-600 animate-in zoom-in" />}
        </button>
      </div>

      <div className="pb-10 space-y-4 w-full max-w-md mx-auto">
        <button 
          onClick={handleContinue}
          disabled={!role}
          className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[25px] font-black text-lg shadow-2xl active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
        >
          متابعة <ArrowLeft size={20} />
        </button>

        {/* 👑 البوابة الإدارية (تظهر فقط بعد الضغط المطول) */}
        {isAdminUnlocked && (
          <Link 
            href="/admin-login" 
            className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 shadow-xl animate-in slide-in-from-bottom-4 active:scale-95 transition-all"
          >
            <ShieldAlert size={18} className="text-rose-500" /> الدخول للبوابة الأمنية للإدارة
          </Link>
        )}
      </div>
    </div>
  )
}