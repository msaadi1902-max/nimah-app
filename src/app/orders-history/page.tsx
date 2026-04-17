'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShoppingBag, Calendar, CheckCircle, Clock, Search, Loader2, Star, MessageSquare, X } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // حالات نافذة التقييم المنبثقة
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ratings, setRatings] = useState({
    quality: 5,
    service: 5,
    cleanliness: 5,
    comment: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          meals (id, name, image_url, category, merchant_id, currency)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
    }
    setLoading(false)
  }

  // فتح نافذة التقييم
  const handleRateOrder = (order: any) => {
    setSelectedOrder(order)
    setShowRatingModal(true)
  }

  // إرسال التقييم لقاعدة البيانات
  const submitReview = async () => {
    if (!selectedOrder) return
    setSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('reviews').insert([{
      user_id: user?.id,
      merchant_id: selectedOrder.meals.merchant_id, // ربط التقييم بالتاجر
      meal_id: selectedOrder.meal_id, // ربط التقييم بالوجبة
      rating: (ratings.quality + ratings.service + ratings.cleanliness) / 3, // حساب المعدل تلقائياً
      quality_rating: ratings.quality,
      service_rating: ratings.service,
      cleanliness_rating: ratings.cleanliness,
      review_comment: ratings.comment
    }])

    if (!error) {
      alert('✅ شكراً لتقييمك! رأيك يساعدنا على تحسين جودة السوق.')
      setShowRatingModal(false)
      setRatings({ quality: 5, service: 5, cleanliness: 5, comment: '' }) // تفريغ الخانات
    } else {
      alert('❌ حدث خطأ أثناء إرسال التقييم: ' + error.message)
    }
    setSubmitting(false)
  }

  // مكون النجوم المخصص للتقييم
  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="flex flex-col gap-2 mb-4">
      <span className="text-xs font-black text-gray-500 mr-1">{label}</span>
      <div className="flex gap-2 justify-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={28}
            onClick={() => onChange(star)}
            className={`cursor-pointer transition-all active:scale-90 ${star <= value ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-gray-200'}`}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الخاص بك */}
      <div className="bg-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900">سجل الطلبات 📦</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={30} />
            <p className="text-gray-400 font-bold text-sm italic">جاري جلب سجلاتك...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <ShoppingBag size={40} />
            </div>
            <h3 className="font-black text-gray-900 text-lg">لا يوجد طلبات سابقة</h3>
            <p className="text-gray-400 font-bold text-xs mt-2 leading-relaxed">بمجرد استلام وجباتك، ستظهر تفاصيلها وتاريخها هنا.</p>
            <button onClick={() => router.push('/')} className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all">
              ابدأ التسوق الآن
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-[35px] shadow-sm border border-gray-100 relative overflow-hidden group">
              {/* حالة الطلب */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                    <CheckCircle size={18} />
                  </div>
                  <span className="text-sm font-black text-emerald-700">تم الاستلام بنجاح</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('ar-EG')}
                </span>
              </div>

              {/* تفاصيل الوجبة */}
              <div className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                <img src={order.meals?.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-sm leading-tight mb-1">{order.meals?.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{order.meals?.category}</p>
                </div>
                <div className="text-left">
                  {/* دمج العملة الديناميكية من الوجبة إن وجدت */}
                  <p className="font-black text-emerald-600">{order.total_price || '0.00'} {order.meals?.currency || 'ل.س'}</p>
                </div>
              </div>

              {/* رقم التذكرة وأزرار الإجراءات */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم التذكرة: {order.ticket_number || 'N/A'}</span>
                
                <div className="flex gap-2">
                  {/* زر التقييم الجديد */}
                  <button 
                    onClick={() => handleRateOrder(order)}
                    className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Star size={12} className="fill-amber-400" /> قيّم المتجر
                  </button>
                  {/* الزر الأصلي الخاص بك */}
                  <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg active:scale-95 transition-all shadow-sm">
                    إعادة طلب
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة التقييم المفصل (Modal) */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-6 pb-10 animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-gray-900">كيف كانت تجربتك؟ ✨</h2>
                <p className="text-xs text-gray-500 font-bold mt-1 truncate max-w-[250px]">تقييم: {selectedOrder?.meals?.name}</p>
              </div>
              <button onClick={() => setShowRatingModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-2">
              <StarRating label="جودة المنتج والطعم 🍕" value={ratings.quality} onChange={(v) => setRatings({...ratings, quality: v})} />
              <StarRating label="سرعة وجودة الخدمة ⚡" value={ratings.service} onChange={(v) => setRatings({...ratings, service: v})} />
              <StarRating label="النظافة والترتيب 🧼" value={ratings.cleanliness} onChange={(v) => setRatings({...ratings, cleanliness: v})} />
              
              <div className="mt-4">
                <span className="text-xs font-black text-gray-500 mr-1 flex items-center gap-1"><MessageSquare size={14}/> رأيك يهمنا (اختياري)</span>
                <textarea 
                  placeholder="اكتب تعليقك وتجربتك هنا لمساعدة الآخرين..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-2 text-sm font-bold outline-none focus:border-amber-400 focus:bg-white transition-all h-24 resize-none"
                  value={ratings.comment}
                  onChange={(e) => setRatings({...ratings, comment: e.target.value})}
                ></textarea>
              </div>
            </div>

            <button 
              onClick={submitReview}
              disabled={submitting}
              className="w-full bg-gray-900 text-white py-4 rounded-[25px] font-black text-sm mt-6 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'إرسال التقييم 🚀'}
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}