'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Clock, Camera, ArrowRight, Loader2, ListFilter } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['مطاعم', 'مخابز', 'حلويات', 'بقالة', 'عصرونية', 'ألبسة', 'عطور', 'موبايلات', 'أثاث']

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [merchantName, setMerchantName] = useState('جاري التحميل...')
  
  // حالات الصورة
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // بيانات المنتج
  const [product, setProduct] = useState({
    title: '',
    category: 'مطاعم', // القيمة الافتراضية للتصنيف
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    startTime: '18:00',
    endTime: '21:00'
  })

  // جلب اسم التاجر الفعلي لعرضه في الهيدر الفخم
  useEffect(() => {
    const fetchMerchantData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (data?.full_name) setMerchantName(data.full_name)
      }
    }
    fetchMerchantData()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return alert("يرجى التقاط أو رفع صورة للمنتج 📸")
    
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول كتاجر")

      let imageUrl = ''

      // 1. رفع الصورة الحقيقية للسحابة
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('product-images') // السلة المعتمدة لدينا
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
      imageUrl = publicUrl

      // 2. رفع البيانات للجداول مع ربطها بالتاجر
      const { error } = await supabase
        .from('meals')
        .insert([{
          merchant_id: user.id,
          name: product.title,
          category: product.category,
          original_price: parseFloat(product.originalPrice),
          discounted_price: parseFloat(product.discountedPrice),
          quantity: parseInt(product.quantity),
          pickup_time: `من ${product.startTime} إلى ${product.endTime}`,
          image_url: imageUrl,
          is_approved: false // بانتظار موافقة الإدارة
        }])

      if (error) throw error
      
      alert('✅ تم إرسال العرض للإدارة بصورتك الحقيقية!')
      router.push('/')
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 text-right font-sans" dir="rtl">
      
      {/* هيدر لوحة التحكم الفخم (تصميمك بالكامل) */}
      <div className="bg-emerald-800 text-white p-6 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">لوحة تحكم التاجر 🏪</h1>
          <div className="w-10"></div>
        </div>
        
        {/* بطاقة معلومات التاجر */}
        <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-800 font-black text-xl shadow-inner">
            {merchantName.charAt(0)}
          </div>
          <div>
            <h2 className="font-black text-sm">{merchantName}</h2>
            <p className="text-[10px] text-emerald-100 font-bold italic text-left">حالة الحساب: متجر معتمد ✅</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        
        {/* قسم الكاميرا ومعاينة الصورة (ميزتك الرائعة) */}
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[160px] overflow-hidden hover:bg-emerald-50 transition-colors shadow-sm">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-40 object-cover rounded-2xl shadow-sm" alt="Preview" />
            ) : (
              <>
                <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Camera size={32} /></div>
                <span className="font-black text-sm text-gray-700">اضغط لالتقاط صورة للوجبة</span>
                <span className="text-[10px] text-gray-400 font-bold text-center">يفضل صور واضحة لجذب الزبائن</span>
              </>
            )}
          </div>
        </div>

        {/* تفاصيل المنتج مع خطوط واضحة */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">اسم العرض / الوجبة</label>
            <input type="text" required placeholder="مثال: صندوق معجنات مشكل" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm transition-all" 
              onChange={(e) => setProduct({...product, title: e.target.value})} />
          </div>

          {/* حقل التصنيف المدمج بتصميمك */}
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic flex items-center gap-1">
               <ListFilter size={14} className="text-emerald-500"/> التصنيف
            </label>
            <select required value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm appearance-none transition-all cursor-pointer">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">السعر الأصلي (€)</label>
              <input type="number" required step="0.01" placeholder="10.00" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black text-center focus:border-emerald-600 focus:outline-none shadow-sm transition-all"
                onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black text-emerald-600 mb-2 mr-2 italic">سعر نِعمة (€)</label>
              <input type="number" required step="0.01" placeholder="3.00" className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-900 font-black text-center focus:border-emerald-600 focus:outline-none shadow-sm transition-all"
                onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">الكمية المتوفرة</label>
            <input type="number" required min="1" placeholder="1" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm transition-all"
              onChange={(e) => setProduct({...product, quantity: e.target.value})} />
          </div>
        </div>

        {/* الأوقات */}
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm"><Clock size={18} className="text-emerald-600" /> أوقات توفر الاستلام</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-black text-gray-400 block mb-1">من الساعة</span>
              <input type="time" required value={product.startTime} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, startTime: e.target.value})} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-gray-400 block mb-1">إلى الساعة</span>
              <input type="time" required value={product.endTime} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, endTime: e.target.value})} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-5 rounded-[25px] font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-70">
          {loading ? <Loader2 className="animate-spin" /> : 'انشر العرض بالصورة 🚀'}
        </button>
      </form>
    </div>
  )
}