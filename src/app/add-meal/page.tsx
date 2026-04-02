'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Utensils, DollarSign, Clock, Package, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [mealData, setMealData] = useState({
    name: '',
    original_price: '',
    discounted_price: '',
    quantity: '1',
    pickup_time: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('meals')
        .insert([
          {
            name: mealData.name,
            original_price: Number(mealData.original_price),
            discounted_price: Number(mealData.discounted_price),
            quantity: Number(mealData.quantity),
            pickup_time: mealData.pickup_time,
          }
        ])

      if (error) throw error

      alert('✅ تم إضافة الوجبة بنجاح!')
      router.push('/') 
    } catch (error: any) {
      alert('حدث خطأ أثناء الإضافة: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      <div className="bg-emerald-600 text-white p-6 rounded-b-[40px] shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">إضافة عرض جديد 🍱</h1>
          <div className="w-10"></div>
        </div>
        <p className="text-emerald-100 text-sm font-bold text-center">أضف الوجبات الزائدة لإنقاذها وتحويلها لأرباح</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-gray-900 mb-2">
            <Utensils size={16} className="text-emerald-600" /> اسم الوجبة / الصندوق
          </label>
          {/* تم تعديل لون الخط ليكون text-black */}
          <input 
            type="text" 
            required
            placeholder="مثال: صندوق معجنات مشكل"
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-base font-black text-black placeholder:text-gray-300 focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
            value={mealData.name}
            onChange={(e) => setMealData({...mealData, name: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-gray-900 mb-2">
              <DollarSign size={16} className="text-gray-500" /> السعر الأصلي
            </label>
            <input 
              type="number" 
              required
              placeholder="0.00"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-base font-black text-black placeholder:text-gray-300 focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
              value={mealData.original_price}
              onChange={(e) => setMealData({...mealData, original_price: e.target.value})}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-emerald-700 mb-2">
              <DollarSign size={16} className="text-emerald-600" /> سعر نِعمة
            </label>
            <input 
              type="number" 
              required
              placeholder="0.00"
              className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-base font-black text-black placeholder:text-emerald-300 focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
              value={mealData.discounted_price}
              onChange={(e) => setMealData({...mealData, discounted_price: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="flex items-center gap-2 text-sm font-black text-gray-900 mb-2">
              <Package size={16} className="text-emerald-600" /> الكمية
            </label>
            <input 
              type="number" 
              min="1"
              required
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-base font-black text-black text-center focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
              value={mealData.quantity}
              onChange={(e) => setMealData({...mealData, quantity: e.target.value})}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-gray-900 mb-2">
              <Clock size={16} className="text-emerald-600" /> وقت الاستلام
            </label>
            <input 
              type="text" 
              required
              placeholder="مثال: 08:00 م - 10:00 م"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-base font-black text-black placeholder:text-gray-300 focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
              value={mealData.pickup_time}
              onChange={(e) => setMealData({...mealData, pickup_time: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'جاري الإضافة...' : <><PlusCircle size={20} /> نشر العرض للمستخدمين</>}
        </button>
      </form>

      <BottomNav activeTab="home" />
    </div>
  )
}