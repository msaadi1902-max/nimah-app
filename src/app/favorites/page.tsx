'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Heart, ShoppingBag, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    // نجلب بعض الوجبات لكي لا تظهر الصفحة فارغة تماماً في البداية
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('is_approved', true)
      .limit(3)

    if (data) setFavorites(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans flex flex-col" dir="rtl">
      
      {/* الجزء العلوي (الهيدر) من تصميمك الهادئ */}
      <div className="pt-16 pb-10 px-6 text-center">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm border border-emerald-100">
          <Heart size={40} className="fill-emerald-100" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">قائمة المفضلة</h1>
        <p className="text-gray-500 font-bold text-sm px-8 leading-relaxed">
          هنا ستظهر المطاعم والمخابز التي قمت بحفظها لتصل إليها بسرعة!
        </p>
      </div>

      {/* عرض الوجبات (المنطق البرمجي) */}
      <div className="px-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest mb-4 italic">اكتشف وجبات جديدة</h2>
            {favorites.map((meal) => (
              <div 
                key={meal.id} 
                onClick={() => router.push('/')}
                className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-all"
              >
                <img src={meal.image_url} alt={meal.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-sm">{meal.name}</h3>
                  <p className="text-emerald-600 font-black text-base">{meal.discounted_price} €</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-full text-emerald-500">
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* تأكد أن activeTab هو "favorites" ليعرف الزبون أين هو */}
      <BottomNav activeTab="favorites" />
    </div>
  )
}