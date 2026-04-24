'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Search, Map as MapIcon, List, SlidersHorizontal, Store, Utensils, 
  ShoppingCart, Flower2, Clock, Loader2, Shirt, Droplet, Package, 
  Smartphone, Sofa, Heart, X, MoreHorizontal, Calendar, MapPin,
  Car, BookOpen, Wrench
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// تحميل الخريطة ديناميكياً لتسريع الأداء
const DynamicMap = dynamic(() => import('@/components/MapView'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex flex-col justify-center items-center bg-slate-50 text-emerald-600 rounded-[40px] shadow-inner border border-slate-100">
      <Loader2 className="animate-spin mb-3" size={32} />
      <span className="text-xs font-black tracking-widest uppercase">تجهيز الأقمار الصناعية...</span>
    </div>
  )
})

// 👑 التصنيفات المحدثة الشاملة (Marketplace)
const CATEGORIES = [
  { id: 'الكل', name: 'الكل', icon: Store },
  { id: 'مطاعم', name: 'مطاعم', icon: Utensils },
  { id: 'بقالة', name: 'سوبر ماركت', icon: ShoppingCart },
  { id: 'مخابز', name: 'مخابز', icon: Store },
  { id: 'حلويات', name: 'حلويات', icon: Flower2 },
  { id: 'ألبسة', name: 'ألبسة', icon: Shirt },
  { id: 'عطور', name: 'عطور', icon: Droplet },
  { id: 'عصرونية', name: 'عصرونية', icon: Package },
  { id: 'موبايلات', name: 'موبايلات', icon: Smartphone },
  { id: 'أثاث', name: 'أثاث', icon: Sofa },
  { id: 'سيارات ودراجات', name: 'سيارات ودراجات', icon: Car },
  { id: 'مكتبة', name: 'مكتبة', icon: BookOpen },
  { id: 'خدمات', name: 'خدمات', icon: Wrench },
  { id: 'آخر', name: 'آخر', icon: MoreHorizontal }, 
]

