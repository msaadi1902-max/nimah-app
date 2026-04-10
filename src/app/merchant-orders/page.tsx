'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, CheckCircle, Clock, ShoppingBag, Store, User } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    // جلب الطلبات التي لم يتم تسليمها بعد (حالتها ليست completed)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'completed') 
      .order('id', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  // دالة تسليم الطلب
  const handleDeliver = async (orderId: string) => {
    // تحديث حالة الطلب في قاعدة البيانات إلى "مكتمل"
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    if (!error) {
      // إخفاء الطلب من الشاشة بعد نجاح التسليم
      setOrders(orders.filter(order => order.id !== orderId))
      alert('🎉 تم تسليم الطلب للزبون بنجاح!')
    } else {
      alert('حدث خطأ أثناء التسليم: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      
      {/* الهيدر الخاص بالتاجر */}
      <div className="bg-gray-900 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Store size={24} className="text-emerald-400" /> طلبات الزبائن
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-gray-400 text-sm font-bold text-center">طابق رقم الطلب مع تذكرة الزبون وسلم الوجبة</p>
      </div>

      <div className="px-6 space-y-5">
        {loading ? (
          <div className="flex justify-center py-20 text-emerald-600">
             <Clock className="animate-spin w-10 h-10" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[30px] p-10 text-center shadow-sm border border-gray-100 mt-10">
            <ShoppingBag size={50} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-black text-gray-900 text-lg mb-2">لا توجد طلبات جديدة</h3>
            <p className="text-gray-500 font-bold text-sm">أنتظر الحجوزات القادمة...</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[30px] p-6 shadow-sm border border-emerald-100 relative">
              
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-black text-xl text-gray-900 mb-1">{order.meal_name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                    <User size={14} /> {order.customer_email.split('@')[0]}
                  </div>
                </div>
                <div className="text-left bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-black mb-1">الرقم السري</p>
                  <p className="text-xl font-black text-emerald-900 tracking-widest">
                    #{String(order.id).substring(0, 5).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-black text-2xl text-gray-900">{order.price} €</span>
                
                <button 
                  onClick={() => handleDeliver(order.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-200"
                >
                  <CheckCircle size={18} /> تم التسليم
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}