'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShoppingBag, Calendar, CheckCircle, Clock, Search, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
          meals (name, image_url, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6 border-b border-gray-100">
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
            <button onClick={() => router.push('/')} className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm">
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
                  <p className="font-black text-emerald-600">{order.total_price || '5.00'} €</p>
                </div>
              </div>

              {/* رقم التذكرة المرجعي */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم التذكرة: {order.ticket_number || 'N/A'}</span>
                <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                  إعادة طلب الوجبة
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}