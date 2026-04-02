'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Search, ShoppingCart, User, PlusCircle, Sparkles, BarChart3 } from 'lucide-react'

export default function BottomNav({ activeTab }: { activeTab?: string }) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role')
    setRole(savedRole)
  }, [])

  // إذا كان المستخدم "صاحب محل" (Merchant)
  if (role === 'merchant') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-[30px] shadow-2xl">
        <Link href="/profile" className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <BarChart3 size={22} />
          <span className="text-[10px] mt-1 font-bold">إحصائيات</span>
        </Link>
        <Link href="/impact" className={`flex flex-col items-center ${activeTab === 'impact' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <Sparkles size={22} />
          <span className="text-[10px] mt-1 font-bold">أثري</span>
        </Link>
        <Link href="/add" className="bg-emerald-600 text-white p-4 rounded-full -mt-12 shadow-lg shadow-emerald-200 border-4 border-white active:scale-90 transition-transform">
          <PlusCircle size={28} />
        </Link>
        <Link href="/profile" className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <User size={22} />
          <span className="text-[10px] mt-1 font-bold">حسابي</span>
        </Link>
      </div>
    )
  }

  // إذا كان "زبون" (Customer)
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 rounded-t-[30px]">
      <Link href="/" className={`flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <Home size={22} />
        <span className="text-[10px] mt-1 font-bold">الرئيسية</span>
      </Link>
      <Link href="/explore" className={`flex flex-col items-center ${activeTab === 'explore' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <Search size={22} />
        <span className="text-[10px] mt-1 font-bold">استكشف</span>
      </Link>
      <Link href="/impact" className={`flex flex-col items-center ${activeTab === 'impact' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <Sparkles size={22} />
        <span className="text-[10px] mt-1 font-bold">أثري</span>
      </Link>
      <Link href="/cart" className={`flex flex-col items-center ${activeTab === 'cart' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <ShoppingCart size={22} />
        <span className="text-[10px] mt-1 font-bold">السلة</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}>
        <User size={22} />
        <span className="text-[10px] mt-1 font-bold">حسابي</span>
      </Link>
    </div>
  )
}