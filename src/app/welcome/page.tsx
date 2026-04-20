'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'merchant' | null>(null)

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

  // 👑 دالة الإظهار المباشر (تخاطب المتصفح مباشرة وتتجاوز ريأكت)
  const revealAdmin = () => {
    const adminElement = document.getElementById('permanent-admin-link');
    if (adminElement) {
      adminElement.style.display = 'flex';
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-right p-6 flex flex-col justify-between" dir="rtl">
      
      <div className="pt-10 text-center">
        {/* النقر هنا يفتح القفل للأبد في هذه الجلسة */}
        <div 
          onClick={revealAdmin}
          className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 cursor-pointer active:scale-90 transition-transform"
        >
          <span className="text-white text-3xl font-black italic select-none">ن</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك في نِعمة</h1>
        <p className="text-gray-500 font-bold text-sm">اختر نوع حسابك للبدء في رحلتنا</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setRole('customer')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'customer' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}
        >
          <div className={`p-3 rounded-2xl ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <User size={28} />
          </div>
          <div className="flex-1 text-right text-gray-900 font-black text-lg">أنا زبون</div>
          {role === 'customer' && <CheckCircle2 className="text-emerald-600" />}
        </button>

        <button 
          onClick={() => setRole('merchant')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'merchant' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}
        >
          <div className={`p-3 rounded-2xl ${role === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <Store size={28} />
          </div>
          <div className="flex-1 text-right text-gray-900 font-black text-lg">أنا صاحب متجر</div>
          {role === 'merchant' && <CheckCircle2 className="text-emerald-600" />}
        </button>
      </div>

      <div className="pb-10 space-y-4">
        <button 
          onClick={handleContinue}
          disabled={!role}
          className="w-full bg-gray-900 text-white py-5 rounded-[25px] font-black text-lg shadow-xl disabled:opacity-30 flex items-center justify-center gap-2"
        >
          متابعة <ArrowLeft size={20} />
        </button>

        {/* 🛡️ رابط الإدارة الفولاذي: لا يختفي أبداً بمجرد ظهوره */}
        <a 
          id="permanent-admin-link"
          href="/admin-login"
          style={{ display: 'none' }} 
          className="w-full bg-slate-100 text-slate-600 py-4 rounded-[20px] font-black text-xs items-center justify-center gap-2 border border-slate-200 no-underline"
        >
          <Shield size={16} /> دخول الإدارة (اضغط هنا بقوة)
        </a>
      </div>
    </div>
  )
}