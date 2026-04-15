'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function UserRoleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [pathname])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. السماح بالمسارات العامة (ترحيب، تسجيل دخول، إلخ)
    if (pathname === '/welcome' || pathname.startsWith('/auth')) {
      setLoading(false)
      return
    }

    // 2. إذا لم يكن هناك جلسة دخول، التوجه لصفحة الترحيب
    if (!user) {
      router.replace('/welcome')
      return
    }

    // 3. جلب رتبة المستخدم الحقيقية من قاعدة البيانات
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // ==========================================
    // 4. منطق الصلاحيات المطور (RBAC)
    // ==========================================

    // أ. حماية لوحة المدير العام (Super Admin فقط)
    if (pathname.startsWith('/master-panel') && role !== 'super_admin') {
      router.replace('/')
      return
    }

    // ب. حماية لوحة الموظفين (Staff + Super Admin)
    if (pathname.startsWith('/staff-panel') && role !== 'staff' && role !== 'super_admin') {
      router.replace('/')
      return
    }

    // ج. حماية مسارات الإدارة القديمة (Admin + Staff + Super Admin)
    if (pathname.startsWith('/admin') && !['admin', 'staff', 'super_admin'].includes(role)) {
      router.replace('/')
      return
    }

    // د. حماية مسارات التاجر (Merchant + Super Admin للرقابة)
    const isMerchantRoute = pathname.startsWith('/merchant') || pathname.startsWith('/add-meal')
    if (isMerchantRoute && role !== 'merchant' && role !== 'super_admin') {
      router.replace('/')
      return
    }

    // تم التحقق من كل شيء بنجاح
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-emerald-400">
        <Loader2 className="animate-spin w-12 h-12 mb-3 shadow-[0_0_15px_rgba(52,211,153,0.3)] rounded-full" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-black uppercase tracking-widest italic">نظام الحماية النشط</span>
          <span className="text-[10px] text-gray-400">جاري فحص رتبة المستخدم والوصول...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}