'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      // 1. تسجيل الخروج من قاعدة البيانات
      await supabase.auth.signOut()
      
      // 2. تدمير بطاقة الهوية (الكوكيز)
      document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 3. مسح الذاكرة المحلية
      localStorage.removeItem('user_role')
      
      // 4. التوجيه الفوري لشاشة الترحيب
      router.replace('/welcome')
    }
    
    performLogout()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-500">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <h2 className="text-xl font-black text-white">جاري تسجيل الخروج بأمان...</h2>
    </div>
  )
}