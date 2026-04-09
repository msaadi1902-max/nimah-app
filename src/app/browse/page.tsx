'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Search, Map as MapIcon, List, SlidersHorizontal, Store, Utensils, ShoppingCart, Flower2, Clock } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = [
  { id: 'الكل', name: 'الكل', icon: Store },
  { id: 'مطعم', name: 'مطاعم', icon: Utensils },
  { id: 'ماركت', name: 'سوبر ماركت', icon: ShoppingCart },
  { id: 'مخبز', name: 'مخابز', icon: Store },
  { id: 'ورد', name: 'زهور وهدايا', icon: Flower2 },
]

export default function BrowsePage() {
  const [view, setView] = useState<'map' | 'list'>('list') // جعلنا القائمة هي الافتراضية
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase.from('meals').select('*').eq('is_approved', true).order('id', { ascending: false })

    if (activeCategory !== 'الكل') query = query.eq('category', activeCategory)
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)

    const { data } = await query
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-right" dir="rtl">
      
      {/* الهيدر وشريط البحث */}
      <div className="bg-white px-4 pt-10 pb-4 sticky top-0 z-20 shadow-sm rounded-b-3xl">
        <h1 className="text-2xl font-black text-gray-900 mb-4 px-2">استكشف السوق 🌍</h1>
        <div className="flex gap-2 mb-4">
          <button className="bg-gray-50 p-3 rounded-2xl text-emerald-700 border border-gray-100 active:scale-95 transition-transform">
            <SlidersHorizontal size={22} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن متجر أو منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
            <Search size={20} className="absolute right-4 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* زر التبديل بين خريطة وقائمة (تصميمك القديم الرائع) */}
        <div className="flex bg-gray-100 rounded-2xl p-1 relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-800 rounded-xl transition-all duration-300 ease-in-out shadow-sm ${
              view === 'map' ? 'right-1' : 'right-[calc(50%+3px)]'
            }`}
          ></div>
          <button onClick={() => setView('map')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'map' ? 'text-white' : 'text-gray-500'}`}>
            <MapIcon size={18} /> الخريطة
          </button>
          <button onClick={() => setView('list')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${view === 'list' ? 'text-white' : 'text-gray-500'}`}>
            <List size={18} /> القائمة
          </button>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div className="w-full">
        {view === 'map' ? (
          // عرض الخريطة
          <div className="relative w-full h-[calc(100vh-240px)] bg-emerald-50 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
            <div className="absolute top-[30%] right-[25%] bg-emerald-800 text-white w-12 h-12 rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-xl">5</div>
            <div className="absolute top-[50%] right-[60%] bg-emerald-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-xl">2</div>
            <div className="absolute top-[45%] right-[40%] w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-md relative">
               <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
          </div>
        ) : (
          // عرض القائمة (سوق الجميع)
          <div className="animate-in fade-in duration-300">
            {/* شريط التصنيفات */}
            <div className="px-4 py-4 flex gap-3 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap font-black text-sm transition-all ${
                      isActive ? 'bg-emerald-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-300' : 'text-gray-400'} />
                    {cat.name}
                  </button>
                )
              })}
            </div>

            {/* شبكة المنتجات المعتمدة */}
            <div className="p-4 pt-0">
              {loading ? (
                <div className="flex justify-center py-20 text-emerald-600 font-bold animate-pulse">جاري البحث... 🔍</div>
              ) : items.length === 0 ? (
                <div className="text-center bg-white p-10 rounded-[30px] border border-gray-100 mt-4">
                  <Search size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-bold text-sm">لم نجد أي منتجات تطابق بحثك حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {items.map((item) => (
                    <Link href={`/offer/${item.id}`} key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
                      <div className="h-32 relative bg-gray-100">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded-xl text-[10px] font-black shadow-sm">
                          -{(100 - (item.discounted_price / item.original_price * 100)).toFixed(0)}%
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] font-black text-emerald-600 mb-1">{item.category}</p>
                        <h3 className="font-black text-sm text-gray-900 leading-tight mb-2 truncate">{item.name}</h3>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="block text-gray-400 text-[10px] line-through font-bold">{item.original_price} €</span>
                            <span className="font-black text-emerald-700 text-base">{item.discounted_price} €</span>
                          </div>
                          <div className="bg-gray-50 p-1.5 rounded-lg text-gray-500">
                            <Clock size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav activeTab="browse" />
    </div>
  )
}