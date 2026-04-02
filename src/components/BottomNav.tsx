'use client'
import React from 'react'
import Link from 'next/link'
import { Home, Search, Sparkles, ShoppingBag, User } from 'lucide-react'

// تعريف الواجهة لتحديد الزر النشط
interface BottomNavProps {
  activeTab: 'home' | 'browse' | 'impact' | 'cart' | 'profile'
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]" dir="rtl">
      
      {/* 1. الرئيسية (العروض) */}
      <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home size={24} className={activeTab === 'home' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </Link>

      {/* 2. البحث والخريطة */}
      <Link href="/browse" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'browse' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <Search size={24} className={activeTab === 'browse' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">تصفح</span>
      </Link>

      {/* 3. أثري */}
      <Link href="/impact" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'impact' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <Sparkles size={24} className={activeTab === 'impact' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">أثري</span>
      </Link>

      {/* 4. السلة */}
      <Link href="/cart" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'cart' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <ShoppingBag size={24} className={activeTab === 'cart' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">السلة</span>
      </Link>

      {/* 5. حسابي (البروفايل) */}
      <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
        <User size={24} className={activeTab === 'profile' ? 'fill-emerald-100' : ''} />
        <span className="text-[10px] font-bold">حسابي</span>
      </Link>

    </div>
  )
}