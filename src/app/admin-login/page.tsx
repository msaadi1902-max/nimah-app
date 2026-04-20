'use client'
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // 1. تسجيل الدخول
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      if (!authData.user) throw new Error('حدث خطأ غير متوقع.')

      // 2. التحقق من الرتبة (الصلاحيات)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw new Error('لا يمكن التحقق من الصلاحيات.')

      // 3. التوجيه الذكي أو الرفض
      if (profile.role === 'super_admin') {
        router.push('/master-panel') // توجيه المدير العام
      } else if (profile.role === 'staff') {
        router.push('/admin-panel') // توجيه الموظف
      } else {
        // إذا حاول زبون أو تاجر الدخول من هنا، يتم طرده!
        await supabase.auth.signOut()
        throw new Error('🚫 عذراً، هذه البوابة مخصصة للإدارة والموظفين فقط.')
      }

    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-right font-sans" dir="rtl">
      
      {/* تأثيرات الإضاءة في الخلفية */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <button onClick={() => router.push('/')} className="mb-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowRight size={18} /> العودة للموقع
        </button>

        <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[40px] border border-slate-700 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-black text-white text-center mb-2">بوابة الإدارة</h1>
          <p className="text-slate-400 text-sm font-bold text-center mb-8">النظام الداخلي لموظفي نِعمة</p>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني المؤسسي" 
                className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl p-4 pr-12 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                dir="ltr"
              />
              <Mail size={20} className="absolute right-4 top-4 text-slate-500" />
            </div>

            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور" 
                className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-2xl p-4 pr-12 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                dir="ltr"
              />
              <Lock size={20} className="absolute right-4 top-4 text-slate-500" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول الآمن'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}