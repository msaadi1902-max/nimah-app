'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { MapPin, Star, ShoppingBag, Flame, ShieldCheck } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HomePage() {
  const [featuredMeals, setFeaturedMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeatured = async () => {
    // 🎯 جلب فقط العروض التي وافقت عليها (Approved) واخترتها للرئيسية (Featured)
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('is_approved', true) 
      .eq('is_featured', true) 
      .order('id', { ascending: false })
    
    if (data) setFeaturedMeals(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right font-sans" dir="rtl">
      
      {/* هيدر الواجهة المدفوعة */}
      <div className="bg-white pt-12 pb-6 px-6 sticky top-0 z-50 border-b border-emerald-50 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-emerald-700 font-black italic">
            <ShieldCheck size={18} /> نِعمة بريميوم
          </div>
          <div className="text-xs font-bold text-gray-400">فيينا، النمسا</div>
        </div>
        <h1 className="text-xl font-black text-gray-900">أفضل العروض المختارة لك 🏆</h1>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-emerald-600 font-bold italic">جاري تحضير قائمة النخبة...</div>
        ) : featuredMeals.length === 0 ? (
          /* رسالة تظهر عندما لا يكون هناك عروض وافقت عليها بعد */
          <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border-2 border-dashed border-gray-100 mt-4">
             <ShoppingBag size={50} className="mx-auto text-gray-200 mb-4" />
             <h3 className="font-black text-gray-900 mb-2 text-lg">لا يوجد عروض مميزة حالياً</h3>
             <p className="text-gray-400 font-bold text-sm leading-relaxed">بمجرد موافقة الإدارة على العروض الجديدة، ستظهر هنا فوراً.</p>
          </div>
        ) : (
          /* عرض العروض المعتمدة فقط */
          <div className="space-y-8">
            {featuredMeals.map((meal) => (
              <Link href={`/offer/${meal.id}`} key={meal.id} className="block group relative bg-white rounded-[45px] shadow-xl shadow-emerald-900/5 overflow-hidden border border-emerald-50 transition-all active:scale-[0.98]">
                <div className="h-72 overflow-hidden relative">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-5 left-5 bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-[10px] shadow-lg flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> عرض موثق
                  </div>
                </div>
                <div className="p-7">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">{meal.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-black text-sm italic">
                         وفّر {(100 - (meal.discounted_price / meal.original_price * 100)).toFixed(0)}%
                      </div>
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 mb-3">{meal.name}</h3>
                   <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-emerald-800">{meal.discounted_price} €</span>
                      <span className="text-lg text-gray-300 line-through font-bold opacity-70">{meal.original_price} €</span>
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