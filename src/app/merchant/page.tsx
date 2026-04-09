'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Store, Package, CheckCircle, Clock, ArrowRight, Loader2, PlusCircle, BellRing } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('id', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()

    // 🔔 إعداد التنبيه الصوتي الحقيقي
    const channel = supabase
      .channel('merchant-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        // تشغيل الصوت عند وصول طلب جديد
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("تحتاج للتفاعل مع الصفحة أولاً ليعمل الصوت"))
        }
        // تحديث القائمة فوراً
        setOrders(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleDeliver = async (orderId: number) => {
    const confirmed = window.confirm("هل تم التسليم؟")
    if (!confirmed) return
    await supabase.from('orders').delete().eq('id', orderId)
    setOrders(orders.filter(order => order.id !== orderId))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right" dir="rtl">
      {/* مشغل الصوت المخفي */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      <div className="bg-gray-900 text-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/profile')} className="bg-white/10 p-2 rounded-xl"><ArrowRight size={20} /></button>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <BellRing size={24} className="text-amber-400 animate-bounce" /> لوحة الإدارة
          </h1>
          <button onClick={() => router.push('/merchant/add-meal')} className="bg-emerald-500 p-2 rounded-xl"><PlusCircle size={22} /></button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <h2 className="font-black text-xl text-gray-800 mb-4 flex items-center gap-2">الطلبات الواردة</h2>
        {loading ? (
          <div className="flex justify-center py-20 text-emerald-600"><Loader2 className="animate-spin w-10 h-10" /></div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-[25px] shadow-sm border-r-4 border-emerald-500 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg">{order.meal_name}</h3>
                <p className="text-xs text-gray-500">الزبون: {order.customer_email.split('@')[0]}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-xl">{order.price} €</span>
            </div>
            <button onClick={() => handleDeliver(order.id)} className="mt-4 w-full bg-emerald-50 text-emerald-600 py-2 rounded-xl font-black flex items-center justify-center gap-2">
              <CheckCircle size={16} /> تم التسليم
            </button>
          </div>
        ))}
      </div>
      <BottomNav activeTab="merchant" />
    </div>
  )
}