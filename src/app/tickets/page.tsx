'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Ticket, MapPin, Clock, Loader2, QrCode, CheckCircle2, Star, MessageSquare } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function TicketsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // حالات نافذة التقييم المنبثقة
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    // 1. معرفة من هو الزبون الحالي
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      router.replace('/welcome')
      return
    }

    // 2. جلب الطلبات الخاصة بهذا الزبون
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', user.email)
      .order('id', { ascending: false }) // عرض الأحدث أولاً

    if (data) setOrders(data)
    setLoading(false)
  }

  // دوال نظام التقييم
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
      // 1. حفظ التقييم في جدول reviews
      const { error: reviewError } = await supabase.from('reviews').insert([{
        order_id: selectedOrder.id,
        merchant_id: selectedOrder.merchant_id,
        customer_email: selectedOrder.customer_email,
        rating: rating,
        comment: comment
      }])

      if (reviewError) throw reviewError

      // 2. تحديث الطلب ليصبح "تم التقييم"
      await supabase.from('orders').update({ is_reviewed: true }).eq('id', selectedOrder.id)

      alert("شكراً لك! تم إرسال تقييمك بنجاح 🌟")
      // تحديث الواجهة فوراً
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
      
      {/* الهيدر المطور */}
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={() => router.push('/')} className="bg-white/20 p-2 rounded-xl active:scale-95 transition-transform backdrop-blur-md">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Ticket size={24} className="text-emerald-200" /> تذاكر الحجز 🎫
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-emerald-100 text-[10px] font-black text-center relative z-10 uppercase tracking-widest">أبرز كود التذكرة للتاجر عند الاستلام</p>
      </div>

      {/* قائمة التذاكر */}
      <div className="px-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-12 h-12 mb-4" />
            <span className="font-black text-sm">جاري جلب تذاكرك...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 mt-10 animate-in fade-in zoom-in duration-500">
            <Ticket size={60} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-black text-gray-900 text-lg mb-2">لا توجد تذاكر حالياً</h3>
            <p className="text-gray-400 font-bold text-xs mb-8">سلتك فارغة.. ابدأ بإنقاذ وجبتك الأولى ووفر المال!</p>
            <button 
              onClick={() => router.push('/')} 
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all w-full"
            >
              تصفح عروض اليوم 🍕
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="animate-in slide-in-from-bottom-5 duration-500">
              {/* تصميم التذكرة الساحر */}
              <div className="bg-white rounded-[35px] shadow-md overflow-hidden border border-gray-100 relative group transition-all hover:shadow-xl">
                
                {/* الجزء العلوي من التذكرة (يتغير لونه إذا تم الاستلام) */}
                <div className={`${order.status === 'completed' ? 'bg-gray-100' : 'bg-emerald-50'} p-6 border-b-2 border-dashed border-gray-200 relative transition-colors`}>
                  {/* الدوائر الجانبية لشكل التذكرة */}
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-black text-lg leading-tight ${order.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}`}>
                        {order.meal_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 size={14} className={order.status === 'completed' ? 'text-gray-400' : 'text-emerald-500'} />
                        <span className={`text-[10px] font-black ${order.status === 'completed' ? 'text-gray-500' : 'text-emerald-600'}`}>
                          {order.status === 'completed' ? 'تم الاستلام بنجاح' : 'جاهز للاستلام'}
                        </span>
                      </div>
                    </div>
                    
                    {/* إخفاء الـ QR Code إذا تم الاستلام */}
                    {order.status !== 'completed' && (
                      <div className="bg-gray-900 text-white p-2.5 rounded-2xl shadow-lg">
                        <QrCode size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px]">
                      <Clock size={14} className="text-gray-400" />
                      <span>وقت الاستلام: <span className="text-gray-900">حسب موعد العرض</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px]">
                      <MapPin size={14} className="text-rose-500" />
                      <span>الموقع: راجع موقع التاجر على الخريطة</span>
                    </div>
                  </div>
                </div>
                
                {/* الجزء السفلي */}
                <div className="p-5 bg-white flex justify-between items-center px-8">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">كود الحجز الفريد</p>
                    <span className={`text-lg font-mono font-black tracking-[5px] ${order.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      #{String(order.id).substring(0, 5).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-left flex flex-col items-end gap-2">
                    {/* زر التقييم يظهر فقط للطلبات المكتملة غير المقيمة */}
                    {order.status === 'completed' && !order.is_reviewed && (
                      <button 
                        onClick={() => openReviewModal(order)}
                        className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-amber-200 transition-colors shadow-sm"
                      >
                        <Star size={14} className="fill-amber-500 text-amber-500" /> قيّم تجربتك
                      </button>
                    )}

                    {/* شارة "تم التقييم" */}
                    {order.is_reviewed && (
                      <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 border border-emerald-100">
                        <Star size={12} className="fill-emerald-500" /> تم التقييم
                      </span>
                    )}

                    {/* إظهار السعر إذا لم يتم الاستلام بعد */}
                    {order.status !== 'completed' && (
                      <>
                        <p className="text-[9px] font-black text-gray-400 mb-0.5">القيمة المدفوعة</p>
                        <span className="font-black text-2xl text-emerald-700 leading-none">{order.price} €</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة التقييم المنبثقة (Modal) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">كيف كانت الوجبة؟ 😋</h2>
            <p className="text-xs text-gray-500 text-center font-bold mb-8 leading-relaxed">شارك رأيك لمساعدة الآخرين وتشجيع المتجر على تقليل الهدر.</p>
            
            {/* نجوم التقييم */}
            <div className="flex justify-center gap-3 mb-8 cursor-pointer" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={42} 
                  onClick={() => setRating(star)}
                  className={`transition-all duration-300 hover:scale-110 active:scale-90 ${star <= rating ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-gray-100 fill-gray-100 hover:text-amber-200'}`} 
                />
              ))}
            </div>

            {/* مربع التعليق */}
            <div className="mb-8 relative group">
              <MessageSquare size={18} className="absolute top-4 right-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
              <textarea 
                placeholder="أضف تعليقاً (اختياري)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-4 pr-12 text-sm font-bold outline-none focus:border-emerald-500 resize-none h-28 transition-colors"
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-200 transition-all active:scale-95"
              >
                {submittingReview ? <Loader2 className="animate-spin" /> : 'إرسال التقييم ⭐'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="tickets" />
    </div>
  )
}