'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Utensils, DollarSign, Package, Image as ImageIcon, PlusCircle, Loader2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // حالة البيانات في النموذج
  const [formData, setFormData] = useState({
    name: '',
    original_price: '',
    discounted_price: '',
    quantity: '',
    image_url: '',
    pickup_time: '18:00 - 21:00' // قيمة افتراضية
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // إرسال البيانات إلى جدول meals في Supabase
    const { error } = await supabase.from('meals').insert([{
      name: formData.name,
      original_price: parseFloat(formData.original_price),
      discounted_price: parseFloat(formData.discounted_price),
      quantity: parseInt(formData.quantity),
      image_url: formData.image_url,
      pickup_time: formData.pickup_time
    }])

    if (error) {
      alert("حدث خطأ أثناء الإضافة: " + error.message)
    } else {
      alert("🎉 يا بطل! الوجبة الآن معروضة للجميع في الصفحة الرئيسية.")
      router.push('/merchant') // العودة للوحة التحكم
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans pb-10" dir="rtl">
      {/* الهيدر */}
      <div className="bg-emerald-800 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl"><ArrowRight size={20} /></button>
          <h1 className="text-xl font-black flex items-center gap-2 italic underline decoration-emerald-400">إضافة وجبة جديدة 🍲</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        {/* اسم الوجبة */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-2 block">اسم الوجبة</label>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
            <Utensils className="text-emerald-600" size={18} />
            <input required type="text" placeholder="مثلاً: صندوق شاورما عائلي" className="bg-transparent flex-1 text-sm outline-none font-bold" 
                   onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
        </div>

        {/* السعر والكمية */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">السعر المخفض (€)</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <DollarSign className="text-emerald-600" size={18} />
              <input required type="number" step="0.01" placeholder="5.50" className="bg-transparent flex-1 text-sm outline-none font-bold" 
                     onChange={(e) => setFormData({...formData, discounted_price: e.target.value})} />
            </div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">الكمية المتوفرة</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <Package className="text-emerald-600" size={18} />
              <input required type="number" placeholder="5" className="bg-transparent flex-1 text-sm outline-none font-bold" 
                     onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
          </div>
        </div>

        {/* رابط الصورة */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-2 block">رابط صورة الوجبة (URL)</label>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
            <ImageIcon className="text-emerald-600" size={18} />
            <input required type="text" placeholder="https://..." className="bg-transparent flex-1 text-sm outline-none font-bold" 
                   onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-bold italic">* حالياً استخدم روابط صور من جوجل أو Unsplash</p>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-800 text-white p-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
          {loading ? <Loader2 className="animate-spin" /> : <><PlusCircle size={22} /> نشر العرض الآن</>}
        </button>
      </form>
    </div>
  )
}