'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Store, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'customer' | 'merchant' | null>(null)

  const handleContinue = () => {
    if (role === 'customer') {
      router.push('/') // يذهب للواجهة الرئيسية للزبائن
      const handleContinue = () => {
        if (role === 'customer') {
          router.push('/auth') // تحويل الزبون لصفحة تسجيل الدخول
        } else if (role === 'merchant') {
          router.push('/auth') // تحويل التاجر لصفحة تسجيل الدخول أيضاً
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-right p-6 flex flex-col justify-between" dir="rtl">
      
      <div className="pt-10 text-center">
        <div className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
          <span className="text-white text-3xl font-black italic">ن</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك في نِعمة</h1>
        <p className="text-gray-500 font-bold text-sm">اختر نوع حسابك للبدء في إنقاذ الطعام</p>
      </div>

      <div className="space-y-4">
        {/* خيار الزبون */}
        <button 
          onClick={() => setRole('customer')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${
            role === 'customer' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className={`p-3 rounded-2xl ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <User size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-lg ${role === 'customer' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا زبون</h3>
            <p className="text-xs text-gray-500 font-bold">أبحث عن وجبات لذيذة بأسعار مخفضة</p>
          </div>
          {role === 'customer' && <CheckCircle2 className="text-emerald-600" />}
        </button>

        {/* خيار التاجر */}
        <button 
          onClick={() => setRole('merchant')}
          className={`w-full p-6 rounded-[30px] border-2 transition-all flex items-center gap-4 ${
            role === 'merchant' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <div className={`p-3 rounded-2xl ${role === 'merchant' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
            <Store size={28} />
          </div>
          <div className="flex-1 text-right">
            <h3 className={`font-black text-lg ${role === 'merchant' ? 'text-emerald-900' : 'text-gray-900'}`}>أنا صاحب مطعم</h3>
            <p className="text-xs text-gray-500 font-bold">أود بيع فائض الطعام وتقليل الهدر</p>
          </div>
          {role === 'merchant' && <CheckCircle2 className="text-emerald-600" />}
        </button>
      </div>

      <div className="pb-10">
        <button 
          onClick={handleContinue}
          disabled={!role}
          className="w-full bg-gray-900 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
        >
          استمرار <ArrowLeft size={20} />
        </button>
        <p className="text-center text-xs text-gray-400 font-bold mt-6">
          بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>

    </div>
  )
}