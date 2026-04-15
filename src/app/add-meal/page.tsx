'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, PlusCircle, Tag, Euro, Package, ListFilter, CheckCircle2, Clock, Loader2, Coins, Calendar } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // الحالات الأساسية
  const [name, setName] = useState('')
  const [category, setCategory] = useState('مطاعم')
  const [currency, setCurrency] = useState('ل.س') // تم تحويله لنص حر يكتبه التاجر
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  
  // حالات الوقت والتاريخ المدمجة
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [pickupTime, setPickupTime] = useState('')
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // ميزة المعاينة الحية

  // دالة التقاط الصورة ومعاينتها
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

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
      
      // 2. حفظ بيانات العرض في قاعدة البيانات مع الحقول المحدثة
      const { error } = await supabase.from('meals').insert([{
        name: name,
        category: category,
        currency: currency, // إضافة العملة التي كتبها التاجر
        original_price: parseFloat(originalPrice),
        discounted_price: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        start_date: startDate, // تاريخ بداية العرض
        end_date: endDate, // تاريخ نهاية العرض
        pickup_time: pickupTime, 
        is_approved: false, 
        merchant_id: user.id,
        image_url: publicUrl.publicUrl
      }])

      if (error) throw error

      alert('تم إرسال العرض للإدارة بنجاح! 🎉 سيظهر في السوق فور الموافقة عليه.')
      router.push('/merchant-dashboard')
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الأنيق (تصميمك) */}
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
        
        {/* مربع رفع الصورة (مع المعاينة الحية المدمجة) */}
        <div className="relative group overflow-hidden bg-white border-2 border-dashed border-emerald-200 rounded-[30px] p-8 text-center flex flex-col items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
            required={!file} 
          />
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10 rounded-[28px] opacity-90 group-hover:opacity-70 transition-opacity" />
          ) : (
            <>
              <Upload size={32} className="mb-3 opacity-80" />
              <span className="text-sm font-black text-gray-800">اضغط لرفع صورة المنتج</span>
              <span className="text-[10px] text-gray-400 mt-1.5 font-bold">PNG, JPG (يُفضل صور واضحة ومغرية)</span>
            </>
          )}
          {file && !previewUrl && <CheckCircle2 size={36} className="mb-3 text-emerald-500 z-10" />}
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 space-y-4">
          
          {/* اسم المنتج */}
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-emerald-500"/> اسم المنتج أو العرض
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="مثال: قميص قطني، وجبة شاورما..." className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
          </div>

          {/* التصنيف والعملة */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ListFilter size={14} className="text-indigo-500"/> التصنيف
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
                <option value="آخر">آخر</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-500"/> العملة 
              </label>
              {/* تم تحويله لحقل إدخال حر كما طلبت */}
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} type="text" required placeholder="مثال: ليرة، دولار..." className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
            </div>
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

          {/* الكمية */}
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-blue-500"/> الكمية المتاحة
            </label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" required placeholder="مثال: 5" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
          </div>

          {/* التاريخ والوقت (التحسينات الجديدة) */}
          <div className="border-t border-gray-100 pt-4 mt-2">
             <label className="text-xs font-black text-gray-700 mb-3 flex items-center gap-1.5">
               <Calendar size={14} className="text-orange-500"/> الأيام المتاحة للعرض
             </label>
             <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">من تاريخ</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-black outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">إلى تاريخ</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-black outline-none focus:border-emerald-500" />
                </div>
             </div>
             <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-1 flex items-center gap-1"><Clock size={12}/> وقت الاستلام في هذه الأيام</span>
                <input value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} type="text" required placeholder="مثال: من 10:00 ص إلى 10:00 م" className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all" />
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