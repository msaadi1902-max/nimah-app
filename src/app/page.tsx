'use client'
import React from 'react'
import Link from 'next/link'
import { MapPin, Heart, Star, ChevronDown, Search } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// بيانات وهمية للتجربة (سنربطها بقاعدة البيانات لاحقاً)
const MOCK_MEALS = [
  {
    id: 1,
    restaurantName: 'مخبز الأمل',
    type: 'صندوق مفاجآت',
    rating: 4.8,
    distance: '850 م',
    time: 'اليوم: 08:00 م - 10:00 م',
    newPrice: '2.99',
    oldPrice: '10.00',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=أمل&background=10b981&color=fff',
    isNew: true,
  },
  {
    id: 2,
    restaurantName: 'مطعم دمشق العريق',
    type: 'وجبات عشاء',
    rating: 4.2,
    distance: '1.2 كم',
    time: 'اليوم: 09:30 م - 11:00 م',
    newPrice: '4.50',
    oldPrice: '15.00',
    image: 'https://images.unsplash.com/photo-1544025162-831514dfbbda?q=80&w=800&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=دمشق&background=047857&color=fff',
    isNew: false,
    leftCount: 2,
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 1. الهيدر (الموقع الجغرافي) */}
      <div className="bg-white pt-10 pb-4 px-6 sticky top-0 z-10 shadow-sm">
        <Link href="/browse" className="flex items-center justify-center gap-1 text-gray-900 active:scale-95 transition-transform">
          <ChevronDown size={18} className="text-gray-400" />
          <span className="font-black text-base">الموقع الحالي</span>
          <span className="text-gray-500 text-sm">دمشق، الميدان</span>
          <MapPin size={16} className="text-emerald-600 mr-1" />
        </Link>
      </div>

      {/* 2. شريط الأقسام (التصنيفات) */}
      <div className="bg-white px-4 pb-4 border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar">
        <button className="bg-emerald-800 text-white px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">الكل</button>
        <button className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">وجبات</button>
        <button className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">مخابز وحلويات</button>
        <button className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">بقالة</button>
      </div>

      {/* 3. العروض (البطاقات) */}
      <div className="p-4 space-y-6 mt-2">
        <div className="flex justify-between items-center mb-2">
          <Link href="/browse" className="text-emerald-700 font-bold text-sm">عرض الكل</Link>
          <h2 className="text-xl font-black text-gray-900">أفضل اللقطات بقربك</h2>
        </div>

        {MOCK_MEALS.map((meal) => (
          // يتم توجيه الزبون لصفحة تفاصيل المطعم عند الضغط على البطاقة (سنبرمجها لاحقاً)
          <div key={meal.id} className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow">
            
            {/* صورة العرض والعناصر فوقها */}
            <div className="relative h-44 bg-gray-200 w-full">
              <img src={meal.image} alt={meal.restaurantName} className="w-full h-full object-cover" />
              
              {/* شريط التقييم */}
              <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Star size={14} className="fill-emerald-600 text-emerald-600" />
                <span className="font-black text-xs text-gray-900">{meal.rating}</span>
              </div>

              {/* شارات إضافية (جديد / العدد المتبقي) */}
              {meal.isNew && (
                <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded-lg shadow-sm font-black text-xs text-gray-900">
                  جديد
                </div>
              )}
              {meal.leftCount && (
                <div className="absolute top-3 left-3 bg-amber-100 px-2 py-1 rounded-lg shadow-sm font-black text-xs text-amber-800">
                  باقي {meal.leftCount}
                </div>
              )}

              {/* لوغو المطعم */}
              <div className="absolute -bottom-5 left-4 w-12 h-12 bg-white rounded-full border-2 border-white shadow-md overflow-hidden z-10">
                <img src={meal.logo} alt="logo" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* تفاصيل البطاقة السفلية */}
            <div className="p-4 pt-4">
              <div className="flex justify-between items-start mb-1">
                <div className="pl-14"> {/* مساحة للوغو */}
                  <h3 className="font-black text-lg text-gray-900 leading-tight">{meal.restaurantName}</h3>
                  <p className="text-gray-500 text-sm font-bold">{meal.type}</p>
                </div>
                <button className="text-emerald-700 bg-emerald-50 p-2 rounded-full">
                  <Heart size={20} />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 border-dashed flex justify-between items-center">
                <p className="text-xs text-gray-500 font-bold">{meal.time}</p>
                <span className="text-gray-400 text-xs font-bold">{meal.distance}</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-black text-xl text-emerald-800">{meal.newPrice} €</span>
                <span className="text-gray-400 line-through text-sm font-bold">{meal.oldPrice} €</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}