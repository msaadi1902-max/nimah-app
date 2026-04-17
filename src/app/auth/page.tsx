'use client'
import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, User, MapPin, KeyRound } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// مكون المحتوى الرئيسي (مغلف بـ Suspense ليتوافق مع Next.js)
function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'customer' // جلب نوع الحساب من الرابط
  
  // حالات الواجهة: login | signup | verify | forgot | reset
  const [view, setView] = useState<'login' | 'signup' | 'verify' | 'forgot' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  
  // بيانات النموذج
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [otp, setOtp] = useState('')

  // 1. تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      alert('✅ تم تسجيل الدخول بنجاح! أهلاً بك في نِعمة.')
      router.push('/')
    } catch (error: any) {
      alert('❌ فشل تسجيل الدخول: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. إنشاء حساب جديد
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return alert('❌ كلمتا المرور غير متطابقتين!')
    if (role === 'merchant' && !address.trim()) return alert('❌ يرجى إدخال عنوان المتجر!')
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            address: address,
            role: role
          }
        }
      })
      if (error) throw error
      alert('📩 تم إرسال كود التفعيل إلى بريدك الإلكتروني.')
      setView('verify') // الانتقال لشاشة التأكيد
    } catch (error: any) {
      alert('❌ خطأ في إنشاء الحساب: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. تأكيد رمز الإيميل (OTP)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })
      if (error) throw error
      alert('🎉 تم توثيق حسابك بنجاح!')
      router.push('/')
    } catch (error: any) {
      alert('❌ الكود غير صحيح أو منتهي الصلاحية: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. طلب استعادة كلمة المرور
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      alert('📩 تم إرسال كود الاستعادة إلى بريدك.')
      setView('reset') // الانتقال لشاشة تغيير الرمز
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 5. تعيين كلمة المرور الجديدة
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return alert('❌ كلمتا المرور غير متطابقتين!')
    
    setLoading(true)
    try {
      // أولاً نتأكد من الكود
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' })
      if (otpError) throw otpError

      // ثانياً نحدث كلمة المرور
      const { error: updateError } = await supabase.auth.updateUser({ password: password })
      if (updateError) throw updateError

      alert('✅ تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.')
      setView('login')
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      alert('❌ فشل تغيير كلمة المرور: ' + error.message)
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
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4">
          <div className="w-20 h-20 bg-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 rotate-12">
            <ShieldCheck size={40} className="text-white -rotate-12" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {view === 'login' ? 'مرحباً بعودتك! 👋' : 
             view === 'signup' ? `إنشاء حساب ${role === 'merchant' ? 'تاجر' : 'زبون'} 🌟` :
             view === 'verify' ? 'تأكيد البريد الإلكتروني ✉️' :
             view === 'forgot' ? 'استعادة كلمة المرور 🔐' : 'تعيين كلمة مرور جديدة 🔑'}
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-2">
            {view === 'login' ? 'سجل دخولك لمتابعة إنقاذ الوجبات اللذيذة' : 
             view === 'signup' ? 'يرجى إدخال بياناتك الصحيحة لضمان جودة الخدمة' :
             view === 'verify' ? `أدخل الكود المكون من 6 أرقام المرسل إلى ${email}` :
             view === 'forgot' ? 'أدخل بريدك الإلكتروني لنرسل لك كود الاستعادة' : 'أدخل الكود المرسل وكلمة المرور الجديدة'}
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8">
          {/* ================= شاشة تسجيل الدخول ================= */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="password" required placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              <div className="text-left">
                <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">نسيت كلمة المرور؟</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* ================= شاشة إنشاء حساب ================= */}
          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <User className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="text" required placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              
              <div className="relative">
                <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="text" required={role === 'merchant'} placeholder={role === 'merchant' ? "عنوان المتجر (إلزامي)" : "العنوان (اختياري)"} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>

              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="password" required minLength={6} placeholder="كلمة المرور (6 أحرف على الأقل)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="password" required minLength={6} placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-white border-2 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:outline-none shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-gray-100 focus:border-emerald-600'}`} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'إنشاء حساب'}
              </button>
            </form>
          )}

          {/* ================= شاشة تأكيد الإيميل (OTP) ================= */}
          {view === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="text" required maxLength={6} placeholder="كود التفعيل (6 أرقام)" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 text-center tracking-[0.5em] font-black focus:border-emerald-600 focus:outline-none shadow-sm" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'تأكيد الحساب 🚀'}
              </button>
            </form>
          )}

          {/* ================= شاشة طلب استعادة كلمة المرور ================= */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="email" required placeholder="أدخل بريدك الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'إرسال كود الاستعادة'}
              </button>
            </form>
          )}

          {/* ================= شاشة تعيين كلمة المرور الجديدة ================= */}
          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="text" required maxLength={6} placeholder="كود الاستعادة المرسل للإيميل" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 text-center tracking-[0.5em] font-black focus:border-emerald-600 focus:outline-none shadow-sm" dir="ltr" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="password" required minLength={6} placeholder="كلمة المرور الجديدة" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                <input type="password" required minLength={6} placeholder="تأكيد كلمة المرور الجديدة" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : 'حفظ وتسجيل الدخول'}
              </button>
            </form>
          )}

        </div>

        {/* أزرار التبديل السفلية */}
        {(view === 'login' || view === 'signup') && (
          <div className="mt-8 text-center animate-in fade-in">
            <p className="text-gray-500 font-bold text-sm">
              {view === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
              <button 
                onClick={() => setView(view === 'login' ? 'signup' : 'login')} 
                className="text-emerald-700 font-black mr-2 hover:underline"
                type="button"
              >
                {view === 'login' ? 'سجل الآن' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        )}
        
        {/* زر العودة لتسجيل الدخول من الشاشات الأخرى */}
        {(view === 'verify' || view === 'forgot' || view === 'reset') && (
          <div className="mt-6 text-center">
            <button onClick={() => setView('login')} className="text-gray-500 font-bold text-xs hover:text-emerald-600">العودة لتسجيل الدخول</button>
          </div>
        )}
      </div>
    </div>
  )
}

// تغليف المكون الرئيسي بـ Suspense لضمان التوافق التام مع Next.js App Router
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>}>
      <AuthContent />
    </Suspense>
  )
}