'use client'
import React, { useState } from 'react'
import { Search, Map as MapIcon, List, SlidersHorizontal } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function BrowsePage() {
  const [view, setView] = useState<'map' | 'list'>('map')

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-right" dir="rtl">
      
      {/* الهيدر وشريط البحث */}
      <div className="bg-white px-4 pt-10 pb-4 sticky top-0 z-20 shadow-sm rounded-b-3xl">
        <div className="flex gap-2 mb-4">
          <button className="bg-gray-50 p-3 rounded-2xl text-emerald-700 border border-gray-100 active:scale-95 transition-transform">
            <SlidersHorizontal size={22} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن مطعم، مقهى، أو مخبز..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
            <Search size={20} className="absolute right-4 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* زر التبديل بين خريطة وقائمة */}
        <div className="flex bg-gray-100 rounded-2xl p-1 relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-800 rounded-xl transition-all duration-300 ease-in-out shadow-sm ${
              view === 'map' ? 'right-1' : 'right-[calc(50%+3px)]'
            }`}
          ></div>
          <button onClick={() => setView('map')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'map' ? 'text-white' : 'text-gray-500'}`}>
            <MapIcon size={18} /> الخريطة
          </button>
          <button onClick={() => setView('list')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'list' ? 'text-white' : 'text-gray-500'}`}>
            <List size={18} /> القائمة
          </button>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div className="h-[calc(100vh-220px)] w-full">
        {view === 'map' ? (
          <div className="relative w-full h-full bg-emerald-50 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
            <div className="absolute top-[30%] right-[25%] bg-emerald-800 text-white w-12 h-12 rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-xl">5</div>
            <div className="absolute top-[50%] right-[60%] bg-emerald-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-xl">2</div>
            <div className="absolute top-[45%] right-[40%] w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-md relative">
               <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-center font-bold text-gray-500 mt-10">سيتم عرض قائمة المطاعم هنا.</p>
          </div>
        )}
      </div>

      <BottomNav activeTab="browse" />
    </div>
  )
}