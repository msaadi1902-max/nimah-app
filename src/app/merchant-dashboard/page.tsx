'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Utensils, Clock, Camera, ArrowRight } from 'lucide-react'

// إعداد الاتصال بقاعدة البيانات Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // حالة المنتج لجمع البيانات من الفورم
  const [product, setProduct] = useState({
    title: '',
    category: 'وجبات',
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    startTime: '18:00',
    endTime: '21:00',
    description: ''
  })

  // دالة الحفظ وإرسال البيانات إلى Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // دمج وقت البداية والنهاية في نص واحد
    const pickupTimeFormatted = `من ${product.startTime} إلى ${product.endTime}`

    // إرسال البيانات لجدول meals
    const { data, error } = await supabase
      .from('meals')
      .insert([
        {
          name: product.title,
          original_price: parseFloat(product.originalPrice),
          discounted_price: parseFloat(product.discountedPrice),
          quantity: parseInt(product.quantity),
          pickup_time: pickupTimeFormatted,
        }
      ])

    setLoading(false)

    if (error) {
      alert('❌ عذراً، حدث خطأ أثناء النشر: ' + error.message)
    } else {
      alert('✅ تم نشر العرض بنجاح وسيظهر للزبائن الآن!')
      // إعادة التوجيه للصفحة الرئيسية ليرى التاجر عرضه
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 text-right font-sans" dir="rtl">
      {/* هيدر لوحة التحكم */}
      <div className="bg-emerald-800 text-white p-6 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">لوحة تحكم التاجر 🏪</h1>
          <div className="w-10"></div>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-800 font-black text-xl">م</div>
          <div>
            <h2 className="font-black text-sm">مطعم السعدي الأصيل</h2>
            <p className="text-[10px] text-emerald-100 font-bold italic text-left">حالة الحساب: متجر معتمد ✅</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* قسم الصور */}
        <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <Camera size={32} />
          </div>
          <span className="font-black text-sm text-gray-700">اضغط لرفع صورة المنتج</span>
          <span className="text-[10px] text-gray-400 font-bold text-center">يفضل صور واضحة للوجبات لجذب الزبائن</span>
        </div>

        {/* تفاصيل المنتج */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">اسم العرض / الوجبة</label>
            <input 
              type="text" 
              required
              placeholder="مثال: صندوق معجنات مشكل"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-black font-black focus:border-emerald-600 focus:outline-none"
              value={product.title}
              onChange={(e) => setProduct({...product, title: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">السعر الأصلي (€)</label>
              <input 
                type="number" 
                required
                step="0.01"
                placeholder="10.00"
                className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-black font-black text-center"
                value={product.originalPrice}
                onChange={(e) => setProduct({...product, originalPrice: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black text-emerald-600 mb-2 mr-2 italic">سعر نِعمة (€)</label>
              <input 
                type="number" 
                required
                step="0.01"
                placeholder="3.00"
                className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-800 font-black text-center"
                value={product.discountedPrice}
                onChange={(e) => setProduct({...product, discountedPrice: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">الكمية المتوفرة (كم صندوق؟)</label>
            <input 
              type="number" 
              required
              placeholder="1"
              className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-black font-black focus:border-emerald-600 focus:outline-none"
              value={product.quantity}
              onChange={(e) => setProduct({...product, quantity: e.target.value})}
            />
          </div>
        </div>

        {/* قسم الأوقات */}
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Clock size={18} className="text-emerald-600" /> أوقات توفر الاستلام
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-black text-gray-400 block mb-1">من الساعة</span>
              <input 
                type="time" 
                required
                className="w-full bg-gray-50 rounded-xl p-3 font-black text-center border border-gray-100"
                value={product.startTime}
                onChange={(e) => setProduct({...product, startTime: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-gray-400 block mb-1">إلى الساعة</span>
              <input 
                type="time" 
                required
                className="w-full bg-gray-50 rounded-xl p-3 font-black text-center border border-gray-100"
                value={product.endTime}
                onChange={(e) => setProduct({...product, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* زر الحجز والرفع */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'جاري النشر وتحديث البيانات...' : <><PlusCircle size={22} /> انشر العرض الآن 🚀</>}
        </button>
      </form>
    </div>
  )
}