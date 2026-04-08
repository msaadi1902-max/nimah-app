'use client'
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Store, MapPin, Phone, Image as ImageIcon, CheckCircle, Info, ArrowRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function RegisterMerchantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    store_name: '',
    owner_name: '',
    phone: '',
    category: 'Restaurant',
    address: '',
    city: 'دمشق', // افتراضي لسوريا أو يمكن تغييره لأوروبا
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // إرسال البيانات لجدول جديد سنسميه 'merchant_applications'
    const { error } = await supabase.from('merchant_applications').insert([
      { ...formData, status: 'pending' }
    ])

    if (!error) {
      setSubmitted(true)
      // بعد 3 ثواني نعيده لصفحة البروفايل
      setTimeout(() => router.push('/profile'), 3000)
    } else {
      alert('حدث خطأ: ' + error.message)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="bg-emerald-100 p-6 rounded-full mb-6 animate-bounce">
          <CheckCircle size={60} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">شكراً لانضمامك! 🎉</h1>
        <p className="text-gray-500 font-bold leading-relaxed">
          تم استلام طلبك بنجاح. فريق "نِعمة" سيتواصل معك خلال 24 ساعة لتفعيل حسابك ومنحك **أسبوع الإعلانات المجاني**.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      {/* الهيدر الجذاب */}
      <div className="p-8 bg-emerald-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black italic">كن شريكاً في "نِعمة" 🤝</h1>
        <p className="text-sm opacity-90 mt-1 font-bold">ابدأ ببيع منتجاتك وزيادة أرباحك اليوم</p>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* بطاقة العرض المجاني */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-[35px] shadow-lg text-white flex items-center gap-4 border-4 border-white">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Store size={30} />
          </div>
          <div>
            <h3 className="font-black text-lg leading-none tracking-tighter uppercase">هدية الانضمام! ✨</h3>
            <p className="text-[10px] font-bold mt-1 opacity-90 italic">أسبوع كامل من الإعلانات الممولة مجاناً عند تسجيلك الآن</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-5">
            
            {/* نوع النشاط */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">نوع المحل / المطعم</label>
              <select 
                className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Restaurant">مطعم 🍲</option>
                <option value="Bakery">مخبز 🥖</option>
                <option value="Market">سوبر ماركت 🛒</option>
                <option value="Mobile">محل موبايلات 📱</option>
                <option value="Clothes">محل ملابس 👕</option>
                <option value="General">أخرى 🛍️</option>
              </select>
            </div>

            {/* اسم المحل */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">اسم المحل التجاري</label>
              <div className="flex items-center bg-gray-50 rounded-2xl px-4">
                <input type="text" required placeholder="مثلاً: مطعم البركة"
                  className="w-full p-4 bg-transparent border-none font-bold text-sm"
                  onChange={(e) => setFormData({...formData, store_name: e.target.value})} />
                <Store size={18} className="text-gray-300" />
              </div>
            </div>

            {/* رقم التواصل */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">رقم الواتساب للتواصل</label>
              <div className="flex items-center bg-gray-50 rounded-2xl px-4">
                <input type="tel" required placeholder="+963 9xx xxx xxx"
                  className="w-full p-4 bg-transparent border-none font-bold text-sm text-left"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <Phone size={18} className="text-gray-300" />
              </div>
            </div>

            {/* العنوان */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">المدينة</label>
                <input type="text" required placeholder="مثلاً: دمشق"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm"
                  onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">الحي / الشارع</label>
                <input type="text" required placeholder="الميدان"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm"
                  onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            {/* ملاحظات إضافية */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 mr-2 uppercase italic">نبذة عن المحل / ملاحظات</label>
              <textarea rows={3} placeholder="اكتب هنا أي تفاصيل تود إطلاعنا عليها..."
                className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm resize-none"
                onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>

            {/* تنبيه الأمان والخصوصية */}
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3 text-emerald-700">
              <Info size={20} className="mt-1 flex-shrink-0" />
              <p className="text-[10px] font-bold leading-relaxed">
                بياناتك في أمان. عند الإرسال، ستقوم الإدارة بمراجعة الطلب وتجهيز اتفاقية توزيع الأرباح الخاصة بك.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-[25px] shadow-xl shadow-emerald-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
            >
              {loading ? 'جاري إرسال الطلب...' : 'إرسال طلب الانضمام 🚀'}
            </button>
          </div>
        </form>
      </div>
      <BottomNav activeTab="home" />
    </div>
  )
}