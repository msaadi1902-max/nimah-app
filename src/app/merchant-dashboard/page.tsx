'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Clock, Camera, ArrowRight, Loader2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [product, setProduct] = useState({
    title: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    startTime: '18:00',
    endTime: '21:00'
  })

  // دالة فتح استوديو الهاتف واختيار الصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file)) // عرض الصورة في نفس الصفحة مؤقتاً
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = ''

      // 1. رفع الصورة الحقيقية إلى Supabase
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('meal-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage.from('meal-images').getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      // 2. حفظ الوجبة مع رابط الصورة
      const { error } = await supabase
        .from('meals')
        .insert([{
          name: product.title,
          original_price: parseFloat(product.originalPrice),
          discounted_price: parseFloat(product.discountedPrice),
          quantity: parseInt(product.quantity),
          pickup_time: `من ${product.startTime} إلى ${product.endTime}`,
          image_url: imageUrl
        }])

      if (error) throw error
      
      alert('✅ تم نشر العرض بصورتك الحقيقية!')
      router.push('/')
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 text-right font-sans" dir="rtl">
      <div className="bg-emerald-800 text-white p-6 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">لوحة تحكم التاجر 🏪</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* الزر السحري الذي يفتح الكاميرا/الاستوديو */}
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[160px] overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-40 object-cover rounded-2xl" alt="Preview" />
            ) : (
              <>
                <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Camera size={32} /></div>
                <span className="font-black text-sm text-gray-700">اضغط لالتقاط أو اختيار صورة</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <input type="text" required placeholder="اسم الوجبة" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 font-black" 
            onChange={(e) => setProduct({...product, title: e.target.value})} />
          
          <div className="flex gap-4">
            <input type="number" required placeholder="السعر الأصلي" className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-4 font-black text-center"
              onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
            <input type="number" required placeholder="سعر نِعمة" className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 font-black text-center"
              onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
          </div>

          <input type="number" required placeholder="الكمية المتوفرة" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 font-black"
            onChange={(e) => setProduct({...product, quantity: e.target.value})} />
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm"><Clock size={18} className="text-emerald-600" /> أوقات توفر الاستلام</h3>
          <div className="flex items-center gap-4">
            <input type="time" required className="flex-1 bg-gray-50 rounded-xl p-3 font-black text-center border border-gray-100" onChange={(e) => setProduct({...product, startTime: e.target.value})} />
            <input type="time" required className="flex-1 bg-gray-50 rounded-xl p-3 font-black text-center border border-gray-100" onChange={(e) => setProduct({...product, endTime: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-5 rounded-[25px] font-black text-lg flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : 'انشر العرض بالصورة 🚀'}
        </button>
      </form>
    </div>
  )
}