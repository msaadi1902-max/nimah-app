'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Search, MapPin, Clock, ShoppingBag, Flame, Store, 
  Plus, Star, Sparkles, Calendar, Heart, Megaphone, Map, Loader2, RefreshCw 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useCart } from './context/CartContext'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['الكل', 'مطاعم', 'مخابز', 'حلويات', 'بقالة', 'ألبسة', 'عطور', 'عصرونية', 'موبايلات', 'أثاث', 'آخر']

interface Meal {
  id: number;
  name: string;
  category: string;
  currency: string;
  original_price: number;
  discounted_price: number;
  image_url: string;
  merchant_id: string;
  pickup_time: string;
  start_date?: string;
  end_date: string;
  is_golden?: boolean;
  is_sponsored?: boolean;
  rating?: string | number;
  reviewsCount?: number;
}

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [user, setUser] = useState<any>(null)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  
  // 👑 حالات الموقع الذكي
  const [locationName, setLocationName] = useState('جاري تحديد الموقع...')
  const [isLocating, setIsLocating] = useState(false)
  
  const router = useRouter()
  const { addToCart, cart } = useCart()

  useEffect(() => {
    checkUserAndFavorites()
    getUserLocation() // تشغيل تحديد الموقع عند فتح التطبيق
  }, [])

  useEffect(() => {
    fetchSponsoredMeals()
  }, [selectedCategory])

  const checkUserAndFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data } = await supabase.from('favorites').select('meal_id').eq('user_id', user.id)
      if (data) setFavoriteIds(data.map(f => f.meal_id))
    }
  }

  // 👑 ميزة جلب الموقع الحقيقي للزبون وترجمته لاسم مدينة وحي
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationName('التوصيل إلى موقعي')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=ar`)
        const data = await res.json()
        const city = data.address.city || data.address.town || data.address.state || 'موقعي'
        const suburb = data.address.suburb || data.address.neighbourhood || ''
        setLocationName(`${city}${suburb ? '، ' + suburb : ''}`)
      } catch (error) {
        setLocationName('تم تحديد الموقع 📍')
      }
      setIsLocating(false)
    }, () => {
      setLocationName('التوصيل إلى موقعي (تفعيل الـ GPS مطلوب)')
      setIsLocating(false)
    })
  }

  const fetchSponsoredMeals = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('meals')
      .select('*')
      .eq('is_approved', true) 
      .eq('is_sponsored', true)
      .gt('quantity', 0)
      .gte('end_date', today)
      .order('created_at', { ascending: false })

    if (selectedCategory !== 'الكل') query = query.eq('category', selectedCategory)

    const { data: mealsData, error } = await query
    
    if (error) {
      console.error("Error fetching meals:", error)
      setLoading(false)
      return
    }

    const { data: reviewsData } = await supabase.from('reviews').select('merchant_id, rating')

    if (mealsData) {
      const mealsWithRatings = mealsData.map((meal: any) => {
        const merchantReviews = reviewsData?.filter(r => r.merchant_id === meal.merchant_id) || []
        const totalRating = merchantReviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = merchantReviews.length > 0 ? (totalRating / merchantReviews.length).toFixed(1) : 'جديد'
        return { ...meal, rating: averageRating, reviewsCount: merchantReviews.length }
      })
      setMeals(mealsWithRatings)
    }
    setLoading(false)
  }

  const handleAddToCart = (e: React.MouseEvent, meal: Meal) => {
    e.stopPropagation() 
    addToCart({
      id: meal.id.toString(),
      name: meal.name,
      store: meal.category,
      price: meal.discounted_price,
      image: meal.image_url || 'https://via.placeholder.com/150',
      merchant_id: meal.merchant_id 
    })
  }

  const handleToggleFavorite = async (e: React.MouseEvent, mealId: number) => {
    e.stopPropagation() 
    if (!user) {
      alert('يرجى تسجيل الدخول كزبون لإضافة الوجبات إلى مفضلتك ❤️')
      router.push('/welcome')
      return
    }
    const isFav = favoriteIds.includes(mealId)
    if (isFav) {
      setFavoriteIds(prev => prev.filter(id => id !== mealId))
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('meal_id', mealId)
    } else {
      setFavoriteIds(prev => [...prev, mealId])
      await supabase.from('favorites').insert([{ user_id: user.id, meal_id: mealId }])
    }
  }

  const calculateDiscount = (original: number, discounted: number) => {
    if (!original || !discounted || original <= discounted) return null;
    const percentage = Math.round(((original - discounted) / original) * 100);
    return percentage > 0 ? percentage : null;
  }

  const goldenAds = meals.filter(meal => meal.is_golden === true)
  const regularAds = meals.filter(meal => meal.is_golden !== true)
  const filteredAds = regularAds.filter(meal => 
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    meal.category.includes(searchQuery)
  )

  const SkeletonCard = () => (
    <div className="bg-white rounded-[35px] overflow-hidden shadow-sm border border-slate-100 p-4 animate-pulse">
      <div className="h-44 bg-slate-200 rounded-3xl mb-4 w-full"></div>
      <div className="h-6 bg-slate-200 rounded-full w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-200 rounded-full w-1/2 mb-6"></div>
      <div className="flex justify-between items-end">
        <div className="space-y-2 w-1/3">
          <div className="h-6 bg-slate-200 rounded-full w-full"></div>
          <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-right font-sans" dir="rtl">
      
      <div className="bg-emerald-600 px-6 pt-12 pb-8 rounded-b-[45px] shadow-[0_10px_30px_rgba(5,150,105,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/30 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/30 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-8 text-white relative z-10">
          <div className="flex items-center gap-3">
            <div 
              onClick={getUserLocation}
              className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-all active:scale-95"
              title="تحديث الموقع"
            >
              {isLocating ? <Loader2 size={24} className="text-white animate-spin" /> : <Map size={24} className="text-white" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-0.5">موقع التوصيل</p>
              <h1 className="text-sm font-black flex items-center gap-1 cursor-pointer" onClick={getUserLocation}>
                {locationName}
                {!isLocating && <RefreshCw size={12} className="text-emerald-200 opacity-70 ml-1" />}
              </h1>
            </div>
          </div>
          <button onClick={() => router.push('/cart')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-xl active:scale-95 transition-transform relative">
            <ShoppingBag size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative z-10 group">
          <input 
            type="text" 
            placeholder="عن ماذا تبحث اليوم؟..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/95 backdrop-blur-md rounded-[20px] py-4 pr-12 pl-4 text-sm font-black text-slate-900 placeholder-slate-400 focus:outline-none shadow-lg transition-all focus:ring-4 focus:ring-emerald-300/50 border border-white/50"
          />
          <Search size={20} className="absolute right-4 top-4 text-emerald-600 group-focus-within:text-emerald-500 transition-colors" />
        </div>
      </div>

      <div className="px-6 mt-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 w-max pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-sm border ${
                selectedCategory === cat 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                : 'bg-white text-slate-500 border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!searchQuery && selectedCategory === 'الكل' && goldenAds.length > 0 && (
        <div className="px-6 mt-8 animate-in fade-in duration-500">
          <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500 fill-amber-500 animate-pulse" /> إعلانات VIP 👑
          </h2>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {goldenAds.map((meal) => (
              <div key={`gold-${meal.id}`} onClick={() => router.push(`/meal/${meal.id}`)} className="cursor-pointer min-w-[280px] bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[35px] overflow-hidden shadow-[0_10px_20px_rgba(245,158,11,0.15)] border border-amber-500/30 relative snap-center group">
                
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1 backdrop-blur-md">
                  <Megaphone size={12} className="fill-slate-900"/> إعلان ممول
                </div>

                <button onClick={(e) => handleToggleFavorite(e, meal.id)} className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-md p-2.5 rounded-full hover:bg-white/30 transition-colors active:scale-90 border border-white/10">
                  <Heart size={16} className={favoriteIds.includes(meal.id) ? "fill-rose-500 text-rose-500" : "text-white"} />
                </button>
                
                <div className="h-40 bg-slate-800 relative overflow-hidden">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>
                
                <div className="p-5 relative z-10 -mt-8">
                  <h3 className="text-lg font-black text-white mb-1 leading-tight drop-shadow-md">{meal.name}</h3>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-left">
                      <p className="text-2xl font-black text-amber-400 drop-shadow-sm">{meal.discounted_price} <span className="text-sm">{meal.currency || 'ل.س'}</span></p>
                      <p className="text-[11px] font-bold text-slate-400 line-through decoration-rose-500/50">{meal.original_price} {meal.currency || 'ل.س'}</p>
                    </div>
                    <button onClick={(e) => handleAddToCart(e, meal)} className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 px-5 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-transform flex items-center gap-2">
                      <Plus size={16} /> أضف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 mt-2">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <Flame size={20} className="text-rose-500 fill-rose-500" /> العروض الحصرية 🔥
        </h2>

        {loading ? (
          <div className="space-y-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-[35px] border border-slate-100 shadow-sm mt-4 text-slate-400 font-bold animate-in zoom-in-95">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-900 font-black mb-1">لا توجد عروض هنا!</p>
            <p className="text-xs">{searchQuery ? 'لا توجد نتائج تطابق بحثك حالياً.' : 'لم يتم نشر إعلانات مميزة في هذا القسم بعد.'}</p>
            <button onClick={() => router.push('/browse')} className="mt-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs active:scale-95 w-full transition-colors border border-emerald-100">
              تصفح سوق التجار الشامل 🛒
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAds.map((meal) => {
              const discountPct = calculateDiscount(meal.original_price, meal.discounted_price);
              
              return (
                <div key={`norm-${meal.id}`} onClick={() => router.push(`/meal/${meal.id}`)} className="cursor-pointer bg-white rounded-[35px] overflow-hidden shadow-sm border border-slate-100 relative group animate-in slide-in-from-bottom-4 duration-500 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-emerald-100 transition-all">
                  
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <div className="bg-indigo-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 w-fit">
                      <Megaphone size={10} /> إعلان مميز
                    </div>
                    {discountPct && (
                      <div className="bg-rose-500/90 backdrop-blur-sm text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 w-fit">
                        وفر {discountPct}%
                      </div>
                    )}
                  </div>

                  <button onClick={(e) => handleToggleFavorite(e, meal.id)} className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur p-2.5 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-transform">
                    <Heart size={18} className={favoriteIds.includes(meal.id) ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-400"} />
                  </button>
                  
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex-1 pl-2">
                        <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{meal.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{meal.category}</span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg"><Clock size={12} className="text-slate-400"/> {meal.pickup_time}</span>
                        </div>
                        
                        {meal.start_date && meal.end_date && (
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1 bg-amber-50 w-fit px-2.5 py-1 rounded-lg border border-amber-100">
                            <Calendar size={12} className="text-amber-500" /> متاح لغاية {meal.end_date}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-left whitespace-nowrap bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-black text-emerald-600">{meal.discounted_price} <span className="text-sm">{meal.currency || 'ل.س'}</span></p>
                        <p className="text-[11px] font-bold text-slate-400 line-through mt-0.5 decoration-rose-400/50">{meal.original_price} {meal.currency || 'ل.س'}</p>
                      </div>
                    </div>

                    <button onClick={(e) => handleAddToCart(e, meal)} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-black active:scale-95 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] flex justify-center items-center gap-2 hover:bg-emerald-600">
                      <Plus size={18} /> أضف إلى سلة الإنقاذ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}