'use client'
import React, { useEffect, useState } from 'react'
import { Home, Search, Ticket, User, Store, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    setRole(userRole)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('user_role')
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/welcome') 
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
      
      {/* الرئيسية */}
      <button onClick={() => router.push('/')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <Home size={22} />
        <span className="text-[10px] font-bold mt-1">الرئيسية</span>
      </button>

      {/* تصفح */}
      <button onClick={() => router.push('/browse')} className={`flex flex-col items-center ${activeTab === 'browse' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <Search size={22} />
        <span className="text-[10px] font-bold mt-1">تصفح</span>
      </button>

      {/* تذاكري - المسار الصحيح هو /tickets */}
      {role === 'customer' && (
        <button onClick={() => router.push('/tickets')} className={`flex flex-col items-center ${activeTab === 'tickets' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <Ticket size={22} />
          <span className="text-[10px] font-bold mt-1">تذاكري</span>
        </button>
      )}

      {/* التاجر - المسار الصحيح حسب ملفاتك هو /merchant */}
      {role === 'merchant' && (
        <button onClick={() => router.push('/merchant')} className={`flex flex-col items-center ${activeTab === 'merchant' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <Store size={22} />
          <span className="text-[10px] font-bold mt-1">التاجر</span>
        </button>
      )}

      {/* حسابي - المسار الصحيح هو /profile */}
      <button onClick={() => router.push('/profile')} className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <User size={22} />
        <span className="text-[10px] font-bold mt-1">حسابي</span>
      </button>

      <button onClick={handleLogout} className="flex flex-col items-center text-rose-400 opacity-70">
        <LogOut size={20} />
        <span className="text-[10px] font-bold mt-1">خروج</span>
      </button>
    </div>
  )
}