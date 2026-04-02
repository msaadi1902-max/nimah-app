'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBasket, Store } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  // هذه هي الدالة التي قمنا بتطويرها لتعمل مع الحارس (Middleware)
  const selectRole = (role: 'customer' | 'merchant') => {
    // 1. حفظ الاختيار في "الكوكيز" (ضروري جداً لفتح بوابة الحارس)
    document.cookie = `user_role=${role}; path=/; max-age=31536000; SameSite=Lax`; 
    
    // 2. حفظ الاختيار في "الذاكرة المحلية" (للتنسيقات الداخلية)
    localStorage.setItem('user_role', role) 

    // 3. التوجيه التلقائي
    if (role === 'merchant') {
      router.push('/profile') // صاحب المحل يذهب للوحة تحكمه
    } else {
      router.push('/') // الزبون يذهب للمتجر
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-right" dir="rtl">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-emerald-600 mb-3 italic">نِعمة 🌿</h1>
        <p className="text-gray-500 font-bold text-lg">أهلاً بك.. كيف تود البدء اليوم؟</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
        {/* بطاقة الزبون */}
        <button 
          onClick={() => selectRole('customer')}
          className="group p-8 rounded-[40px] border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center relative shadow-sm"
        >
          <div className="bg-emerald-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBasket className="text-emerald-600" size={32} />
          </div>
          <h2 className="font-black text-2xl text-gray-800">أنا زبون 🛒</h2>
          <p className="text-sm text-gray-500 mt-2">أبحث عن وجبات طازجة بأفضل الأسعار</p>
        </button>

        {/* بطاقة صاحب المحل */}
        <button 
          onClick={() => selectRole('merchant')}
          className="group p-8 rounded-[40px] border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all text-center shadow-sm"
        >
          <div className="bg-orange-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Store className="text-orange-600" size={32} />
          </div>
          <h2 className="font-black text-2xl text-gray-900">أنا صاحب عمل 🏪</h2>
          <p className="text-sm text-gray-500 mt-2">أريد إدارة مبيعاتي وتقليل الهدر</p>
        </button>
      </div>
    </div>
  )
}