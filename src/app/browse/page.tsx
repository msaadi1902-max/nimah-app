'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, Map as MapIcon, List, SlidersHorizontal, Store, Utensils, ShoppingCart, Flower2, Clock, Loader2, Shirt, Droplet, Package, Smartphone, Sofa, Heart, X, MoreHorizontal, Calendar, Star } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import dynamic from 'next/dynamic'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const DynamicMap = dynamic(() => import('@/components/MapView'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full flex flex-col justify-center items-center bg-emerald-50 text-emerald-600"><Loader2 className="animate-spin mb-2" size={30} /><span className="text-xs font-bold">جاري تحميل الخريطة...</span></div>
})

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
  { id: 'آخر', name: 'آخر', icon: MoreHorizontal }, 
]

export default function BrowsePage() {
  const [view, setView] = useState<'map' | 'list'>('list')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [showFilter, setShowFilter] = useState(false)
  const [sortBy, setSortBy] = useState('newest') 
  const [favorites, setFavorites] = useState<number[]>([])

  const fetchItems = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0] // 👑 المراقب الذكي

    let query = supabase
      .from('meals')
      .select('*, profiles:merchant_id(shop_name)')
      .eq('is_approved', true)
      .gt('quantity', 0)
      .gte('end_date', today) // إخفاء المنتهي

    if (activeCategory !== 'الكل') query = query.eq('category', activeCategory)
    
    if (sortBy === 'newest') query = query.order('id', { ascending: false })
    if (sortBy === 'price_low') query = query.order('discounted_price', { ascending: true })
    if (sortBy === 'price_high') query = query.order('discounted_price', { ascending: false })

    const { data } = await query
    
    if (data) {
      const filtered = searchQuery 
        ? data.filter((m: any) => 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (m.profiles?.shop_name && m.profiles.shop_name.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : data
      setItems(filtered)
    }
    setLoading(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchItems(), 300) 
    return () => clearTimeout(delayDebounceFn)
  }, [activeCategory, searchQuery, sortBy])

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-right" dir="rtl">
      <div className="bg-white px-4 pt-10 pb-4 sticky top-0 z-20 shadow-sm rounded-b-3xl">
        <h1 className="text-2xl font-black text-gray-900 mb-4 px-2">استكشف السوق 🌍</h1>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setShowFilter(true)}
            className="bg-emerald-50 p-3 rounded-2xl text-emerald-700 border border-emerald-100 active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={22} />
          </button>
          <div className="relative flex-1">
            <input type="text" placeholder="ابحث عن متجر أو منتج..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:outline-none" />
            <Search size={20} className="absolute right-4 top-3.5 text-gray-400" />
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 relative">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-800 rounded-xl transition-all duration-300 ease-in-out shadow-sm ${view === 'map' ? 'right-1' : 'left-1'}`}></div>
          <button onClick={() => setView('map')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'map' ? 'text-white' : 'text-gray-500'}`}><MapIcon size={18} /> الخريطة</button>
          <button onClick={() => setView('list')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'list' ? 'text-white' : 'text-gray-500'}`}><List size={18} /> القائمة</button>
        </div>
      </div>

      <div className="w-full">
        {view === 'map' ? (
          <div className="relative w-full h-[calc(100vh-280px)] overflow-hidden rounded-b-3xl z-0">
            <DynamicMap items={items} />
          </div>
        ) : (
          <div>
            <div className="px-4 py-4 flex gap-3 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap font-black text-sm transition-all ${isActive ? 'bg-emerald-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'}`}>
                    <Icon size={16} className={isActive ? 'text-emerald-300' : 'text-gray-400'} />{cat.name}
                  </button>
                )
              })}
            </div>

            <div className="p-4 pt-0">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-emerald-600"><Loader2 className="animate-spin mb-2" size={32} /><span className="font-bold">جاري البحث...</span></div>
              ) : items.length === 0 ? (
                <div className="text-center bg-white p-10 rounded-[30px] border border-gray-100 mt-4 shadow-sm"><Search size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-bold text-sm">لم نجد أي عروض تطابق بحثك حالياً.</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-transform flex flex-col relative group">
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                        className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm transition-colors"
                      >
                        <Heart size={16} className={favorites.includes(item.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'} />
                      </button>

                      <div className="h-32 relative bg-gray-100">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        
                        {item.is_golden && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-2 py-1 rounded-xl text-[10px] font-black shadow-sm flex items-center gap-1">
                            <Star size={10} className="fill-slate-900" /> ذهبي
                          </div>
                        )}
                        
                        <div className={`absolute ${item.is_golden ? 'top-8' : 'top-2'} right-2 bg-rose-500 text-white px-2 py-1 rounded-xl text-[10px] font-black shadow-sm transition-all`}>
                          -{item.original_price > 0 ? Math.round(((item.original_price - item.discounted_price) / item.original_price) * 100) : 0}%
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-black text-emerald-600 mb-1 flex items-center gap-1 truncate">
                            <Store size={10} /> {item.profiles?.shop_name || item.category}
                          </p>
                          <h3 className="font-black text-sm text-gray-900 leading-tight mb-2 line-clamp-2">{item.name}</h3>
                          
                          {item.start_date && item.end_date && (
                            <p className="text-[8px] text-gray-500 font-bold flex items-center gap-1 mt-1 bg-gray-50 w-fit px-1.5 py-0.5 rounded-md">
                              <Calendar size={8} className="text-orange-400" /> لغاية {item.end_date}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div>
                            <span className="block text-gray-400 text-[10px] line-through font-bold">{item.original_price} {item.currency || 'ل.س'}</span>
                            <span className="font-black text-emerald-700 text-base">{item.discounted_price} {item.currency || 'ل.س'}</span>
                          </div>
                          <div className="bg-gray-50 p-1.5 rounded-lg text-gray-500 border border-gray-100"><Clock size={14} /></div>
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

      {showFilter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-t-[40px] p-6 pb-10 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900">ترتيب العروض حسب</h2>
              <button onClick={() => setShowFilter(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 active:scale-90"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              {[
                { id: 'newest', label: 'الأحدث أولاً' },
                { id: 'price_low', label: 'السعر: من الأرخص للأغلى' },
                { id: 'price_high', label: 'السعر: من الأغلى للأرخص' }
              ].map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id); setShowFilter(false); }}
                  className={`w-full p-4 rounded-2xl text-right font-black text-sm transition-all flex justify-between items-center ${sortBy === opt.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  {opt.label}
                  {sortBy === opt.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="browse" />
    </div>
  )
}