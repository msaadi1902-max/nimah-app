'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Ticket, MapPin, Clock, Loader2, QrCode, CheckCircle2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function TicketsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

    // 2. جلب الطلبات الخاصة بهذا الزبون فقط من جدول orders
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', user.email)
      .order('id', { ascending: false }) // عرض الأحدث أولاً

    if (data) setOrders(data)
    setLoading(false)
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
                
                {/* الجزء العلوي من التذكرة */}
                <div className="bg-emerald-50 p-6 border-b-2 border-dashed border-gray-200 relative">
                  {/* الدوائر الجانبية لشكل التذكرة */}
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-100"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-lg text-gray-900 leading-tight">{order.meal_name}</h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600">جاهز للاستلام</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 text-white p-2.5 rounded-2xl shadow-lg">
                      <QrCode size={24} />
                    </div>
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
                
                {/* الجزء السفلي (كود الاستلام) */}
                <div className="p-5 bg-white flex justify-between items-center px-8">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">كود الحجز الفريد</p>
                    <span className="text-lg font-mono font-black text-gray-900 tracking-[5px]">
                      #{String(order.id).substring(0, 5).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                     <p className="text-[9px] font-black text-gray-400 mb-1">القيمة المدفوعة</p>
                     <span className="font-black text-2xl text-emerald-700">{order.price} €</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav activeTab="tickets" />
    </div>
  )
}