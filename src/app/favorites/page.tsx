import React from 'react'
import BottomNav from '@/components/BottomNav'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans flex flex-col items-center justify-center" dir="rtl">
      <div className="bg-emerald-50 p-6 rounded-full mb-4 text-emerald-600">
        <Heart size={48} className="fill-emerald-100" />
      </div>
      <h1 className="text-xl font-black text-gray-900 mb-2">قائمة المفضلة</h1>
      <p className="text-gray-500 font-bold text-sm text-center px-8">
        هنا ستظهر المطاعم والمخابز التي قمت بحفظها لتصل إليها بسرعة!
      </p>
      <BottomNav activeTab="tickets" />
    </div>
  )
}