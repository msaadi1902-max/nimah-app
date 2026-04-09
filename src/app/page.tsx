'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { MapPin, Heart, Star, ChevronDown } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// الاتصال بقاعدة البيانات
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('id', { ascending: false }) // عرض الأحدث أولاً
    
    if (data) setMeals(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 1. الهيدر */}
      <div className="bg-white pt-10 pb-4 px-6 sticky top-0 z-10 shadow-sm">
        <Link href="/browse" className="flex items-center justify-center gap-1 text-gray-900 active:scale-95 transition-transform">
          <ChevronDown size={18} className="text-gray-400" />
          <span className="font-black text-base">الموقع الحالي</span>
          <span className="text-gray-500 text-sm">فيينا، النمسا</span>
          <MapPin size={16} className="text-emerald-600 mr-1" />
        </Link>
      </div>

      {/* 2. شريط الأقسام */}
      <div className="bg-white px-4 pb-4 border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar">
        <button className="bg-emerald-800 text-white px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">الكل</button>
        <button className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">وجبات</button>
        <button className="bg-emerald-50 text-emerald-800 px-5 py-2 rounded-full text-sm font-black whitespace-nowrap">مخابز وحلويات</button>
      </div>

      {/* 3. العروض الحقيقية من قاعدة البيانات */}
      <div className="p-4 space-y-6 mt-2">
        <div className="flex justify-between items-center mb-2">
          <Link href="/browse" className="text-emerald-700 font-bold text-sm">عرض الكل</Link>
          <h2 className="text-xl font-black text-gray-900">أفضل اللقطات بقربك</h2>
        </div>

        {loading ? (
          <div className="text-center font-bold text-emerald-700 py-10 animate-pulse">
            جاري البحث عن العروض اللذيذة... 🍕
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-4">
            <p className="text-gray-500 font-bold mb-4">لا توجد عروض حالياً، كن أول من ينقذ وجبة!</p>
            <Link href="/merchant-dashboard" className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-black text-sm">
              أضف عرضاً كتاجر
            </Link>
          </div>
        ) : (
          meals.map((meal) => (
            // تحويل الزبون لصفحة تفاصيل الوجبة عند الضغط
            <Link href={`/offer/${meal.id}`} key={meal.id} className="block bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow mb-6">
              
              <div className="relative h-44 w-full bg-emerald-50 flex items-center justify-center">
                {/* صورة مؤقتة حتى نبرمج رفع الصور */}
                <img 
  src={meal.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop"} 
  alt={meal.name} 
  className="w-full h-full object-cover" 
/>
                <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star size={14} className="fill-emerald-600 text-emerald-600" />
                  <span className="font-black text-xs text-gray-900">4.5</span>
                </div>

                {meal.quantity && (
                  <div className="absolute top-3 left-3 bg-amber-100 px-2 py-1 rounded-lg shadow-sm font-black text-xs text-amber-800">
                    باقي {meal.quantity}
                  </div>
                )}
              </div>

              <div className="p-4 pt-4">
                <div className="flex justify-between items-start mb-1">
                  <div> 
                    <h3 className="font-black text-lg text-gray-900 leading-tight">{meal.name}</h3>
                    <p className="text-gray-500 text-sm font-bold">صندوق مفاجآت</p>
                  </div>
                  <button className="text-emerald-700 bg-emerald-50 p-2 rounded-full">
                    <Heart size={20} />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 border-dashed flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{meal.pickup_time}</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="font-black text-xl text-emerald-800">{meal.discounted_price} €</span>
                  <span className="text-gray-400 line-through text-sm font-bold">{meal.original_price} €</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}