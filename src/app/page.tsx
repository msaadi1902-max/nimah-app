'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, MapPin, Clock, ShoppingBag, Flame } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ExplorePage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('id', { ascending: false }) // لعرض أحدث الوجبات أولاً

    if (data) setMeals(data)
    setLoading(false)
  }

  const handleReserve = (mealId: string) => {
    // في المستقبل سننقل المستخدم لصفحة الدفع أو السلة، حالياً سننقله لتذكرة الحجز
    router.push(`/my-ticket?order_no=${mealId.substring(0, 5).toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر وشريط البحث */}
      <div className="bg-emerald-600 px-6 pt-8 pb-6 rounded-b-[40px] shadow-md">
        <div className="flex justify-between items-center mb-6 text-white">
          <div>
            <p className="text-xs font-bold text-emerald-100 mb-1">موقعك الحالي</p>
            <h1 className="text-sm font-black flex items-center gap-1">
              <MapPin size={16} /> دمشق، الميدان
            </h1>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث عن وجبة، مطعم، أو مخبز..." 
            className="w-full bg-white rounded-2xl py-4 pr-12 pl-4 text-sm font-bold text-black focus:outline-none shadow-sm"
          />
          <Search size={20} className="absolute right-4 top-4 text-gray-400" />
        </div>
      </div>

      {/* قسم العروض */}
      <div className="p-6">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Flame size={20} className="text-rose-500" /> عروض التوفير اليوم
        </h2>

        {loading ? (
          <div className="text-center text-emerald-600 font-bold mt-10 animate-pulse">
            جاري البحث عن أشهى الوجبات...
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-4">
            <p className="text-gray-500 font-bold">لا يوجد وجبات متوفرة حالياً، عد لاحقاً!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-[25px] overflow-hidden shadow-sm border border-gray-100">
                {/* صورة وهمية مؤقتة للوجبة */}
                <div className="h-32 bg-gray-200 relative">
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                    وفر {Math.round(((meal.original_price - meal.discounted_price) / meal.original_price) * 100)}%
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-black text-gray-900">{meal.name}</h3>
                    <p className="text-xs font-bold text-gray-500 line-through">{meal.original_price} ل.س</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                      <Clock size={12} className="text-emerald-500" /> استلام: {meal.pickup_time}
                    </p>
                    <p className="text-lg font-black text-emerald-600">{meal.discounted_price} ل.س</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <button 
                      onClick={() => handleReserve(meal.id)}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-black active:scale-95 transition-transform"
                    >
                      احجز الآن
                    </button>
                    <div className="bg-orange-50 text-orange-600 px-3 py-3 rounded-xl text-xs font-black border border-orange-100">
                      باقي {meal.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="explore" />
    </div>
  )
}