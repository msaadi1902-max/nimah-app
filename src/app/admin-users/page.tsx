'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Store, Clock, ShieldAlert, Loader2, UserCheck } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminUsersPage() {
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPendingMerchants = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'merchant')
      .eq('is_approved', false)
    if (data) setPendingMerchants(data)
    setLoading(false)
  }

  useEffect(() => { fetchPendingMerchants() }, [])

  const approveMerchant = async (id: string, shopName: string) => {
    if (confirm(`هل أنت متأكد من الموافقة على انضمام مطعم "${shopName}"؟`)) {
      const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id)
      if (!error) {
        alert('✅ تم تفعيل حساب التاجر بنجاح!')
        setPendingMerchants(pendingMerchants.filter(m => m.id !== id))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-right font-sans" dir="rtl">
      <div className="pt-10 mb-10 flex items-center gap-4">
        <div className="bg-emerald-600 p-4 rounded-[22px] text-white shadow-xl shadow-emerald-200">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">طلبات التجار</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">الموافقة على المطاعم والمحلات الجديدة</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
           <Loader2 className="animate-spin text-emerald-600" size={30} />
           <p className="text-gray-400 font-bold text-sm italic">جاري مراجعة السجلات...</p>
        </div>
      ) : pendingMerchants.length === 0 ? (
        <div className="bg-white rounded-[45px] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <UserCheck size={60} className="text-emerald-100 mb-6" />
          <h2 className="text-xl font-black text-gray-900">القائمة نظيفة تماماً!</h2>
          <p className="text-sm text-gray-400 font-bold mt-3 leading-relaxed">تمت مراجعة جميع طلبات الانضمام بنجاح.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingMerchants.map((merchant) => (
            <div key={merchant.id} className="bg-white rounded-[35px] p-8 shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400 group-hover:bg-emerald-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-2">
                    <Store size={22} className="text-emerald-600" />
                    {merchant.shop_name || 'مطعم قيد التسمية'}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold">{merchant.email}</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black border border-amber-100 flex items-center gap-1">
                  <Clock size={12} /> ينتظر الإذن
                </div>
              </div>

              <button 
                onClick={() => approveMerchant(merchant.id, merchant.shop_name)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/10"
              >
                <CheckCircle size={18} /> تفعيل حساب التاجر فوراً
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}