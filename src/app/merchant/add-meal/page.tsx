'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, PlusCircle, Tag, Euro, Package, ListFilter, Clock, ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('مطاعم')
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageName, setImageName] = useState('')
  // حالة تخزين الموقع الجغرافي
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)

  // جلب موقع التاجر فور فتح الصفحة
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.error("تعذر جلب الموقع:", error)
      )
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setImageName(e.target.files[0].name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول كتاجر.")

      let finalImageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop'
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile)
        if (uploadError) throw new Error('فشل رفع الصورة.')

        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
        finalImageUrl = publicUrlData.publicUrl
      }

      const pickupTimeFormatted = `${startTime} - ${endTime}`

      const { error } = await supabase.from('meals').insert([{
        name: name,
        category: category,
        original_price: parseFloat(originalPrice),
        discounted_price: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        pickup_time: pickupTimeFormatted,
        is_approved: false,
        merchant_id: user.id,
        image_url: finalImageUrl,
        // إضافة الإحداثيات الحقيقية للقاعدة
        lat: location?.lat || 33.5138,
        lng: location?.lng || 36.2765
      }])

      if (error) throw error

      alert('تم إرسال العرض للإدارة بنجاح! 🎉 سيتم تحديد موقعك على الخريطة تلقائياً.')
      router.back()
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg mb-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mt-10"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl active:scale-95 transition-transform"><ArrowRight size={20} /></button>
        <h1 className="relative z-10 text-xl font-black">إضافة منتج جديد 📦</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        <div onClick={() => fileInputRef.current?.click()} className="bg-white border-2 border-dashed border-emerald-200 rounded-[30px] p-8 text-center flex flex-col items-center justify-center text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          {imageFile ? (
            <>
              <div className="w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-sm">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-black text-gray-800 line-clamp-1">{imageName}</span>
              <span className="text-[10px] text-emerald-600 mt-1.5 font-bold">تم اختيار الصورة ✅</span>
            </>
          ) : (
            <>
              <Upload size={32} className="mb-3 opacity-80" />
              <span className="text-sm font-black">اضغط لرفع صورة المنتج</span>
              <span className="text-[10px] text-gray-400 mt-1.5 font-bold">PNG, JPG</span>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag size={14} className="text-emerald-500"/> اسم المنتج أو العرض</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="مثال: قميص قطني، عطر صيفي..." className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5"><ListFilter size={14} className="text-indigo-500"/> تصنيف المتجر</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
              <option value="مطاعم">مطاعم</option>
              <option value="مخابز">مخابز</option>
              <option value="حلويات">حلويات</option>
              <option value="بقالة">بقالة (سوبر ماركت)</option>
              <option value="ألبسة">ألبسة</option>
              <option value="عطور">عطور</option>
              <option value="عصرونية">عصرونية (أدوات منزلية)</option>
              <option value="موبايلات">موبايلات وإلكترونيات</option>
              <option value="أثاث">أثاث ومفروشات</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5"><Euro size={14} className="text-rose-500"/> السعر الأصلي</label><input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} type="number" step="0.01" required className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500" /></div>
            <div><label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5"><Euro size={14} className="text-emerald-500"/> سعر العرض</label><input value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} type="number" step="0.01" required className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-sm outline-none focus:border-emerald-500 text-emerald-700 font-black" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
            <div><label className="text-[10px] font-black text-gray-500 mb-1.5 flex items-center gap-1"><Clock size={12} className="text-amber-500"/> متاح من</label><input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" /></div>
            <div><label className="text-[10px] font-black text-gray-500 mb-1.5 flex items-center gap-1"><Clock size={12} className="text-rose-500"/> ينتهي في</label><input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-500" /></div>
          </div>
          <div><label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5"><Package size={14} className="text-blue-500"/> الكمية</label><input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" required className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500" /></div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70">
          {loading ? <><Loader2 className="animate-spin" size={20} /> جاري الرفع...</> : <><PlusCircle size={20} /> نشر العرض الآن</>}
        </button>
      </form>
    </div>
  )
}