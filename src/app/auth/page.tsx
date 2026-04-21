'use client'
import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, User, KeyRound, AlertCircle } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'customer' 
  
  const [view, setView] = useState<'login' | 'signup' | 'verify' | 'forgot' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('') 
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')

  // 1. نظام تسجيل الدخول الذكي (مع حل مشكلة الوميض) 🛠️
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      if (!authData.user) throw new Error('حدث خطأ في الخادم.')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_trusted')
        .eq('id', authData.user.id)
        .single()

      const userRole = profile?.role || 'customer'

      document.cookie = `user_role=${userRole}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('user_role', userRole);

      // 👑 الحل الجذري لمنع الوميض (Hard Redirect)
      if (userRole === 'merchant') {
        window.location.href = '/merchant-dashboard';
      } else if (userRole === 'super_admin') {
        window.location.href = '/master-panel';
      } else if (userRole === 'staff') {
        window.location.href = '/admin-panel';
      } else {
        window.location.href = '/';
      }

    } catch (error: any) {
      setErrorMsg(error.message)
      setLoading(false) 
    }
  }

  // 2. إنشاء حساب 
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (password !== confirmPassword) return setErrorMsg('كلمتا المرور غير متطابقتين!')
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role 
          }
        }
      })
      if (error) throw new Error('البريد الإلكتروني مسجل مسبقاً أو غير صالح.')
      
      setView('verify') 
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. توثيق الرمز
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })
      if (error) throw new Error('الكود غير صحيح أو منتهي الصلاحية.')
      window.location.href = '/' // Hard Redirect بعد التوثيق لضمان نظافة الجلسة
    } catch (error: any) {
      setErrorMsg(error.message)
      setLoading(false)
    } 
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setView('reset')
    } catch (error: any) {
      setErrorMsg('حدث خطأ، تأكد من صحة البريد الإلكتروني.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (password !== confirmPassword) return setErrorMsg('كلمتا المرور غير متطابقتين!')
    
    setLoading(true)
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' })
      if (otpError) throw new Error('كود الاستعادة غير صحيح.')

      const { error: updateError } = await supabase.auth.updateUser({ password: password })
      if (updateError) throw updateError

      alert('✅ تم تغيير كلمة المرور بنجاح!')
      setView('login')
      setPassword('')
      setConfirmPassword('')
      setOtp('')
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right font-sans flex flex-col" dir="rtl">
      <div className="p-6 pt-10">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-800 shadow-md active:scale-95 transition-transform border border-slate-100">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20 w-full max-w-md mx-auto">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200/50 rotate-3">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            {view === 'login' ? 'مرحباً بعودتك! 👋' : 
             view === 'signup' ? `إنشاء حساب ${role === 'merchant' ? 'تاجر' : 'جديد'} 🌟` :
             view === 'verify' ? 'تأكيد الحساب ✉️' :
             view === 'forgot' ? 'استعادة الوصول 🔐' : 'كلمة مرور جديدة 🔑'}
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            {view === 'login' ? 'سجل دخولك لمتابعة إنقاذ الوجبات اللذيذة' : 
             view === 'signup' ? 'يرجى إدخال بياناتك الصحيحة لضمان جودة الخدمة' :
             view === 'verify' ? `أدخل الكود المكون من 6 أرقام المرسل إلى ${email}` :
             view === 'forgot' ? 'أدخل بريدك الإلكتروني لنرسل لك كود الاستعادة' : 'أدخل الكود المرسل وكلمة المرور الجديدة'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl mb-6 text-sm font-black flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="flex-shrink-0" /> {errorMsg}
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-8">
          
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="password" required placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="text-left">
                <button type="button" onClick={() => {setView('forgot'); setErrorMsg('');}} className="text-sm font-black text-emerald-600 hover:text-emerald-800 transition-colors">نسيت كلمة المرور؟</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <User className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="text" required placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" />
              </div>
              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="password" required minLength={6} placeholder="كلمة المرور (6 أحرف على الأقل)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="password" required minLength={6} placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-white border-2 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:outline-none transition-all shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`} dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2">
                {loading ? <Loader2 className="animate-spin" /> : 'متابعة لإنشاء الحساب'}
              </button>
            </form>
          )}

          {view === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="text" required maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 text-center tracking-[1em] font-black text-xl focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : 'تأكيد الرمز 🚀'}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="email" required placeholder="أدخل بريدك الإلكتروني المعتمد" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : 'إرسال كود التحقق'}
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="text" required maxLength={6} placeholder="كود التحقق المرسل" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 text-center tracking-[0.5em] font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="password" required minLength={6} placeholder="كلمة المرور الجديدة" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-slate-400" />
                <input type="password" required minLength={6} placeholder="تأكيد كلمة المرور الجديدة" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pr-12 pl-4 text-slate-900 font-black focus:border-emerald-500 focus:outline-none transition-all shadow-sm" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : 'تحديث البيانات'}
              </button>
            </form>
          )}
        </div>

        {(view === 'login' || view === 'signup') && (
          <div className="mt-8 text-center animate-in fade-in">
            <p className="text-slate-500 font-bold text-sm">
              {view === 'login' ? 'ليس لديك حساب بعد؟' : 'لديك حساب مسجل؟'}
              <button 
                onClick={() => {setView(view === 'login' ? 'signup' : 'login'); setErrorMsg('');}} 
                className="text-emerald-600 font-black mr-2 hover:text-emerald-800 transition-colors"
                type="button"
              >
                {view === 'login' ? 'أنشئ حسابك الآن' : 'سجل الدخول من هنا'}
              </button>
            </p>
          </div>
        )}
        
        {(view === 'verify' || view === 'forgot' || view === 'reset') && (
          <div className="mt-6 text-center">
            <button onClick={() => {setView('login'); setErrorMsg('');}} className="text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors">العودة لتسجيل الدخول</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>}>
      <AuthContent />
    </Suspense>
  )
}