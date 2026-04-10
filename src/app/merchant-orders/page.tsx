'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, CheckCircle, Clock, Package, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchOrders() {
      // جلب جميع الطلبات المعلقة من جدول orders بالشكل الذي صممناه اليوم
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const handleConfirmDelivery = async (orderId: string) => {
    const confirm = window.confirm("هل أنت متأكد من تسليم الطلب للزبون؟")
    if (!confirm) return

    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    if (!error) {
      setOrders(orders.filter(o => o.id !== orderId))
      alert("تم تأكيد التسليم بنجاح! ✅")
    } else {
      alert("حدث خطأ أثناء التسليم: " + error.message)
    }
  }

  // فلترة الطلبات بناءً على مربع البحث وتوليد الرقم القصير
  const filteredOrders = orders.filter(o => {
    const shortCode = String(o.id).substring(0, 5).toUpperCase()
    return shortCode.includes(searchTerm.toUpperCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      {/* هيدر التاجر بتصميمك الرائع */}
      <div className="p-8 bg-slate-800 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/10 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">طلبات الزبائن 📦</h1>
        <p className="text-xs opacity-70 font-bold mt-1">أدخل رقم الطلب لتأكيد التسليم</p>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10">
        {/* صندوق البحث عن رقم الطلب */}
        <div className="bg-white p-4 rounded-[30px] shadow-xl border border-gray-100 flex items-center gap-3">
          <Search className="text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم الطلب (مثال: 8F2A1)"
            className="w-full bg-transparent border-none font-black text-sm text-gray-700 outline-none focus:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 mr-2 uppercase italic tracking-widest">الطلبات النشطة الآن</h2>
          
          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse font-bold italic">جاري تحميل الطلبات...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200">
              <Package size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold italic text-sm">لا توجد طلبات معلقة حالياً أو غير مطابقة للبحث</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const shortCode = String(order.id).substring(0, 5).toUpperCase()
              return (
                <div key={order.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 space-y-4 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                      <span className="text-2xl font-black text-emerald-700 tracking-widest uppercase">#{shortCode}</span>
                    </div>
                    <div className="text-left text-emerald-800 font-black text-xl">{order.price} €</div>
                  </div>

                  <div className="space-y-2 border-b border-gray-50 pb-4">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                      <Package size={18} className="text-emerald-500" /> {order.meal_name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 italic">
                      <Clock size={12} /> الزبون: {order.customer_email.split('@')[0]}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleConfirmDelivery(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle size={18} /> تأكيد التسليم للزبون
                  </button>
                  
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}