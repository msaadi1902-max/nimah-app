'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'merchant' | null>(null)
  const [showAdminBtn, setShowAdminBtn] = useState(false)

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
      
      <div className="pt-10 text-center">
        {/* النقر على النون يظهر الزر السري */}
        <div 
          onClick={() => setShowAdminBtn(true)} 
          className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 cursor-pointer active:scale-95"
        >
          <span className="text-white text-3xl font-black italic select-none">ن</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك في نِعمة</h1>
        <p className="text-gray-500 font-bold text-sm">اختر نوع حسابك للبدء</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setRole('customer')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'customer' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
        >
          <div className={`p-3 rounded-2xl ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <User size={28} />
          </div>
          <div className="flex-1 text-right text-gray-900 font-black text-lg">أنا زبون</div>
        </button>

        <button 
          onClick={() => setRole('merchant')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${role === 'merchant' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
        >
          <div className={`p-3 rounded-2xl ${role === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <Store size={28} />
          </div>
          <div className="flex-1 text-right text-gray-900 font-black text-lg">أنا صاحب متجر</div>
        </button>
      </div>

      <div className="pb-10 space-y-4">
        <button 
          onClick={handleContinue}
          disabled={!role}
          className="w-full bg-gray-900 text-white py-5 rounded-[25px] font-black text-lg shadow-xl active:scale-95 disabled:opacity-30"
        >
          متابعة
        </button>

        {/* 🛡️ التعديل الجوهري: الربط بـ admin-panel مباشرة كـ رابط صريح */}
        {showAdminBtn && (
          <a 
            href="/admin-panel" 
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-[20px] font-black text-xs flex items-center justify-center gap-2 border border-slate-200 no-underline"
          >
            <Shield size={16} /> دخول لوحة الإدارة
          </a>
        )}
      </div>
    </div>
  )
}