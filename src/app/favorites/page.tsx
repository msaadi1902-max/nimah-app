'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Heart, Loader2, ArrowRight, Trash2, HeartCrack, Store } from 'lucide-react'
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/welcome')
        return
      }

      // جلب الوجبات المفضلة لهذا الزبون تحديداً من خلال الربط بين الجداول
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          meal_id,
          meals (
            id, name, discounted_price, image_url, currency, original_price,
            profiles:merchant_id(shop_name, full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        // استخراج بيانات الوجبات من عملية الدمج (Join) وتصفية الوجبات المحذوفة
        const fetchedMeals = data.map(item => item.meals).filter(meal => meal !== null)
        setFavorites(fetchedMeals)
      }
    } catch (error: any) {
      console.error("خطأ في جلب المفضلة:", error.message)
    } finally {
      setLoading(false)
    }
  }

  // دالة لإزالة الوجبة من المفضلة
  const removeFavorite = async (mealId: number, e: React.MouseEvent) => {
    e.stopPropagation() // لمنع الانتقال لصفحة الوجبة عند الضغط على زر الحذف
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('meal_id', mealId)

      if (error) throw error

      // تحديث الواجهة فوراً بعد الحذف
      setFavorites(prev => prev.filter(meal => meal.id !== mealId))
    } catch (error: any) {
      alert("حدث خطأ أثناء الحذف: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans flex flex-col" dir="rtl">
      
      {/* الجزء العلوي (الهيدر) */}
      <div className="pt-16 pb-8 px-6 text-center bg-white rounded-b-[40px] shadow-sm mb-6">
        <div className="bg-rose-50 w-20 h-20 rounded-[25px] flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner border border-rose-100 rotate-3">
          <Heart size={40} className="fill-rose-200 text-rose-500 -rotate-3" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">قائمة مفضلاتي ❤️</h1>
        <p className="text-gray-500 font-bold text-xs px-8 leading-relaxed">
          وجباتك المفضلة محفوظة هنا لتصل إليها أسرع قبل أن تنفد الكمية!
        </p>
      </div>

      {/* عرض الوجبات */}
      <div className="px-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600 gap-4">
            <Loader2 className="animate-spin w-10 h-10" />
            <span className="font-black text-xs tracking-widest uppercase">جاري تجهيز قائمتك...</span>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {favorites.map((meal) => {
              const merchantData = Array.isArray(meal.profiles) ? meal.profiles[0] : meal.profiles;
              const merchantName = merchantData?.shop_name || merchantData?.full_name || 'متجر غير معروف';

              return (
                <div 
                  key={meal.id} 
                  onClick={() => router.push('/')} // يمكن تعديلها لاحقاً لتأخذ الزبون لتفاصيل الوجبة
                  className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-emerald-100 active:scale-95 transition-all cursor-pointer group"
                >
                  {/* صورة الوجبة */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full rounded-2xl object-cover shadow-inner" />
                  </div>
                  
                  {/* تفاصيل الوجبة */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 text-base truncate mb-1">{meal.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mb-2 truncate">
                      <Store size={12} className="text-emerald-500" />
                      {merchantName}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-emerald-600 font-black text-lg leading-none">{meal.discounted_price} <span className="text-xs">{meal.currency || '€'}</span></p>
                      <p className="text-gray-400 font-bold text-[10px] line-through">{meal.original_price} {meal.currency || '€'}</p>
                    </div>
                  </div>

                  {/* زر الإزالة */}
                  <button 
                    onClick={(e) => removeFavorite(meal.id, e)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-colors active:scale-90"
                    title="إزالة من المفضلة"
                  >
                    <HeartCrack size={20} />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <HeartCrack size={40} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-2">قائمتك فارغة تماماً!</h2>
            <p className="text-xs text-gray-500 font-bold leading-relaxed mb-8 px-4">
              لم تقم بإضافة أي وجبة إلى مفضلتك بعد. تصفح العروض الآن واضغط على القلب لحفظ ما يعجبك.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              استكشاف العروض <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab="favorites" />
    </div>
  )
}