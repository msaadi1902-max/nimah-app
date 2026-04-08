'use client'
import React from 'react'
import Link from 'next/link'
import { Home, Search, Sparkles, Heart, User } from 'lucide-react'

// تم تغيير cart إلى favorites
interface BottomNavProps {
  activeTab: 'home' | 'browse' | 'impact' | 'favorites' | 'profile'
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50" dir="rtl">
      
      <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-emerald-700' : 'text-gray-400'}`}>
        <Home size={24} className={activeTab === 'home' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </Link>

      <Link href="/browse" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'browse' ? 'text-emerald-700' : 'text-gray-400'}`}>
        <Search size={24} className={activeTab === 'browse' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">تصفح</span>
      </Link>

      <Link href="/impact" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'impact' ? 'text-emerald-700' : 'text-gray-400'}`}>
        <Sparkles size={24} className={activeTab === 'impact' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">أثري</span>
      </Link>

      {/* زر المفضلة الجديد */}
      <Link href="/favorites" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'favorites' ? 'text-emerald-700' : 'text-gray-400'}`}>
        <Heart size={24} className={activeTab === 'favorites' ? 'fill-emerald-100 text-emerald-700' : ''} />
        <span className="text-[10px] font-bold">المفضلة</span>
      </Link>

      <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-700' : 'text-gray-400'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">حسابي</span>
      </Link>

    </div>
  )
}