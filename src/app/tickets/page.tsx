'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowRight, Ticket, Clock, Loader2, 
  CheckCircle2, Star, Store, MapPin
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import QRCode from "react-qr-code"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// 👑 حماية الكود بتعريفات (TypeScript Interfaces)
interface MealRef {
  name: string;
  image_url: string;
  category: string;
}

interface Order {
  id: number;
  user_id: string;
  merchant_id: string;
  meal_id: number;
  ticket_code: string;
  status: 'active' | 'used' | 'cancelled';
  created_at: string;
  is_reviewed: boolean;
  meals?: MealRef;
}

export default function TicketsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // حالات نافذة التقييم
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return router.replace('/welcome')

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          meals:meal_id (name, image_url, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data as Order[])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const activeOrders = orders.filter(o => o.status === 'active')
  const historyOrders = orders.filter(o => o.status === 'used' || o.status === 'cancelled')

  const openReviewModal = (order: Order) => {
    setSelectedOrder(order)
    setRating(0)
    setComment('')
    setReviewModalOpen(true)
  }

  const submitReview = async () => {
    if (rating === 0) return alert("يرجى اختيار عدد النجوم للتقييم ⭐")
    if (!selectedOrder) return
    
    setSubmittingReview(true)
    try {
      const { error: reviewError } = await supabase.from('reviews').insert([{
        order_id: selectedOrder.id,
        meal_id: selectedOrder.meal_id,
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
    <div className="min-h-screen bg-slate-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 👑 الهيدر الفاخر */}
      <div className="bg-slate-900 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-xl sticky top-0 z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => router.push('/')} className="bg-white/10 p-2.5 rounded-2xl active:scale-95 transition-transform backdrop-blur-md border border-white/10">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
             تذاكري الرقمية <Ticket size={24} className="text-emerald-400 transform -rotate-12" />
          </h1>
          <div className="w-10"></div>
        </div>
        
        {/* أزرار التبويبات الزجاجية */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl relative z-10 backdrop-blur-xl border border-slate-700 shadow-inner">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`flex-1 py-3.5 rounded-xl font-black text-xs transition-all ${activeTab === 'active' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            التذاكر الفعالة
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-3.5 rounded-xl font-black text-xs transition-all ${activeTab === 'history' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            سجل الطلبات
          </button>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-12 h-12 mb-4" />
            <span className="font-black text-sm text-slate-400 tracking-widest animate-pulse">جاري فحص المحفظة الرقمية...</span>
          </div>
        ) : activeTab === 'active' ? (
          /* ================= التذاكر الفعالة ================= */
          activeOrders.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 mt-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket size={40} className="text-slate-300 transform -rotate-45" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-2">لا توجد تذاكر فعالة</h3>
              <p className="text-slate-400 font-bold text-xs mb-8 leading-relaxed">محفظتك فارغة.. ابدأ بإنقاذ وجبتك الأولى ووفر المال اليوم!</p>
              <button onClick={() => router.push('/')} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all w-full flex justify-center items-center gap-2">
                تصفح العروض المتاحة 🛒
              </button>
            </div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.id} className="relative animate-in slide-in-from-bottom-4 duration-500 group">
                
                {/* جسم التذكرة العلوي */}
                <div className="bg-white rounded-t-[35px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 border-b-0 overflow-hidden relative">
                  <div className="bg-emerald-50/30 p-6 flex items-center gap-4 border-b border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0 overflow-hidden border border-emerald-100 relative">
                      {order.meals?.image_url ? (
                        <img src={order.meals.image_url} className="w-full h-full object-cover" alt="Meal" />
                      ) : (
                        <Store size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base text-slate-900 truncate">{order.meals?.name || 'وجبة إنقاذ'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-emerald-500" /> {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-100 text-emerald-700 shadow-sm">
                      جاهزة
                    </div>
                  </div>

                  {/* منطقة ה-QR Code */}
                  <div className="p-8 flex flex-col items-center bg-white cursor-pointer" onClick={() => router.push(`/my-ticket?order_no=${order.ticket_code}`)}>
                    <div className="bg-white p-4 rounded-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-50 mb-6 transition-transform hover:scale-105">
                      <QRCode value={order.ticket_code} size={140} fgColor="#0f172a" />
                    </div>
                    <p className="font-mono font-black text-2xl text-slate-800 tracking-[0.2em] bg-slate-50 px-6 py-2 rounded-xl border border-slate-100">
                      {order.ticket_code}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-4 text-center">اضغط على التذكرة لخيارات إضافية</p>
                  </div>
                </div>

                {/* تصميم القص المذهل للبطاقة (Enterprise Ticket Cut) */}
                <div className="relative h-8 bg-white border-x border-slate-100 flex items-center justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                   <div className="w-8 h-8 bg-slate-50 rounded-full -ml-4 border border-slate-100 shadow-inner"></div>
                   <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3"></div>
                   <div className="w-8 h-8 bg-slate-50 rounded-full -mr-4 border border-slate-100 shadow-inner"></div>
                </div>

                {/* جسم التذكرة السفلي */}
                <div className="bg-white p-6 rounded-b-[35px] border border-slate-100 border-t-0 flex flex-col gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <p className="text-[11px] font-black text-emerald-700 bg-emerald-50/80 py-3 rounded-2xl text-center border border-emerald-100/50">
                    أظهر هذا الكود للمطعم عند الاستلام 🍱
                  </p>
                </div>
              </div>
            ))
          )
        ) : (
          /* ================= سجل الطلبات ================= */
          historyOrders.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm text-slate-400 font-bold animate-in fade-in">
              <Clock size={40} className="mx-auto mb-4 opacity-30" /> سجلك فارغ حالياً.
            </div>
          ) : (
            historyOrders.map((order) => (
              <div key={order.id} className="relative animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-t-[35px] shadow-sm border border-slate-100 border-b-0 overflow-hidden opacity-80">
                  <div className="bg-slate-50 p-5 flex items-center gap-4 border-b border-dashed border-slate-200 relative grayscale">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm shrink-0 overflow-hidden border border-slate-100">
                      {order.meals?.image_url ? (
                        <img src={order.meals.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <Store size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm text-slate-500 truncate">{order.meals?.name || 'وجبة إنقاذ'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-[9px] font-black bg-slate-200 text-slate-600">
                      مستخدمة
                    </div>
                  </div>

                  <div className="p-8 flex flex-col items-center bg-white">
                    <div className="py-2 text-center">
                      <CheckCircle2 size={50} className="text-emerald-500 mx-auto mb-3 opacity-50" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">تمت عملية الاستلام</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-8 bg-white border-x border-slate-100 flex items-center justify-between overflow-hidden opacity-80">
                   <div className="w-8 h-8 bg-slate-50 rounded-full -ml-4 border border-slate-100 shadow-inner"></div>
                   <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3"></div>
                   <div className="w-8 h-8 bg-slate-50 rounded-full -mr-4 border border-slate-100 shadow-inner"></div>
                </div>

                <div className="bg-white p-5 rounded-b-[35px] border border-slate-100 border-t-0 flex flex-col gap-3 shadow-sm">
                  {!order.is_reviewed ? (
                    <button onClick={() => openReviewModal(order)} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                      <Star size={16} className="fill-slate-900" /> قيّم تجربتك واكسب نقاط
                    </button>
                  ) : (
                    <div className="text-center py-3 text-[11px] font-black text-emerald-600 bg-emerald-50 rounded-2xl flex items-center justify-center gap-2 border border-emerald-100">
                      <CheckCircle2 size={16} className="text-emerald-500" /> تم التقييم بنجاح، شكراً لك!
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* 🌟 نافذة التقييم الفاخرة (Glassmorphism) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">كيف كانت الوجبة؟ 😋</h2>
            <p className="text-xs text-slate-500 text-center font-bold mb-8">رأيك يهمنا لتحسين جودة الطعام ومكافأة المتاجر</p>
            
            <div className="flex justify-center gap-3 mb-8 cursor-pointer" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-90">
                  <Star size={42} className={`transition-all duration-300 ${star <= rating ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-slate-100 fill-slate-100'}`} />
                </button>
              ))}
            </div>

            <textarea 
              placeholder="شاركنا تجربتك (اختياري)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold outline-none focus:border-amber-400 focus:bg-white transition-all resize-none h-32 mb-6"
            ></textarea>

            <div className="flex gap-3">
              <button onClick={() => setReviewModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm transition-colors">إلغاء</button>
              <button onClick={submitReview} disabled={submittingReview} className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all disabled:opacity-70">
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