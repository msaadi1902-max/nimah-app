'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, PlusCircle, Tag, Euro, Package, ListFilter } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('مطاعم')
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase.from('meals').insert([{
        name: name,
        category: category,
        original_price: parseFloat(originalPrice),
        discounted_price: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        is_approved: false,
        merchant_id: user?.id || 'unknown',
        image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop'
      }])

      if (error) throw error

      alert('تم إرسال العرض للإدارة بنجاح! 🎉 بانتظار الموافقة.')
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
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <h1 className="relative z-10 text-xl font-black">إضافة عرض جديد 📦</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-5">
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-[30px] p-8 text-center flex flex-col items-center justify-center text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors">
          <Upload size={32} className="mb-3 opacity-80" />
          <span className="text-sm font-black">اضغط لرفع صورة المنتج</span>
          <span className="text-[10px] text-gray-400 mt-1.5 font-bold">PNG, JPG (الحد الأقصى 2MB)</span>
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag size={14} className="text-emerald-500"/> اسم المنتج أو العرض
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="مثال: قميص قطني، عطر صيفي..." className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <ListFilter size={14} className="text-indigo-500"/> تصنيف المتجر
            </label>
            {/* القائمة الموسعة لتشمل كل السوق */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none">
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
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Euro size={14} className="text-rose-500"/> السعر الأصلي
              </label>
              <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} type="number" step="0.01" required placeholder="10.00" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Euro size={14} className="text-emerald-500"/> سعر العرض
              </label>
              <input value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} type="number" step="0.01" required placeholder="3.00" className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-sm outline-none focus:border-emerald-500 text-emerald-700 font-black" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Package size={14} className="text-blue-500"/> الكمية المتاحة (قطع/صناديق)
            </label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" required placeholder="مثال: 5" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all" />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 active:scale-95 transition-all mt-6 disabled:opacity-70">
          {loading ? 'جاري النشر...' : <><PlusCircle size={20} /> نشر العرض الآن</>}
        </button>
      </form>
    </div>
  )
}