'use client'
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { User, Store, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'merchant'>('customer')
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. تسجيل المستخدم في نظام Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert("خطأ: " + error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // 2. إضافة بياناته في جدول الـ Profiles الذي أنشأناه للتو
      await supabase.from('profiles').insert([
        { 
          id: data.user.id, 
          role: role, 
          shop_name: role === 'merchant' ? shopName : null,
          is_approved: role === 'customer' // الزبون يوافق عليه تلقائياً، التاجر لا
        }
      ])

      if (role === 'merchant') {
        alert("تم استلام طلبك كتاجر بنجاح! يرجى انتظار موافقة الإدارة لتتمكن من إضافة وجباتك.")
      } else {
        router.push('/') // الزبون يذهب للرئيسية فوراً
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 relative overflow-hidden">
        
        {/* تصميم الهيدر */}
        <div className="text-center mb-10">
          <div className="bg-emerald-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">مرحباً بك في نِعمة 🌿</h1>
          <p className="text-xs text-gray-400 font-bold mt-2 italic">الخطوة الأولى لتقليل الهدر وكسب الأجر</p>
        </div>

        {/* اختيار النوع (زبون أو تاجر) */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 gap-1">
          <button 
            onClick={() => setRole('customer')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${role === 'customer' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            <User size={16} /> أنا زبون
          </button>
          <button 
            onClick={() => setRole('merchant')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${role === 'merchant' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            <Store size={16} /> أنا تاجر
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute right-4 top-4 text-gray-300" size={18} />
            <input 
              type="email" placeholder="البريد الإلكتروني" required
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-4 text-gray-300" size={18} />
            <input 
              type="password" placeholder="كلمة المرور" required
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* حقل يظهر فقط إذا اختار "تاجر" */}
          {role === 'merchant' && (
            <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="relative border-2 border-emerald-100 rounded-2xl p-1 bg-emerald-50/30">
                <Store className="absolute right-4 top-4 text-emerald-300" size={18} />
                <input 
                  type="text" placeholder="اسم المحل / المطعم" required
                  className="w-full bg-transparent border-none rounded-2xl py-4 pr-12 pl-4 text-sm font-black text-emerald-800 placeholder:text-emerald-200 focus:ring-0"
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed px-2">
                * ملاحظة: حسابات التجار تخضع للمراجعة من قبل الإدارة قبل التفعيل.
              </p>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : 'ابدأ الآن'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* زينة جمالية في الخلفية */}
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  )
}