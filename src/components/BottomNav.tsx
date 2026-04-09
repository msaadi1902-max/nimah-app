'use client'
import React from 'react'
import Link from 'next/link'
import { Home, Search, LayoutDashboard, Ticket, User } from 'lucide-react'

// أضفنا "favorites" هنا فقط لمنع الخطأ البرمجي من الظهور في الملفات القديمة
interface BottomNavProps {
  activeTab: 'home' | 'browse' | 'merchant' | 'tickets' | 'profile' | 'favorites'
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]" dir="rtl">
      
      <Link href="/" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'home' ? 'text-emerald-800' : 'text-gray-400'}`}>
        <Home size={24} className={activeTab === 'home' ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-black">الرئيسية</span>
      </Link>

      <Link href="/browse" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'browse' ? 'text-emerald-800' : 'text-gray-400'}`}>
        <Search size={24} className={activeTab === 'browse' ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-black">تصفح</span>
      </Link>

      <Link href="/merchant" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'merchant' ? 'text-emerald-800' : 'text-gray-400'}`}>
        <LayoutDashboard size={24} className={activeTab === 'merchant' ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-black">التاجر</span>
      </Link>

      <Link href="/tickets" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'tickets' ? 'text-emerald-800' : 'text-gray-400'}`}>
        <Ticket size={24} className={activeTab === 'tickets' ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-black">تذاكري</span>
      </Link>

      <Link href="/profile" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'profile' ? 'text-emerald-800' : 'text-gray-400'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-black">حسابي</span>
      </Link>

    </div>
  )
}