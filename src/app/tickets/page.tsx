'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Ticket, MapPin, Clock, Loader2, QrCode } from 'lucide-react'
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.replace('/login')
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
      
      {/* الهيدر */}
      <div className="bg-emerald-800 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Ticket size={24} /> تذاكر الحجز
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-emerald-200 text-sm font-bold text-center">أبرز هذه التذاكر للمطعم عند الاستلام</p>
      </div>

      {/* قائمة التذاكر */}
      <div className="px-6 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-10 h-10" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 mt-10">
            <Ticket size={50} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-black text-gray-900 text-lg mb-2">لا توجد تذاكر حالياً</h3>
            <p className="text-gray-500 font-bold text-sm mb-6">ابدأ بإنقاذ وجبتك الأولى الآن!</p>
            <button onClick={() => router.push('/')} className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-2xl font-black">
              تصفح العروض
            </button>
          </div>
        ) : (
          orders.map((order) => (
            // تصميم التذكرة
            <div key={order.id} className="bg-white rounded-[30px] shadow-md overflow-hidden border border-gray-100 relative">
              {/* الدوائر الجانبية لتعطي شكل التذكرة */}
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border-r border-gray-100"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border-l border-gray-100"></div>
              
              <div className="p-6 border-b border-gray-200 border-dashed">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-gray-900">{order.meal_name}</h3>
                    <p className="text-emerald-600 font-bold text-xs mt-1">جاهز للاستلام اليوم</p>
                  </div>
                  <div className="bg-gray-900 text-white p-2 rounded-xl">
                    <QrCode size={24} />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                    <Clock size={16} className="text-gray-400" />
                    <span>وقت الاستلام المعتاد</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50/50 flex justify-between items-center">
                <span className="text-xs font-black text-gray-500">رقم الطلب: #{order.id}</span>
                <span className="font-black text-xl text-emerald-800">{order.price} €</span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav activeTab="tickets" />
    </div>
  )
}