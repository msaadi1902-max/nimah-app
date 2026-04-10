'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Utensils, DollarSign, Package, Image as ImageIcon, PlusCircle, Loader2, Store, Clock } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'مطاعم', // تم التعديل لتطابق الصفحة الرئيسية
    original_price: '',
    discounted_price: '',
    quantity: '',
    image_url: '',
    pickup_time: '18:00 - 21:00'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("يجب تسجيل الدخول أولاً.")
        router.push('/welcome')
        return
      }

      const { error } = await supabase.from('meals').insert([{
        name: formData.name,
        category: formData.category,
        original_price: parseFloat(formData.original_price),
        discounted_price: parseFloat(formData.discounted_price),
        quantity: parseInt(formData.quantity),
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        pickup_time: formData.pickup_time,
        merchant_id: user.id,
        is_approved: false // تذهب للإدارة أولاً
      }])

      if (error) throw error

      alert("🎉 تم إرسال العرض بنجاح! سيظهر للزبائن بمجرد موافقة الإدارة.")
      router.push('/merchant')

    } catch (error: any) {
      alert("حدث خطأ أثناء الإضافة: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans pb-10" dir="rtl">
      
      <div className="bg-emerald-800 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform"><ArrowRight size={20} /></button>
          <h1 className="text-xl font-black flex items-center gap-2 italic underline decoration-emerald-400">إضافة عرض جديد 🍲</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        
        {/* الصف الأول: الاسم والتصنيف */}
        <div className="flex gap-4">
          <div className="flex-[2] bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">اسم المنتج</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <Utensils className="text-emerald-600" size={18} />
              <input required type="text" placeholder="مثلاً: صندوق شاورما..." className="bg-transparent flex-1 text-sm outline-none font-bold" 
                     onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          
          <div className="flex-[1] bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">التصنيف</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <Store className="text-emerald-600" size={18} />
              <select className="bg-transparent flex-1 text-sm outline-none font-bold w-full"
                      onChange={(e) => setFormData({...formData, category: e.target.value})} value={formData.category}>
                <option value="مطاعم">مطاعم</option>
                <option value="مخابز">مخابز</option>
                <option value="حلويات">حلويات</option>
                <option value="بقالة">بقالة</option>
              </select>
            </div>
          </div>
        </div>

        {/* الصف الثاني: الأسعار */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">السعر الأصلي (€)</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <DollarSign className="text-gray-400" size={18} />
              <input required type="number" step="0.01" placeholder="10.00" className="bg-transparent flex-1 text-sm outline-none font-bold text-gray-400 line-through" 
                     onChange={(e) => setFormData({...formData, original_price: e.target.value})} />
            </div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 border-emerald-100">
            <label className="text-xs font-black text-emerald-600 mb-2 block">السعر المخفض (€)</label>
            <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-2xl">
              <DollarSign className="text-emerald-600" size={18} />
              <input required type="number" step="0.01" placeholder="5.50" className="bg-transparent flex-1 text-sm outline-none font-black text-emerald-800" 
                     onChange={(e) => setFormData({...formData, discounted_price: e.target.value})} />
            </div>
          </div>
        </div>

        {/* الصف الثالث: الكمية ووقت الاستلام */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">الكمية</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <Package className="text-emerald-600" size={18} />
              <input required type="number" placeholder="5" min="1" className="bg-transparent flex-1 text-sm outline-none font-bold" 
                     onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
          </div>
          <div className="flex-[2] bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <label className="text-xs font-black text-gray-400 mb-2 block">وقت الاستلام</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
              <Clock className="text-emerald-600" size={18} />
              <input required type="text" placeholder="18:00 - 21:00" className="bg-transparent flex-1 text-sm outline-none font-bold text-left" dir="ltr"
                     onChange={(e) => setFormData({...formData, pickup_time: e.target.value})} value={formData.pickup_time} />
            </div>
          </div>
        </div>

        {/* الصف الرابع: الصورة */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-2 block">رابط الصورة (اختياري)</label>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl">
            <ImageIcon className="text-emerald-600" size={18} />
            <input type="text" placeholder="https://..." className="bg-transparent flex-1 text-sm outline-none font-bold text-left" dir="ltr"
                   onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white p-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all mt-4">
          {loading ? <Loader2 className="animate-spin" /> : <><PlusCircle size={22} /> إرسال العرض للإدارة</>}
        </button>
      </form>
    </div>
  )
}