'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Search, CheckCircle, Clock, Package, ArrowRight, CheckSquare, Loader2, Euro, User } from 'lucide-react'
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/welcome')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('merchant_id', user.id)
        .order('id', { ascending: false })

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

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      alert("تم تأكيد التسليم بنجاح! ✅")
    } catch (error: any) {
      alert("حدث خطأ أثناء التسليم: " + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesTab = o.status === activeTab
    const shortCode = String(o.id).substring(0, 5).toUpperCase()
    const matchesSearch = shortCode.includes(searchTerm.toUpperCase()) || o.meal_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* هيدر التاجر المتطور */}
      <div className="p-8 bg-slate-900 text-white rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform mb-4">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black italic flex items-center gap-2">طلبات المتجر الواردة <Package className="text-emerald-400" /></h1>
        <p className="text-[10px] opacity-60 font-black mt-1 uppercase tracking-widest">تأكد من هوية الزبون عبر رقم الطلب</p>
      </div>

      <div className="px-6 -mt-8 space-y-5 relative z-10">
        
        {/* صندوق البحث الاحترافي */}
        <div className="bg-white p-4 rounded-[30px] shadow-xl border border-gray-100 flex items-center gap-3 group focus-within:border-emerald-300 transition-all">
          <Search className="text-gray-300 group-focus-within:text-emerald-500" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم الطلب أو اسم الوجبة..."
            className="w-full bg-transparent border-none font-bold text-sm text-gray-700 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* التبويبات الذكية */}
        <div className="flex bg-gray-200/50 p-1 rounded-2xl relative">
           <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md transition-all duration-500 ${activeTab === 'pending' ? 'right-1' : 'left-1'}`}></div>
           <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 text-xs font-black z-10 flex justify-center items-center gap-2 transition-colors ${activeTab === 'pending' ? 'text-emerald-700' : 'text-gray-500'}`}>
             <Clock size={16} /> نشطة ({orders.filter(o => o.status === 'pending').length})
           </button>
           <button onClick={() => setActiveTab('completed')} className={`flex-1 py-3 text-xs font-black z-10 flex justify-center items-center gap-2 transition-colors ${activeTab === 'completed' ? 'text-emerald-700' : 'text-gray-500'}`}>
             <CheckSquare size={16} /> مكتملة ({orders.filter(o => o.status === 'completed').length})
           </button>
        </div>

        {/* قائمة الطلبات */}
        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 text-emerald-600 gap-3">
              <Loader2 className="animate-spin" size={30} />
              <span className="text-xs font-black text-gray-400">جاري تحديث قائمة الطلبات...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-14 rounded-[40px] text-center border border-dashed border-gray-200 shadow-sm">
              <Package size={40} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black text-sm">لا توجد طلبات في هذا القسم</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const shortCode = String(order.id).substring(0, 5).toUpperCase()
              return (
                <div key={order.id} className={`bg-white p-6 rounded-[35px] shadow-sm border-2 transition-all relative overflow-hidden ${activeTab === 'completed' ? 'border-gray-50 opacity-75' : 'border-white hover:border-emerald-100'}`}>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-2xl shadow-lg shadow-emerald-100">
                      <span className="text-xl font-mono font-black tracking-widest">#{shortCode}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-gray-900">{order.price} €</span>
                      <span className="text-[9px] font-black text-rose-500">تبرع: {order.donation_amount || 0} €</span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-50 pt-4">
                    <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                      <Package size={18} className="text-emerald-500" /> {order.meal_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                      <User size={14} className="text-blue-400" />
                      <span className="line-clamp-1">{order.customer_email}</span>
                    </div>
                  </div>

                  {activeTab === 'pending' ? (
                    <button 
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={processingId === order.id}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {processingId === order.id ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> تأكيد تسليم الوجبة</>}
                    </button>
                  ) : (
                    <div className="w-full mt-4 bg-gray-50 text-gray-400 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-gray-100 italic">
                      <CheckSquare size={16} /> تم التسليم بنجاح
                    </div>
                  )}
                  
                  <div className={`absolute top-0 right-0 w-2 h-full ${activeTab === 'pending' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
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