'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ShieldAlert, Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminPortal() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 🌟 التحقق التلقائي الذكي: إذا كان المدير مسجلاً بالفعل، لا داعي لتسجيل الدخول مرة أخرى
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (data?.role === 'super_admin') router.replace('/master-panel')
        if (data?.role === 'staff') router.replace('/staff-panel')
      }
    }
    checkSession()
  }, [router])

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

      if (authError) throw authError
      if (!authData.user) throw new Error("فشل تسجيل الدخول")

      // 2. التحقق من الرتبة (الصلاحيات)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      const role = profileData?.role

      // 3. التوجيه الذكي حسب الرتبة
      if (role === 'super_admin') {
        document.cookie = "user_role=super_admin; path=/;";
        localStorage.setItem('user_role', 'super_admin');
        alert('👑 أهلاً بك سيدي المدير.')
        router.push('/master-panel')
      } 
      else if (role === 'staff') {
        document.cookie = "user_role=staff; path=/;";
        localStorage.setItem('user_role', 'staff');
        alert('🛠️ أهلاً بك في لوحة الموظفين.')
        router.push('/staff-panel')
      } 
      else {
        // طرد الزبائن والتجار من هذه البوابة
        await supabase.auth.signOut()
        throw new Error("عذراً، هذه البوابة مخصصة للإدارة والموظفين فقط. تم تسجيل خروجك.")
      }

    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 font-sans text-right" dir="rtl">
      
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700">
            <ShieldAlert size={40} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">بوابة النظام السرية</h1>
          <p className="text-sm text-slate-400 font-bold">تسجيل الدخول المخصص للإدارة والموظفين</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-900/30 border border-rose-800 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5 relative z-10">
          <div className="relative group">
            <Mail className="absolute right-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="email" 
              required 
              placeholder="البريد الإلكتروني الإداري" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pr-12 pl-4 text-white font-black focus:border-rose-500 focus:outline-none transition-colors" 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="كلمة المرور" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pr-12 pl-12 text-white font-black focus:border-rose-500 focus:outline-none transition-colors" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-4 text-slate-500 hover:text-rose-400 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black text-lg mt-4 shadow-lg shadow-rose-900/50 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'دخول آمن'}
          </button>
        </form>

        <button onClick={() => router.push('/')} className="mt-8 text-slate-500 hover:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 w-full transition-colors">
           العودة للموقع العام <ArrowLeft size={14}/>
        </button>
      </div>
    </div>
  )
}