'use client'
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Store, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // حالات النموذج
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. إنشاء الحساب في Supabase Auth مع إرسال الرتبة في البيانات الوصفية
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'merchant' // 👈 هاد السر ليتسجل تاجر فوراً
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. إدخال البيانات الإضافية في جدول الـ profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: fullName,
            shop_name: shopName,
            phone: phone,
            role: 'merchant' // 👈 نؤكد الرتبة هنا أيضاً
          })
          .eq('id', authData.user.id)

        // ملحوظة: استخدمنا update لأن الـ Trigger غالباً أنشأ السطر بالفعل
        // إذا لم يكن لديك Trigger، نستخدم insert.

        alert('✅ تم إنشاء حساب التاجر بنجاح! يمكنك الآن الدخول للوحة التحكم.')
        router.push('/login')
      }
    } catch (error: any) {
      alert('❌ حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-right font-sans p-6" dir="rtl">
      <button onClick={() => router.back()} className="p-2 bg-gray-50 rounded-xl mb-6">
        <ArrowRight size={20} className="text-gray-600" />
      </button>

      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">انضم كتاجر 👨‍🍳</h1>
          <p className="text-gray-500 font-bold mt-2">ابدأ ببيع وجباتك والمساهمة في تقليل الهدر</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 mr-2 uppercase">الاسم الكامل</label>
            <div className="relative">
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all" placeholder="اسمه الكريم..." />
              <User size={18} className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 mr-2 uppercase">اسم المتجر / المطعم</label>
            <div className="relative">
              <input required type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all" placeholder="مثلاً: مطعم نِعمة الطيب..." />
              <Store size={18} className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 mr-2 uppercase">البريد الإلكتروني</label>
            <div className="relative">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all text-left" placeholder="email@example.com" />
              <Mail size={18} className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 mr-2 uppercase">رقم الهاتف</label>
            <div className="relative">
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all text-left" placeholder="09xxxxxxxx" />
              <Phone size={18} className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 mr-2 uppercase">كلمة المرور</label>
            <div className="relative">
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all text-left" placeholder="••••••••" />
              <Lock size={18} className="absolute right-4 top-4 text-gray-400" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> تسجيل حساب التاجر</>}
          </button>
        </form>
      </div>
    </div>
  )
}