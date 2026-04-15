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
    
    // 1. السماح بمرور المسارات العامة (الترحيب والدخول)
    if (pathname === '/welcome' || pathname.startsWith('/auth')) {
      setLoading(false)
      return
    }

    // 2. إذا لم يكن مسجلاً، وجهه لصفحة الترحيب
    if (!user) {
      router.replace('/welcome')
      return
    }

    // 3. جلب صلاحية المستخدم الحالية من قاعدة البيانات
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // ==========================================
    // 4. قوانين الدخول الصارمة (النسخة الإدارية)
    // ==========================================

    // أ. حماية مسارات الإدارة (حصرية للأدمن فقط)
    if (pathname.startsWith('/admin') && role !== 'admin') {
      router.replace('/')
      return
    }

    // ب. حماية مسارات التاجر (للتاجر + الأدمن)
    // أضفنا مسار /add-meal لحمايته أيضاً من الزبائن العاديين
    const isMerchantRoute = pathname.startsWith('/merchant') || pathname.startsWith('/add-meal');
    
    if (isMerchantRoute && role !== 'merchant' && role !== 'admin') {
      router.replace('/') // طرد الزبون، والسماح للتاجر وللمدير
      return
    }

    // إذا تجاوز كل الفحوصات بنجاح، اسمح له بالدخول
    setLoading(false)
  }

  // شاشة التحميل الأنيقة أثناء الفحص
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-emerald-600">
        <Loader2 className="animate-spin w-12 h-12 mb-3 shadow-sm rounded-full" />
        <span className="text-sm font-black italic tracking-wide">جاري التحقق من الصلاحيات الأمنية... 🛡️</span>
      </div>
    )
  }

  return <>{children}</>
}