'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, MapPin, Clock, ShoppingBag, Flame, Loader2, Store, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useCart } from './context/CartContext' // استيراد السلة

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['الكل', 'مطاعم', 'مخابز', 'حلويات', 'بقالة', 'ألبسة', 'عطور', 'عصرونية', 'موبايلات', 'أثاث']

export default function HomePage() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const router = useRouter()
  
  // استخدام وظائف السلة
  const { addToCart, cart } = useCart()

  useEffect(() => {
    fetchMeals()
  }, [selectedCategory])

  const fetchMeals = async () => {
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

    const { data } = await query
    if (data) setMeals(data)
    setLoading(false)
  }

  // دالة الإضافة للسلة المحدثة
  const handleAddToCart = (meal: any) => {
    addToCart({
      id: meal.id.toString(),
      name: meal.name,
      store: meal.category, // أو يمكنك جلب اسم المتجر إذا توفر
      price: meal.discounted_price,
      image: meal.image_url || 'https://via.placeholder.com/150'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر المطور مع عداد السلة */}
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
            placeholder="ابحث عن وجبة توفير..." 
            className="w-full bg-white/95 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold text-gray-900 focus:outline-none shadow-sm"
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
                  : 'bg-white text-gray-500 border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة العروض */}
      <div className="p-6">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Flame size={20} className="text-rose-500" /> عروض السوق الحية 🔥
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-10 h-10" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-[35px] border border-gray-100 shadow-sm mt-4 text-gray-400 font-bold">
            <Store size={40} className="mx-auto mb-4 opacity-20" />
            لا توجد عروض حالياً في هذا القسم
          </div>
        ) : (
          <div className="space-y-5">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-[35px] overflow-hidden shadow-sm border border-gray-100 relative group">
                <div className="absolute top-4 right-4 z-10 bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                  وفر {meal.original_price > 0 ? Math.round(((meal.original_price - meal.discounted_price) / meal.original_price) * 100) : 0}%
                </div>
                
                <div className="h-44 bg-gray-200 relative overflow-hidden">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">{meal.name}</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{meal.category}</span>
                         <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12}/> {meal.pickup_time}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-black text-gray-900">{meal.discounted_price} €</p>
                      <p className="text-xs font-bold text-gray-400 line-through">{meal.original_price} €</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center pt-2">
                    <button 
                      onClick={() => handleAddToCart(meal)}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-sm font-black active:scale-95 transition-all shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
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