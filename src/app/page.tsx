'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, MapPin, Clock, ShoppingBag, Flame, Loader2, Store, Plus, Star, Sparkles, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useCart } from './context/CartContext'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['الكل', 'مطاعم', 'مخابز', 'حلويات', 'بقالة', 'ألبسة', 'عطور', 'عصرونية', 'موبايلات', 'أثاث', 'آخر']

export default function HomePage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  const { addToCart, cart } = useCart()

  useEffect(() => {
    fetchMealsAndRatings()
  }, [selectedCategory])

  const fetchMealsAndRatings = async () => {
    setLoading(true)
    let query = supabase
      .from('meals')
      .select('*')
      .eq('is_approved', true) 
      .gt('quantity', 0)
      .order('id', { ascending: false })

    if (selectedCategory !== 'الكل') {
      query = query.eq('category', selectedCategory)
    }

    const { data: mealsData } = await query
    const { data: reviewsData } = await supabase.from('reviews').select('merchant_id, rating')

    if (mealsData) {
      const mealsWithRatings = mealsData.map(meal => {
        const merchantReviews = reviewsData?.filter(r => r.merchant_id === meal.merchant_id) || []
        const totalRating = merchantReviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = merchantReviews.length > 0 ? (totalRating / merchantReviews.length).toFixed(1) : 'جديد'
        
        return {
          ...meal,
          rating: averageRating,
          reviewsCount: merchantReviews.length
        }
      })
      setMeals(mealsWithRatings)
    }
    setLoading(false)
  }

  const handleAddToCart = (e: React.MouseEvent, meal: any) => {
    e.stopPropagation() // لمنع فتح صفحة التفاصيل عند الضغط على زر "أضف للسلة"
    addToCart({
      id: meal.id.toString(),
      name: meal.name,
      store: meal.category,
      price: meal.discounted_price,
      image: meal.image_url || 'https://via.placeholder.com/150',
      merchant_id: meal.merchant_id 
    })
  }

  const filteredMeals = meals.filter(meal => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    meal.category.includes(searchQuery)
  )

  const featuredMeals = meals.filter(meal => meal.is_featured === true)

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الأنيق */}
      <div className="bg-emerald-600 px-6 pt-12 pb-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-6 text-white relative z-10">
          <div>
            <p className="text-xs font-bold text-emerald-100 mb-1">موقعك الحالي</p>
            <h1 className="text-sm font-black flex items-center gap-1">
              <MapPin size={16} /> دمشق، الميدان
            </h1>
          </div>
          <button 
            onClick={() => router.push('/cart')} 
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg active:scale-90 transition-all relative"
          >
            <ShoppingBag size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative z-10">
          <input 
            type="text" 
            placeholder="ابحث عن وجبة، متجر..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/95 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold text-gray-900 focus:outline-none shadow-sm transition-all focus:ring-2 focus:ring-emerald-300"
          />
          <Search size={20} className="absolute right-4 top-4 text-emerald-600" />
        </div>
      </div>

      {/* الأقسام */}
      <div className="px-6 mt-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 w-max pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm border ${
                selectedCategory === cat 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-500 border-gray-100 hover:bg-emerald-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* قسم العروض المميزة 🏆 */}
      {!searchQuery && selectedCategory === 'الكل' && featuredMeals.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500 fill-amber-500 animate-pulse" /> عروض مميزة وحصرية 🏆
          </h2>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {featuredMeals.map((meal) => (
              <div 
                key={`feat-${meal.id}`} 
                onClick={() => router.push(`/meal/${meal.id}`)} // الربط بصفحة التفاصيل
                className="cursor-pointer min-w-[280px] bg-slate-900 text-white rounded-[35px] overflow-hidden shadow-xl border border-slate-800 relative snap-center group"
              >
                
                <div className="absolute top-4 right-4 z-10 bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  عرض خاص 🔥
                </div>
                
                <div className="h-36 bg-gray-800 relative overflow-hidden">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>
                
                <div className="p-5 relative z-10 -mt-6">
                  <h3 className="text-lg font-black text-white mb-1 leading-tight">{meal.name}</h3>
                  <div className="flex justify-between items-end mt-3">
                    <div className="text-left">
                      <p className="text-2xl font-black text-amber-400">{meal.discounted_price} {meal.currency || 'ل.س'}</p>
                      <p className="text-[10px] font-bold text-slate-400 line-through">{meal.original_price} {meal.currency || 'ل.س'}</p>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, meal)} // تحديث دالة الإضافة للسلة لمنع التداخل
                      className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Plus size={14} /> إضافة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قائمة العروض العادية الحية */}
      <div className="p-6">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Flame size={20} className="text-rose-500" /> عروض السوق الحية 🔥
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-10 h-10" />
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-[35px] border border-gray-100 shadow-sm mt-4 text-gray-400 font-bold">
            <Store size={40} className="mx-auto mb-4 opacity-20" />
            {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد عروض حالياً في هذا القسم'}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredMeals.map((meal) => (
              <div 
                key={`norm-${meal.id}`} 
                onClick={() => router.push(`/meal/${meal.id}`)} // الربط بصفحة التفاصيل
                className="cursor-pointer bg-white rounded-[35px] overflow-hidden shadow-sm border border-gray-100 relative group animate-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition-shadow"
              >
                
                {/* شارة الخصم */}
                <div className="absolute top-4 right-4 z-10 bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                  وفر {meal.original_price > 0 ? Math.round(((meal.original_price - meal.discounted_price) / meal.original_price) * 100) : 0}%
                </div>

                {/* شارة التقييم ⭐ */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Star size={12} className={meal.rating === 'جديد' ? 'text-gray-400' : 'text-amber-500 fill-amber-500'} />
                  {meal.rating}
                </div>
                
                <div className="h-44 bg-gray-200 relative overflow-hidden">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">{meal.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{meal.category}</span>
                         <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12}/> {meal.pickup_time}</span>
                      </div>
                      
                      {meal.start_date && meal.end_date && (
                        <p className="text-[9px] text-gray-500 font-bold flex items-center gap-1 mt-1 bg-gray-50 w-fit px-2 py-1 rounded-md">
                          <Calendar size={10} className="text-orange-400" /> صالح من {meal.start_date} لـ {meal.end_date}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-left whitespace-nowrap mr-2">
                      <p className="text-2xl font-black text-gray-900">{meal.discounted_price} <span className="text-base">{meal.currency || 'ل.س'}</span></p>
                      <p className="text-xs font-bold text-gray-400 line-through">{meal.original_price} {meal.currency || 'ل.س'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center pt-2">
                    <button 
                      onClick={(e) => handleAddToCart(e, meal)} // تحديث دالة الإضافة للسلة لمنع التداخل
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black active:scale-95 transition-all shadow-md shadow-emerald-100 flex justify-center items-center gap-2 hover:bg-emerald-700"
                    >
                      <Plus size={18} /> أضف للسلة
                    </button>
                    <div className="bg-gray-50 text-gray-900 px-4 py-2 rounded-2xl border border-gray-100 text-center min-w-[70px]">
                      <span className="block text-[9px] font-bold text-gray-400">باقي</span>
                      <span className="text-lg font-black leading-none">{meal.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}