'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Package, Tag, Clock, Info, Store } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [offerType, setOfferType] = useState<'box' | 'deal'>('box') // box: صندوق مفاجآت, deal: عرض تجاري
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    quantity: 1,
    category: 'Bakery',
    start_time: '19:00',
    end_time: '21:00'
  })

  // تحديث تلقائي للاسم إذا كان "صندوق مفاجآت"
  useEffect(() => {
    if (offerType === 'box') {
      setFormData(prev => ({ ...prev, name: 'صندوق نِعمة للمفاجآت 🎁' }))
    } else {
      setFormData(prev => ({ ...prev, name: '' }))
    }
  }, [offerType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('meals').insert([
      { 
        ...formData, 
        user_id: user?.id,
        is_rescue_meal: offerType === 'box', // الصندوق يعتبر وجبة إنقاذ دائماً
        price: parseFloat(formData.price),
        original_price: parseFloat(formData.original_price)
      }
    ])

    if (!error) {
      alert('تم نشر العرض بنجاح! 🚀')
      router.push('/')
    } else {
      alert('خطأ: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      <div className="p-8 bg-emerald-600 text-white rounded-b-[50px] shadow-xl">
        <h1 className="text-2xl font-black">أنشئ عرضاً جديداً 📢</h1>
        <p className="text-sm opacity-80 mt-1 text-emerald-100 font-bold">اختر نوع العرض الذي تود نشره للزبائن</p>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* اختيار نوع العرض - Switcher */}
        <div className="bg-white p-2 rounded-[30px] shadow-lg flex gap-2 border border-emerald-50">
          <button 
            onClick={() => setOfferType('box')}
            className={`flex-1 py-4 rounded-[25px] font-black text-sm flex items-center justify-center gap-2 transition-all ${offerType === 'box' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            <Package size={18} /> صندوق مفاجآت
          </button>
          <button 
            onClick={() => setOfferType('deal')}
            className={`flex-1 py-4 rounded-[25px] font-black text-sm flex items-center justify-center gap-2 transition-all ${offerType === 'deal' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            <Tag size={18} /> عرض تجاري
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-5">
            
            {/* إرشادات نوع العرض */}
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 text-blue-700">
              <Info size={20} className="mt-1 flex-shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                {offerType === 'box' 
                  ? "صندوق المفاجآت: يجمع فائض الطعام بسعر مخفض جداً. الزبون يحجز الصندوق ويستلمه في الوقت المحدد."
                  : "العرض التجاري: أعلن عن تخفيضات على منتجات معينة (هواتف، ملابس، مكتبة) لزيادة المبيعات."}
              </p>
            </div>

            {/* تفاصيل العرض */}
            <div>
              <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">القسم</label>
              <select 
                className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-700"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Bakery">مخابز 🥖</option>
                <option value="Restaurants">مطاعم 🍲</option>
                <option value="Supermarket">ماركت 🛒</option>
                <option value="Mobile">موبايلات 📱</option>
                <option value="Clothes">ملابس 👕</option>
                <option value="Stationery">مكتبة 📚</option>
              </select>
            </div>

            {offerType === 'deal' && (
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">اسم المنتج</label>
                <input type="text" required placeholder="مثلاً: ايفون 15 برو ماكس"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">سعر العرض (€)</label>
                <input type="number" step="0.01" required placeholder="5.00"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold"
                  onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">السعر الأصلي (€)</label>
                <input type="number" step="0.01" required placeholder="15.00"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold"
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">الكمية المتاحة</label>
                <input type="number" required placeholder="10"
                  className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold"
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 mr-2 uppercase">وقت الاستلام</label>
                <div className="flex items-center bg-gray-50 rounded-2xl px-2">
                  <input type="time" className="w-full p-4 bg-transparent border-none font-bold text-xs"
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                  <Clock size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-[25px] shadow-xl shadow-emerald-100 active:scale-95 transition-all text-lg"
            >
              {loading ? 'جاري النشر...' : 'انشر العرض الآن 🚀'}
            </button>
          </div>
        </form>
      </div>
      <BottomNav activeTab="profile" />
    </div>
  )
}