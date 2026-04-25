'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Star, Clock, Calendar, Store, Loader2, MessageSquare, ShieldCheck, Heart, Share2, Info, ShoppingBag, ChevronRight, ChevronLeft, MapPin } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MealDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  
  const [meal, setMeal] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<any>(null)

  // 👑 حالة السلايدر (التنقل بين الصور)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // 👑 ميزة جديدة: حالة لتحديد الكمية المطلوبة قبل الإضافة للسلة
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchMealDetails()
      checkUserAndFavoriteStatus()
    }
  }, [params.id])

  const checkUserAndFavoriteStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data } = await supabase.from('favorites').select('meal_id').eq('user_id', user.id).eq('meal_id', params.id).single()
      if (data) setIsFavorite(true)
    }
  }

  const fetchMealDetails = async () => {
    setLoading(true)
    const { data: mealData } = await supabase.from('meals').select('*, profiles:merchant_id(shop_name)').eq('id', params.id).single()
    if (mealData) setMeal(mealData)

    const { data: reviewsData } = await supabase.from('reviews').select('*, profiles:user_id(full_name)').eq('meal_id', params.id).order('created_at', { ascending: false })
    if (reviewsData) setReviews(reviewsData)
    
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!meal) return
    
    // 🛠️ تمرير الكمية المطلوبة (selectedQuantity) إلى السلة
    addToCart({
      id: meal.id.toString(),
      name: meal.name,
      store: meal.profiles?.shop_name || meal.category,
      price: meal.discounted_price,
      image: meal.image_url,
      merchant_id: meal.merchant_id,
      state: meal.state,
      city: meal.city,
      quantity: selectedQuantity // 👑 إضافة الكمية هنا
    } as any) 
    
    alert(`🛒 تم إضافة (${selectedQuantity}) من المنتج إلى سلتك بنجاح!`)
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول كزبون للاحتفاظ بالمنتجات في مفضلتك ❤️')
      router.push('/welcome')
      return
    }

    const newFavStatus = !isFavorite
    setIsFavorite(newFavStatus)
    try {
      if (newFavStatus) {
        await supabase.from('favorites').insert([{ user_id: user.id, meal_id: params.id }])
      } else {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('meal_id', params.id)
      }
    } catch (error) {
      setIsFavorite(!newFavStatus) 
    }
  }

  const images = meal?.images_gallery && meal.images_gallery.length > 0 
    ? meal.images_gallery 
    : [meal?.image_url]

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  const totalReviews = reviews.length
  const avgTotal = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.rating || 5), 0) / totalReviews).toFixed(1) : 'جديد'
  const avgQuality = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.quality_rating || 5), 0) / totalReviews).toFixed(1) : 5
  const avgService = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.service_rating || 5), 0) / totalReviews).toFixed(1) : 5
  const avgClean = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.cleanliness_rating || 5), 0) / totalReviews).toFixed(1) : 5

  const RatingBar = ({ label, value }: { label: string, value: number }) => (
    <div className="flex items-center gap-3 text-xs font-black text-gray-600 mb-2">
      <span className="w-16">{label}</span>
      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${(value / 5) * 100}%` }}></div>
      </div>
      <span className="w-6 text-left text-amber-600">{value}</span>
    </div>
  )

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-12 h-12"/></div>
  if (!meal) return <div className="min-h-screen flex justify-center items-center text-gray-500 font-black">عذراً، هذا الإعلان غير متوفر أو تم حذفه ❌</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right font-sans" dir="rtl">
      
      <div className="relative h-[350px] bg-gray-200 overflow-hidden group">
        <img 
          src={images[currentImageIndex]} 
          alt={meal.name} 
          className="w-full h-full object-cover transition-transform duration-700" 
          key={currentImageIndex} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
        
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors"><ChevronLeft size={24} /></button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors"><ChevronRight size={24} /></button>
            
            <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_: any, idx: number) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/50'}`}></div>
              ))}
            </div>
          </>
        )}

        <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
          <button onClick={() => router.back()} className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white active:scale-95 transition-all hover:bg-white/30"><ArrowRight size={22} /></button>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white active:scale-95 hover:bg-white/30"><Share2 size={22} /></button>
            <button onClick={handleToggleFavorite} className="bg-white/90 backdrop-blur-md p-3 rounded-2xl active:scale-90 transition-transform shadow-lg hover:scale-105">
              <Heart size={22} className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-400"} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 z-10">
          <span className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-rose-500/30 inline-block mb-3 uppercase tracking-wider">
            وفر {meal.original_price > 0 ? Math.round(((meal.original_price - meal.discounted_price) / meal.original_price) * 100) : 0}%
          </span>
          <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">{meal.name}</h1>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-20 space-y-6">
        
        <div className="bg-white p-6 rounded-[35px] shadow-xl shadow-gray-200/50 border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-1 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg w-fit">
              <Store size={14} className="text-emerald-600"/> {meal.profiles?.shop_name || 'بائع معتمد'}
            </p>
            {(meal.state || meal.city) && (
              <p className="text-[10px] font-black text-emerald-700 flex items-center gap-1 mt-2 bg-emerald-50 px-2 py-1 rounded-lg w-fit border border-emerald-100">
                <MapPin size={12}/> {meal.state} {meal.city && `- ${meal.city}`}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Star size={18} className={avgTotal === 'جديد' ? 'text-gray-300' : 'text-amber-400 fill-amber-400'} />
              <span className="font-black text-gray-800 text-lg">{avgTotal} <span className="text-xs text-gray-400">({totalReviews} تقييم)</span></span>
            </div>
          </div>
          <div className="text-left bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
            <p className="text-xs font-bold text-gray-400 line-through mb-0.5">{meal.original_price} {meal.currency || 'ل.س'}</p>
            <p className="text-3xl font-black text-emerald-600 leading-none">{meal.discounted_price} <span className="text-sm">{meal.currency || 'ل.س'}</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-2 bg-orange-50/50 p-4 rounded-3xl border border-orange-100/50">
            <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600"><Calendar size={20}/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-1">صلاحية الإعلان</p>
              <p className="text-xs font-black text-gray-800 leading-snug">{meal.start_date || 'غير محدد'} <br/> <span className="text-gray-400">حتى</span> {meal.end_date || 'غير محدد'}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50">
            <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600"><Clock size={20}/></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-1">وقت التواصل/الاستلام</p>
              <p className="text-xs font-black text-gray-800 leading-snug">{meal.pickup_time || 'غير محدد'}</p>
            </div>
          </div>
        </div>

        {meal.description && (
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[40px] -z-10"></div>
            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2"><Info size={18} className="text-emerald-500"/> وصف المنتج</h3>
            <p className="text-sm text-gray-600 font-bold leading-relaxed whitespace-pre-line">{meal.description}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 mb-10">
          <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> تقييمات المنتج</h3>
          
          {totalReviews === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold text-sm">كن أول من يشتري هذا العرض الرائع ويقيمه! ✨</p>
            </div>
          ) : (
            <>
              <div className="mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <RatingBar label="جودة المنتج" value={Number(avgQuality)} />
                <RatingBar label="مصداقية البائع" value={Number(avgService)} />
                <RatingBar label="النظافة/الحالة" value={Number(avgClean)} />
              </div>

              <div className="space-y-5">
                {reviews.map((rev, index) => (
                  <div key={index} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm border border-emerald-200">
                          {rev.profiles?.full_name?.charAt(0) || 'ز'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{rev.profiles?.full_name || 'مشتري'}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{new Date(rev.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                        <Star size={12} className="text-amber-500 fill-amber-500"/>
                        <span className="text-xs font-black text-amber-700">{rev.rating?.toFixed(1) || 5}</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs font-bold text-gray-600 bg-gray-50/80 p-4 rounded-2xl leading-relaxed mt-2 border border-gray-100">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl p-6 rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] border-t border-gray-100 z-50">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          
          {/* 👑 واجهة التحكم بالكمية الجديدة */}
          <div className="bg-gray-50 flex items-center justify-between p-2 rounded-[20px] min-w-[120px] border border-gray-200 h-16 shadow-inner">
            <button 
              onClick={() => setSelectedQuantity(prev => Math.min(prev + 1, meal.quantity))}
              disabled={selectedQuantity >= meal.quantity || meal.quantity <= 0}
              className="w-10 h-10 bg-white rounded-xl shadow-sm text-emerald-600 font-bold text-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
            >+</button>
            <span className="font-black text-xl text-slate-800 w-8 text-center">{selectedQuantity}</span>
            <button 
              onClick={() => setSelectedQuantity(prev => Math.max(prev - 1, 1))}
              disabled={selectedQuantity <= 1 || meal.quantity <= 0}
              className="w-10 h-10 bg-white rounded-xl shadow-sm text-rose-500 font-bold text-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
            >-</button>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={meal.quantity <= 0}
            className="flex-1 bg-slate-900 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4.5 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-900/20 hover:bg-slate-800 h-16"
          >
            {meal.quantity > 0 ? (
              <><ShoppingBag size={20} /> أضف {selectedQuantity > 1 ? `(${selectedQuantity})` : ''} للسلة</>
            ) : (
              'نفدت الكمية الحالية 😔'
            )}
          </button>
        </div>
        {/* نص توضيحي للمخزون المتبقي */}
        {meal.quantity > 0 && (
          <p className="text-center text-[10px] font-bold text-gray-400 mt-3">الكمية المتبقية في المتجر: {meal.quantity}</p>
        )}
      </div>

    </div>
  )
}