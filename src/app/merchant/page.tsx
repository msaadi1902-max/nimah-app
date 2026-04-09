'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Store, Package, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  // 🚀 دالة التسليم الحقيقية: تحذف الطلب من قاعدة البيانات
  const handleDeliver = async (orderId: number) => {
    const confirmed = window.confirm("هل أنت متأكد من تسليم هذه الوجبة للزبون؟ سيتم حذف الطلب من القائمة.")
    if (!confirmed) return

    const { error } = await supabase.from('orders').delete().eq('id', orderId)

    if (error) {
      alert("حدث خطأ أثناء التحديث: " + error.message)
    } else {
      alert("✅ تم التسليم بنجاح! طعام هنيء للزبون.")
      setOrders(orders.filter(order => order.id !== orderId)) // تحديث القائمة في الشاشة
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans pb-20" dir="rtl">
      <div className="bg-gray-900 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/profile')} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Store size={24} className="text-emerald-400" /> لوحة المطعم
          </h1>
          <div className="w-10"></div>
        </div>
        <p className="text-gray-400 text-sm font-bold text-center">إدارة طلبات الزبائن وتجهيزها للاستلام</p>
      </div>

      <div className="px-6 space-y-4">
        <h2 className="font-black text-xl text-gray-800 mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-600" /> الطلبات الواردة
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin w-10 h-10" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 mt-10">
            <Clock size={50} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-black text-gray-900 text-lg mb-2">لا توجد طلبات بعد</h3>
            <p className="text-gray-500 font-bold text-sm">بانتظار أول زبون لإنقاذ وجباتك اللذيذة!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-black text-lg text-gray-900">{order.meal_name}</h3>
                  <p className="text-xs font-bold text-gray-500 mt-1">
                    الزبون: <span className="text-gray-800">{order.customer_email.split('@')[0]}</span>
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl text-sm">
                  {order.price} €
                </span>
              </div>
              <hr className="border-gray-50 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-400">رقم الطلب: #{order.id}</span>
                <button 
                  onClick={() => handleDeliver(order.id)}
                  className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform border border-emerald-100"
                >
                  <CheckCircle size={16} /> تسليم للزبون
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}