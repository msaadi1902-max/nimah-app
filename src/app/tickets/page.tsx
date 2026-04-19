'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowRight, Ticket, MapPin, Clock, Loader2, 
  QrCode, CheckCircle2, Star, MessageSquare, 
  ExternalLink, Store 
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import QRCode from "react-qr-code";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function TicketsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // حالات نافذة التقييم
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.replace('/welcome')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          meals:meal_id (name, image_url, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (order: any) => {
    setSelectedOrder(order)
    setRating(0)
    setComment('')
    setReviewModalOpen(true)
  }

  const submitReview = async () => {
    if (rating === 0) return alert("يرجى اختيار عدد النجوم للتقييم ⭐")
    
    setSubmittingReview(true)
    try {
      const { error: reviewError } = await supabase.from('reviews').insert([{
        order_id: selectedOrder.id,
        merchant_id: selectedOrder.merchant_id,
        user_id: selectedOrder.user_id,
        rating: rating,
        comment: comment
      }])

      if (reviewError) throw reviewError

      await supabase.from('orders').update({ is_reviewed: true }).eq('id', selectedOrder.id)

      alert("شكراً لك! تم إرسال تقييمك بنجاح 🌟")
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, is_reviewed: true } : o))
      setReviewModalOpen(false)
    } catch (error: any) {
      alert("حدث خطأ أثناء إرسال التقييم: " + error.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={() => router.push('/')} className="bg-white/20 p-2 rounded-xl active:scale-95 transition-transform backdrop-blur-md">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Ticket size={24} className="text-emerald-200" /> تذاكري الرقمية 🎫
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-emerald-100 text-[10px] font-black text-center relative z-10 uppercase tracking-widest">أبرز كود التذكرة للتاجر عند الاستلام</p>
      </div>

      <div className="px-6 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-12 h-12 mb-4" />
            <span className="font-black text-sm text-gray-400">جاري جلب تذاكرك...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 mt-10 animate-in fade-in zoom-in duration-500">
            <Ticket size={60} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-black text-gray-900 text-lg mb-2">لا توجد تذاكر حالياً</h3>
            <p className="text-gray-400 font-bold text-xs mb-8">سلتك فارغة.. ابدأ بإنقاذ وجبتك الأولى ووفر المال!</p>
            <button onClick={() => router.push('/')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all w-full">
              تصفح عروض اليوم 🍕
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="relative animate-in slide-in-from-bottom-5 duration-500">
              {/* جسم التذكرة العلوي */}
              <div className="bg-white rounded-t-[35px] shadow-sm border border-gray-100 border-b-0 overflow-hidden">
                <div className={`${order.status === 'used' ? 'bg-gray-50' : 'bg-emerald-50/50'} p-5 flex items-center gap-4 border-b border-dashed border-gray-200 relative`}>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0 overflow-hidden border border-emerald-100">
                    {order.meals?.image_url ? (
                      <img src={order.meals.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-black text-sm truncate ${order.status === 'used' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {order.meals?.name || 'وجبة إنقاذ'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[9px] font-black ${
                    order.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {order.status === 'active' ? 'جاهزة' : 'مستخدمة'}
                  </div>
                </div>

                <div className="p-6 flex flex-col items-center bg-white">
                  {order.status === 'active' ? (
                    <>
                      <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100 mb-4 transition-transform hover:scale-105">
                        <QRCode value={order.ticket_code} size={130} />
                      </div>
                      <p className="font-mono font-black text-xl text-gray-800 tracking-[0.3em] bg-gray-50 px-4 py-1 rounded-lg">
                        {order.ticket_code}
                      </p>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <CheckCircle2 size={48} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">تمت عملية الاستلام</p>
                    </div>
                  )}
                </div>
              </div>

              {/* تأثير القص (Ticket Cut) */}
              <div className="relative h-6 bg-white border-x border-gray-100 flex items-center justify-between overflow-hidden">
                 <div className="w-6 h-6 bg-gray-50 rounded-full -ml-3 border border-gray-100 shadow-inner"></div>
                 <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2"></div>
                 <div className="w-6 h-6 bg-gray-50 rounded-full -mr-3 border border-gray-100 shadow-inner"></div>
              </div>

              {/* جسم التذكرة السفلي */}
              <div className="bg-white p-5 rounded-b-[35px] border border-gray-100 border-t-0 flex flex-col gap-3 shadow-sm">
                {order.status === 'active' ? (
                  <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-2.5 rounded-xl text-center">
                    أظهر هذا الكود للموظف عند الاستلام 🍱
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {!order.is_reviewed ? (
                      <button onClick={() => openReviewModal(order)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-100">
                        <Star size={14} className="fill-white" /> قيّم الوجبة واكسب نقاط
                      </button>
                    ) : (
                      <div className="text-center py-2 text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-xl flex items-center justify-center gap-2">
                         <Star size={12} className="fill-emerald-600" /> تم التقييم بنجاح
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة التقييم المنبثقة */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">كيف كانت الوجبة؟ 😋</h2>
            <p className="text-xs text-gray-500 text-center font-bold mb-8">رأيك يهمنا لتحسين جودة الطعام</p>
            
            <div className="flex justify-center gap-3 mb-8 cursor-pointer" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={42} 
                  onClick={() => setRating(star)}
                  className={`transition-all ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-100 fill-gray-100'}`} 
                />
              ))}
            </div>

            <textarea 
              placeholder="أضف تعليقاً..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm font-bold outline-none focus:border-emerald-500 resize-none h-28 mb-6"
            ></textarea>

            <div className="flex gap-3">
              <button onClick={() => setReviewModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm">إلغاء</button>
              <button onClick={submitReview} disabled={submittingReview} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-200">
                {submittingReview ? <Loader2 className="animate-spin" size={18} /> : 'إرسال التقييم'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="tickets" />
    </div>
  )
}