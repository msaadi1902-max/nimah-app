'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { MapPin, Heart, Star, ChevronDown, Clock, ShoppingBag } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HomePage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMeals = async () => {
    const { data } = await supabase.from('meals').select('*').order('id', { ascending: false })
    if (data) setMeals(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMeals()
    const channel = supabase.channel('realtime-meals').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'meals' }, () => fetchMeals()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right font-sans" dir="rtl">
      
      {/* هيدر الموقع */}
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
            <ShoppingBag size={20} />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-black">الموقع الحالي</p>
            <div className="flex items-center gap-1 justify-center">
              <span className="font-black text-sm text-gray-900">فيينا، النمسا</span>
              <MapPin size={14} className="text-emerald-600" />
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-black text-gray-900 mb-6">أنقذ وجباتك اليوم 🌿</h2>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse text-emerald-600 font-bold">جاري تحميل العروض...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {meals.map((meal) => (
              <Link href={`/offer/${meal.id}`} key={meal.id} className="group bg-white rounded-[35px] shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-all">
                
                {/* منطقة الصورة - كبيرة وواضحة */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={meal.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                    alt={meal.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* شارات فوق الصورة */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-2xl flex items-center gap-1 shadow-sm">
                    <Star size={14} className="fill-emerald-500 text-emerald-500" />
                    <span className="font-black text-xs">4.8</span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg">
                    وفر {(100 - (meal.discounted_price / meal.original_price * 100)).toFixed(0)}%
                  </div>
                </div>

                {/* تفاصيل المنتج */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-gray-900">{meal.name}</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-emerald-700">{meal.discounted_price} €</span>
                      <span className="text-sm text-gray-400 line-through font-bold">{meal.original_price} €</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 font-bold text-xs border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>استلام: {meal.pickup_time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <span>باقي {meal.quantity} قطع</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}