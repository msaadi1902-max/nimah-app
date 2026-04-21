'use client'
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, AlertTriangle } from 'lucide-react'

// ربط قاعدة البيانات
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
      // 1. محاولة تسجيل الدخول
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error('البيانات غير صحيحة. يرجى التأكد من البريد وكلمة المرور.')
      if (!authData.user) throw new Error('حدث خطأ غير متوقع في خوادم المصادقة.')

      // 2. التحقق الصارم من الرتبة (الصلاحيات)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) throw new Error('لا يمكن قراءة ملف الصلاحيات الخاص بك.')

      // 3. تخزين الهوية أمنياً (Cookie & LocalStorage) لضمان عدم الخروج المفاجئ
      document.cookie = `user_role=${profile.role}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('user_role', profile.role);

      // 4. التوجيه الإداري الذكي
      if (profile.role === 'super_admin') {
        router.push('/master-panel') // 👑 نقل المدير العام للوحة القيادة
      } else if (profile.role === 'staff') {
        router.push('/admin-panel') // 🛡️ نقل الموظف للوحة المراقبة
      } else {
        // 🚫 طرد أي زبون أو تاجر يحاول الدخول من البوابة السرية
        await supabase.auth.signOut()
        document.cookie = 'user_role=; Max-Age=0; path=/;'; // مسح الكوكي
        localStorage.removeItem('user_role');
        throw new Error('🚫 اختراق مرفوض: هذه البوابة مخصصة للإدارة العليا والموظفين فقط.')
      }

    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-right font-sans relative overflow-hidden" dir="rtl">
      
      {/* تأثيرات إضاءة سينمائية للخلفية */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* زر العودة للموقع */}
        <button onClick={() => router.push('/')} className="mb-8 text-slate-500 hover:text-white flex items-center gap-2 transition-colors font-bold text-sm bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <ArrowRight size={16} /> العودة للواجهة الرئيسية
        </button>

        <div className="bg-slate-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* شريط علوي للزينة */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[25px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">القيادة المركزية</h1>
          <p className="text-slate-400 text-sm font-bold text-center mb-8 uppercase tracking-widest">NIMAH SYSTEM ADMIN</p>

          {/* عرض الأخطاء إن وجدت */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl mb-6 text-sm font-black text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase mr-2">معرف المسؤول (Email)</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nimah.com" 
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl p-4 pr-12 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                  dir="ltr"
                />
                <Mail size={20} className="absolute right-4 top-4 text-slate-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase mr-2">رمز العبور (Password)</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-700 rounded-2xl p-4 pr-12 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium tracking-widest"
                  dir="ltr"
                />
                <Lock size={20} className="absolute right-4 top-4 text-slate-600" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50 mt-8"
            >
              {loading ? <Loader2 className="animate-spin text-slate-900" /> : 'مصادقة الدخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}