'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Clock, Eye, Loader2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('topup_requests')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setRequests(data)
    setLoading(false)
  }

  const handleAction = async (requestId: number, userId: string, amount: number, status: 'approved' | 'rejected') => {
    setActionLoading(requestId)
    try {
      if (status === 'approved') {
        // 1. جلب الرصيد الحالي للمستخدم
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
        const newBalance = (profile?.wallet_balance || 0) + amount

        // 2. تحديث الرصيد في جدول البروفايل
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)
      }

      // 3. تحديث حالة الطلب
      await supabase.from('topup_requests').update({ status }).eq('id', requestId)
      
      alert(status === 'approved' ? 'تمت الموافقة وشحن الرصيد بنجاح ✅' : 'تم رفض الطلب ❌')
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (err) {
      alert('حدث خطأ في المعالجة')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 pt-16 pb-12 rounded-b-[50px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full -ml-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl mb-4"><ArrowRight size={20} /></button>
        <h1 className="text-2xl font-black italic flex items-center gap-2">لوحة تحكم الإدارة <ShieldCheck className="text-emerald-400" /></h1>
        <p className="text-xs opacity-60 font-bold mt-1 uppercase tracking-widest">مراجعة طلبات شحن المحفظة</p>
      </div>

      <div className="px-6 -mt-8 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-black text-gray-400">جاري جلب الطلبات المعلقة...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200">
            <Clock size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black">لا توجد طلبات شحن بانتظارك</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-50 px-4 py-1.5 rounded-2xl text-emerald-700 font-black text-lg">
                  {req.amount} €
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-gray-300 block">تاريخ الطلب</span>
                  <span className="text-xs font-bold text-gray-500">{new Date(req.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <Wallet size={16} className="text-emerald-500" /> {req.profiles?.full_name || 'مستخدم غير معروف'}
                </h3>
                <p className="text-[11px] text-gray-400 font-bold mr-6">{req.profiles?.email}</p>
              </div>

              {/* عرض صورة الإيصال */}
              <div className="relative group rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-100">
                <img src={req.receipt_url} alt="Receipt" className="w-full h-full object-cover" />
                <a href={req.receipt_url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-2">
                  <Eye size={18} /> عرض الإيصال بحجم كامل
                </a>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  disabled={actionLoading === req.id}
                  onClick={() => handleAction(req.id, req.user_id, req.amount, 'approved')}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                >
                  {actionLoading === req.id ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> قبول</>}
                </button>
                <button 
                  disabled={actionLoading === req.id}
                  onClick={() => handleAction(req.id, req.user_id, req.amount, 'rejected')}
                  className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-100"
                >
                  <XCircle size={16} /> رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}