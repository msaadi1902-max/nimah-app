'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

// الاتصال بقاعدة البيانات
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        alert('✅ تم تسجيل الدخول بنجاح! أهلاً بك في نِعمة.')
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('🎉 تم إنشاء حسابك بنجاح! يمكنك الآن إنقاذ الوجبات.')
        router.push('/')
      }
    } catch (error: any) {
      alert('❌ عذراً: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 text-right font-sans flex flex-col" dir="rtl">
      <div className="p-6 pt-10">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-800 shadow-sm active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 rotate-12">
            <ShieldCheck size={40} className="text-white -rotate-12" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isLogin ? 'مرحباً بعودتك! 👋' : 'انضم إلى نِعمة 🌟'}
          </h1>
          <p className="text-gray-500 font-bold text-sm">
            {isLogin ? 'سجل دخولك لمتابعة إنقاذ الوجبات اللذيذة' : 'أنشئ حسابك الآن وابدأ التوفير مع كل وجبة'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              placeholder="البريد الإلكتروني"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg mt-4 shadow-xl shadow-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'دخول' : 'إنشاء حساب')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 font-bold text-sm">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-emerald-700 font-black mr-2 hover:underline"
              type="button"
            >
              {isLogin ? 'سجل الآن' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}