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
    
    // 1. إذا كان في صفحات الترحيب أو الدخول، اتركه يكمل
    if (pathname === '/welcome' || pathname.startsWith('/auth')) {
      setLoading(false)
      return
    }

    // 2. إذا لم يكن مسجلاً، وجهه لصفحة الترحيب
    if (!user) {
      router.replace('/welcome')
      return
    }

    // 3. جلب صلاحية المستخدم من قاعدة البيانات
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // 4. قوانين الدخول الصارمة
    if (pathname.startsWith('/admin') && role !== 'admin') {
      router.replace('/') // منع غير الأدمن من دخول صفحات الإدارة
      return
    }

    if (pathname.startsWith('/merchant') && role !== 'merchant') {
      router.replace('/') // منع غير التاجر من دخول صفحات التجار
      return
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-emerald-600">
        <Loader2 className="animate-spin w-10 h-10 mb-2" />
        <span className="text-xs font-black italic">جاري التحقق من الصلاحيات...</span>
      </div>
    )
  }

  return <>{children}</>
}