export default function BrowsePage() {
  const router = useRouter()
  const [view, setView] = useState<'map' | 'list'>('list')
  
  // 👑 فصلنا البيانات الأصلية عن المفلترة لسرعة الأداء
  const [rawItems, setRawItems] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // حالات الفلترة الأساسية
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [sortBy, setSortBy] = useState('newest') 
  const [favorites, setFavorites] = useState<number[]>([])

  // 📍 حالات الفلترة الجغرافية (Willhaben-Style)
  const [filterState, setFilterState] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStreet, setFilterStreet] = useState('')

  // 1. جلب كل البيانات المتاحة مرة واحدة من السيرفر
  const fetchAllItems = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0] 

    const { data } = await supabase
      .from('meals')
      .select('*, profiles:merchant_id(shop_name)')
      .eq('is_approved', true)
      .eq('is_sponsored', false)
      .gt('quantity', 0)
      .gte('end_date', today)

    if (data) {
      setRawItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllItems()
  }, [])

  // 2. 👑 محرك الفلترة الذكي (يعمل محلياً بسرعة البرق دون طلبات إضافية للسيرفر)
  useEffect(() => {
    let result = [...rawItems]

    // فلترة التصنيف
    if (activeCategory !== 'الكل') {
      result = result.filter(item => item.category === activeCategory)
    }

    // فلترة البحث النصي
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.name?.toLowerCase().includes(q) || 
        item.profiles?.shop_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.includes(searchQuery)
      )
    }

    // الفلترة الجغرافية الهرمية 📍
    if (filterState) result = result.filter(item => item.state === filterState)
    if (filterCity) result = result.filter(item => item.city === filterCity)
    if (filterStreet) result = result.filter(item => item.street === filterStreet)

    // الترتيب
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'price_low') result.sort((a, b) => a.discounted_price - b.discounted_price)
    if (sortBy === 'price_high') result.sort((a, b) => b.discounted_price - a.discounted_price)

    setItems(result)
  }, [rawItems, activeCategory, searchQuery, filterState, filterCity, filterStreet, sortBy])

  // 3. استخراج القوائم المنسدلة الجغرافية ديناميكياً لتجنب الخيارات الفارغة
  const availableStates = Array.from(new Set(rawItems.map(item => item.state).filter(Boolean))) as string[]
  const availableCities = Array.from(new Set(rawItems.filter(item => item.state === filterState).map(item => item.city).filter(Boolean))) as string[]
  const availableStreets = Array.from(new Set(rawItems.filter(item => item.state === filterState && item.city === filterCity).map(item => item.street).filter(Boolean))) as string[]

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation() 
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  const resetLocationFilters = () => {
    setFilterState('')
    setFilterCity('')
    setFilterStreet('')
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-right" dir="rtl">
      
      {/* 👑 الهيدر وأدوات البحث */}
      <div className="bg-white px-4 pt-12 pb-5 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-b-[40px] border-b border-slate-100/50">
        <h1 className="text-2xl font-black text-slate-900 mb-6 px-2 flex items-center gap-2">
          سوق نِعمة الشامل 🛒
        </h1>
        
        <div className="flex gap-3 mb-5 px-1">
          <button onClick={() => setShowFilter(true)} className="relative bg-emerald-50 hover:bg-emerald-100 p-4 rounded-2xl text-emerald-700 border border-emerald-100 active:scale-95 transition-all shadow-sm">
            <SlidersHorizontal size={22} />
            {/* مؤشر أحمر يظهر إذا كان هناك فلتر جغرافي أو ترتيب مفعل غير الافتراضي */}
            {(filterState || filterCity || sortBy !== 'newest') && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث عن متجر، منتج، أو تصنيف..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-14 pl-4 text-sm font-black text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
            />
            <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
        </div>

        {/* 🗺️ أزرار التبديل بين الخريطة والقائمة */}
        <div className="flex bg-slate-100/80 rounded-2xl p-1.5 relative border border-slate-200/50 shadow-inner mx-1">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl transition-all duration-300 ease-spring shadow-[0_2px_10px_rgba(0,0,0,0.08)] ${view === 'map' ? 'right-1.5' : 'left-1.5'}`}></div>
          <button onClick={() => setView('map')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 text-sm font-black z-10 transition-colors ${view === 'map' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}><MapIcon size={18} /> الخريطة التفاعلية</button>
          <button onClick={() => setView('list')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 text-sm font-black z-10 transition-colors ${view === 'list' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}><List size={18} /> القائمة والتصنيفات</button>
        </div>
      </div>

      <div className="w-full">
        {view === 'map' ? (
          // 🗺️ منطقة الخريطة الفاخرة
          <div className="p-4 w-full h-[calc(100vh-270px)] animate-in fade-in duration-500 z-0">
            <div className="w-full h-full rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white relative">
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-slate-900/20 flex flex-col items-center gap-1 w-max">
                <span>{items.length} عروض متوفرة</span>
                <span className="text-[8px] text-emerald-400 normal-case">انقر على الخريطة لتثبيت دبوس البحث 📍</span>
              </div>
              
              <DynamicMap 
                items={items} 
                onPinDrop={(lat: number, lng: number) => {
                  console.log("تم إسقاط الدبوس في:", lat, lng)
                }} 
              />
            </div>
          </div>
        ) : (
          // 📋 منطقة القائمة
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            
            {/* شريط التصنيفات */}
            <div className="px-4 py-6 flex gap-3 overflow-x-auto hide-scrollbar snap-x">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)} 
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-black text-sm transition-all snap-center shadow-sm border ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-[0_5px_15px_rgba(15,23,42,0.2)]' : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />{cat.name}
                  </button>
                )
              })}
            </div>

            {/* 👑 عرض مسار الفلترة الجغرافية النشط للمستخدم */}
            {(filterState || filterCity) && (
              <div className="px-4 mb-4 flex items-center gap-2 text-[10px] font-black text-emerald-700 bg-emerald-50 py-2 mx-4 rounded-xl border border-emerald-100">
                <MapPin size={14} className="text-emerald-500 mr-2 shrink-0"/>
                في: {filterState} {filterCity && `> ${filterCity}`} {filterStreet && `> ${filterStreet}`}
                <button onClick={resetLocationFilters} className="mr-auto ml-2 bg-white p-1 rounded-md border border-emerald-200 text-rose-500"><X size={12}/></button>
              </div>
            )}

            <div className="px-4 pb-4">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-emerald-600">
                  <Loader2 className="animate-spin mb-3" size={36} />
                  <span className="font-black text-sm tracking-widest text-slate-400">جاري مسح السوق...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-[40px] border border-slate-100 mt-2 shadow-sm animate-in zoom-in-95">
                  <Search size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="font-black text-slate-900 text-lg mb-1">لا توجد نتائج</h3>
                  <p className="text-slate-400 font-bold text-xs">جرب البحث بكلمة مختلفة أو تغيير المنطقة.</p>
                  {(filterState || filterCity) && (
                    <button onClick={resetLocationFilters} className="mt-4 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs">مسح فلتر الموقع</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => router.push(`/meal/${item.id}`)}
                      className="cursor-pointer bg-white rounded-[35px] overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-emerald-100 flex flex-col relative group animate-in slide-in-from-bottom-4"
                    >
                      <button onClick={(e) => toggleFavorite(e, item.id)} className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-transform">
                        <Heart size={16} className={favorites.includes(item.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-400'} />
                      </button>

                      <div className="h-36 relative bg-slate-100 overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className={`absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow-[0_5px_15px_rgba(244,63,94,0.3)]`}>
                          وفر {item.original_price > 0 ? Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100) : 0}%
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 mb-1.5 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-md border border-emerald-100/50 truncate max-w-full">
                            <Store size={10} className="shrink-0" /> {item.profiles?.shop_name || item.category}
                          </p>
                          <h3 className="font-black text-sm text-slate-900 leading-tight mb-2 line-clamp-2">{item.name}</h3>
                          
                          {/* 👑 عرض الموقع للزبون في الكرت */}
                          {item.state && (
                            <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 mt-1 truncate">
                              <MapPin size={10} className="text-emerald-500 shrink-0" /> {item.city} {item.street && `- ${item.street}`}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-100 border-dashed">
                          <div className="text-left">
                            <span className="block text-slate-400 text-[10px] line-through font-bold mb-0.5">{item.original_price}</span>
                            <span className="font-black text-emerald-600 text-lg leading-none">{item.discounted_price} <span className="text-[10px] text-slate-400">{item.currency || 'ل.س'}</span></span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl text-slate-400 border border-slate-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors">
                            <Clock size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🌟 نافذة الفلترة الزجاجية المدمجة (الموقع + الترتيب) */}
      {showFilter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-t-[40px] p-6 pb-12 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl max-h-[85vh] overflow-y-auto hide-scrollbar">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 sticky top-0 bg-white z-10 pt-2">
              <h2 className="text-xl font-black text-slate-900">تخصيص البحث</h2>
              <button onClick={() => setShowFilter(false)} className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full text-slate-500 active:scale-90 transition-colors"><X size={20}/></button>
            </div>
            
            {/* 📍 1. الفلترة الجغرافية ההرمية */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500"/> الموقع الجغرافي
              </h3>
              
              <div className="space-y-3 bg-slate-50 p-5 rounded-[25px] border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-500 mb-1 block">المحافظة</label>
                  <select 
                    value={filterState} 
                    onChange={(e) => { setFilterState(e.target.value); setFilterCity(''); setFilterStreet(''); }}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-900 font-bold outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="">كل المحافظات</option>
                    {availableStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                {filterState && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-500 mb-1 block">المدينة / المنطقة</label>
                    <select 
                      value={filterCity} 
                      onChange={(e) => { setFilterCity(e.target.value); setFilterStreet(''); }}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-900 font-bold outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="">كل المدن في {filterState}</option>
                      {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                )}

                {filterCity && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-500 mb-1 block">الشارع (اختياري)</label>
                    <select 
                      value={filterStreet} 
                      onChange={(e) => setFilterStreet(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-900 font-bold outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="">كل الشوارع في {filterCity}</option>
                      {availableStreets.map(street => <option key={street} value={street}>{street}</option>)}
                    </select>
                  </div>
                )}
                
                {(filterState || filterCity) && (
                  <button onClick={resetLocationFilters} className="w-full mt-2 text-[10px] font-black text-rose-500 py-2 hover:bg-rose-50 rounded-lg transition-colors">
                    إعادة ضبط الموقع
                  </button>
                )}
              </div>
            </div>

            {/* 📊 2. ترتيب العروض */}
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-500"/> الترتيب حسب
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'newest', label: 'الأحدث والأكثر طزاجة 🌟', desc: 'شاهد أحدث العروض المضافة اليوم' },
                  { id: 'price_low', label: 'السعر: من الأرخص للأغلى 📉', desc: 'رتب حسب الأعلى توفيراً' },
                  { id: 'price_high', label: 'السعر: من الأغلى للأرخص 📈', desc: 'رتب حسب الوجبات الفاخرة' }
                ].map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`w-full p-4 rounded-[20px] text-right transition-all flex justify-between items-center border-2 ${sortBy === opt.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    <div>
                      <span className={`block font-black text-sm ${sortBy === opt.id ? 'text-white' : 'text-slate-900'}`}>{opt.label}</span>
                      <span className={`block text-[10px] font-bold mt-1 ${sortBy === opt.id ? 'text-slate-400' : 'text-slate-500'}`}>{opt.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sortBy === opt.id ? 'border-emerald-400 bg-emerald-500' : 'border-slate-300'}`}>
                       {sortBy === opt.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowFilter(false)} className="w-full bg-emerald-600 text-white mt-8 py-5 rounded-2xl font-black shadow-lg shadow-emerald-200 active:scale-95 transition-transform">
              عرض النتائج ({items.length})
            </button>

          </div>
        </div>
      )}

      <BottomNav activeTab="browse" />
    </div>
  )
}