'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Utensils, DollarSign, Clock, Package, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// ربط قاعدة البيانات
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // بيانات الوجبة
  const [mealData, setMealData] = useState({
    name: '',
    original_price: '',
    discounted_price: '',
    quantity: '1',
    pickup_time: ''
  })

  // دالة الإرسال لقاعدة البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // إدخال البيانات في جدول meals (تأكد أن الجدول موجود في Supabase بنفس الاسم)
      const { error } = await supabase
        .from('meals')
        .insert([
          {
            name: mealData.name,
            original_price: Number(mealData.original_price),
            discounted_price: Number(mealData.discounted_price),
            quantity: Number(mealData.quantity),
            pickup_time: mealData.pickup_time,
            // merchant_id: سنقوم بربطه لاحقاً بمعرف التاجر الفعلي
          }
        ])

      if (error) throw error

      alert('✅ تم إضافة الوجبة بنجاح!')
      router.push('/') // العودة للصفحة الرئيسية بعد الإضافة
    } catch (error: any) {
      alert('حدث خطأ أثناء الإضافة: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      {/* الهيدر */}
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

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        
        {/* اسم الوجبة */}
        <div>
          <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
            <Utensils size={16} className="text-emerald-500" /> اسم الوجبة / الصندوق
          </label>
          <input 
            type="text" 
            required
            placeholder="مثال: صندوق معجنات مشكل"
            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
            value={mealData.name}
            onChange={(e) => setMealData({...mealData, name: e.target.value})}
          />
        </div>

        {/* الأسعار */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
              <DollarSign size={16} className="text-gray-400" /> السعر الأصلي
            </label>
            <input 
              type="number" 
              required
              placeholder="0.00"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-colors shadow-sm line-through text-gray-400"
              value={mealData.original_price}
              onChange={(e) => setMealData({...mealData, original_price: e.target.value})}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
              <DollarSign size={16} className="text-emerald-500" /> سعر نِعمة (مخفض)
            </label>
            <input 
              type="number" 
              required
              placeholder="0.00"
              className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-colors shadow-sm text-emerald-700"
              value={mealData.discounted_price}
              onChange={(e) => setMealData({...mealData, discounted_price: e.target.value})}
            />
          </div>
        </div>

        {/* الكمية والوقت */}
        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
              <Package size={16} className="text-emerald-500" /> الكمية
            </label>
            <input 
              type="number" 
              min="1"
              required
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-colors shadow-sm text-center"
              value={mealData.quantity}
              onChange={(e) => setMealData({...mealData, quantity: e.target.value})}
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2">
              <Clock size={16} className="text-emerald-500" /> وقت الاستلام
            </label>
            <input 
              type="text" 
              required
              placeholder="مثال: 08:00 م - 10:00 م"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-colors shadow-sm"
              value={mealData.pickup_time}
              onChange={(e) => setMealData({...mealData, pickup_time: e.target.value})}
            />
          </div>
        </div>

        {/* زر الإرسال */}
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