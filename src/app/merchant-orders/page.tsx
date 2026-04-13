'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, CheckCircle, Clock, Package, ArrowRight, CheckSquare, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      // 1. التحقق من التاجر الحالي لضمان الأمان
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/welcome')
        return
      }

      // 2. جلب جميع طلبات هذا التاجر (النشطة والمكتملة)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data)
    } catch (error: any) {
      console.error("خطأ في جلب الطلبات:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelivery = async (orderId: number) => {
    const confirm = window.confirm("هل أنت متأكد من تسليم الطلب للزبون؟")
    if (!confirm) return

    setProcessingId(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)

      if (error) throw error

      // تحديث الواجهة فوراً دون إعادة تحميل
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      alert("تم تأكيد التسليم بنجاح! ✅")
    } catch (error: any) {
      alert("حدث خطأ أثناء التسليم: " + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  // فلترة ذكية: بناءً على التبويب (نشط/مكتمل) + رقم الطلب القصير
  const filteredOrders = orders.filter(o => {
    const matchesTab = o.status === activeTab
    const shortCode = String(o.id).substring(0, 5).toUpperCase()
    const matchesSearch = shortCode.includes(searchTerm.toUpperCase()) || o.meal_name?.includes(searchTerm)
    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* هيدر التاجر بتصميمك الرائع */}
      <div className="p-8 bg-slate-800 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">إدارة الطلبات 📦</h1>
        <p className="text-xs opacity-70 font-bold mt-1">امسح الكود أو أدخل رقم الطلب للتسليم</p>
      </div>

      <div className="px-6 -mt-8 space-y-5 relative z-10">
        
        {/* صندوق البحث */}
        <div className="bg-white p-4 rounded-[30px] shadow-xl border border-gray-100 flex items-center gap-3">
          <Search className="text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم الطلب (مثال: 8F2A1)"
            className="w-full bg-transparent border-none font-black text-sm text-gray-700 outline-none focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* التبويبات (Tabs) المدمجة */}
        <div className="flex bg-gray-200/70 rounded-2xl p-1.5 relative shadow-sm">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow transition-all duration-300 ease-out ${activeTab === 'pending' ? 'right-1.5' : 'left-1.5'}`}></div>
          <button onClick={() => setActiveTab('pending')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${activeTab === 'pending' ? 'text-emerald-700' : 'text-gray-500'}`}>
            <Clock size={16} /> الطلبات النشطة
          </button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-black z-10 transition-colors ${activeTab === 'completed' ? 'text-emerald-700' : 'text-gray-500'}`}>
            <CheckSquare size={16} /> المكتملة
          </button>
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-10 text-emerald-600 gap-3">
              <Loader2 className="animate-spin" size={30} />
              <span className="text-sm font-bold text-gray-400">جاري تحميل الطلبات...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200">
              <Package size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold italic text-sm">لا توجد طلبات هنا حالياً</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const shortCode = String(order.id).substring(0, 5).toUpperCase()
              return (
                <div key={order.id} className={`bg-white p-6 rounded-[35px] shadow-sm border space-y-4 relative overflow-hidden group ${activeTab === 'completed' ? 'border-gray-100 opacity-80' : 'border-emerald-50'}`}>
                  
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
                      <Clock size={12} /> الزبون: {order.customer_email?.split('@')[0]}
                    </p>
                  </div>

                  {activeTab === 'pending' ? (
                    <button 
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={processingId === order.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                    >
                      {processingId === order.id ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> تأكيد التسليم للزبون</>}
                    </button>
                  ) : (
                    <div className="w-full bg-gray-50 text-gray-500 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-gray-100">
                      <CheckCircle size={18} className="text-emerald-500" /> تم التسليم للزبون
                    </div>
                  )}
                  
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${activeTab === 'pending' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
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