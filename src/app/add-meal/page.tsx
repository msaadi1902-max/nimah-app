'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, PlusCircle, Tag, Euro, Package, ListFilter, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // الحالات (States)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('مطاعم')
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert("يرجى رفع صورة للمنتج لتشجيع الزبائن على الشراء 📸")

    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول كتاجر أولاً")

      // 1. رفع الصورة الحقيقية إلى Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // جلب الرابط العام للصورة
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(fileName)
      
      // 2. حفظ بيانات العرض في قاعدة البيانات مع رابط الصورة الفعلي
      const { error } = await supabase.from('meals').insert([{
        name: name,
        category: category,
        original_price: parseFloat(originalPrice),
        discounted_price: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        pickup_time: pickupTime, // تمت إضافة وقت الاستلام
        is_approved: false, // يحتاج موافقة الإدارة (أنت)
        merchant_id: user.id,
        image_url: publicUrl.publicUrl
      }])

      if (error) throw error

      alert('تم إرسال العرض للإدارة بنجاح! 🎉 سيظهر في السوق فور الموافقة عليه.')
      router.push('/merchant-dashboard') // توجيهه للوحة التاجر بدلاً من الخلف فقط
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الأنيق */}
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg mb-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mt-10"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 text-center flex-1">
           <h1 className="text-xl font-black">إضافة عرض جديد 📦</h1>
           <p className="text-[10px] font-bold text-emerald-100 mt-1">أنقذ الفائض وحوله لأرباح</p>
        </div>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        
        {/* مربع رفع الصورة (أصبح يعمل حقيقياً) */}
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-[30px] p-8 text-center flex flex-col items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors relative overflow-hidden group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            required 
          />
          {file ? <CheckCircle2 size={36} className="mb-3 text-emerald-500" /> : <Upload size={32} className="mb-3 opacity-80" />}
          <span className="text-sm font-black text-gray-800">{file ? "تم إرفاق الصورة بنجاح ✅" : "اضغط لرفع صورة المنتج"}</span>
          <span className="text-[10px] text-gray-400 mt-1.5 font-bold">PNG, JPG (يُفضل صور واضحة ومغرية)</span>
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 space-y-4">
          
          {/* اسم المنتج */}
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-emerald-500"/> اسم المنتج أو العرض
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="مثال: قميص قطني، وجبة شاورما..." className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
          </div>

          {/* التصنيف (القائمة الموسعة) */}
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <ListFilter size={14} className="text-indigo-500"/> تصنيف المتجر
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all cursor-pointer">
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

          {/* الأسعار */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Euro size={14} className="text-rose-500"/> السعر الأصلي
              </label>
              <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} type="number" step="0.01" required placeholder="10.00" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-black text-emerald-700 mb-1.5 flex items-center gap-1.5">
                <Euro size={14} className="text-emerald-500"/> سعر العرض
              </label>
              <input value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} type="number" step="0.01" required placeholder="3.00" className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-sm outline-none focus:border-emerald-500 text-emerald-700 font-black shadow-inner" />
            </div>
          </div>

          {/* الكمية ووقت الاستلام */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Package size={14} className="text-blue-500"/> الكمية المتاحة
              </label>
              <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" required placeholder="مثال: 5" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-orange-500"/> وقت الاستلام
              </label>
              <input value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} type="text" required placeholder="مثال: 10:00 م" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 flex justify-center items-center gap-2 active:scale-95 transition-all mt-6 disabled:opacity-70">
          {loading ? <Loader2 className="animate-spin" /> : <><PlusCircle size={20} /> نشر العرض في السوق</>}
        </button>
      </form>

      <BottomNav activeTab="profile" />
    </div>
  )
}