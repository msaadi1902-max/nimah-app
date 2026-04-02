'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Store, Clock, ShieldAlert } from 'lucide-react'

// ربط قاعدة البيانات
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminPanelPage() {
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // جلب التجار الذين ينتظرون الموافقة عند فتح الصفحة
  useEffect(() => {
    fetchPendingMerchants()
  }, [])

  const fetchPendingMerchants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'merchant')
      .eq('is_approved', false)

    if (data) setPendingMerchants(data)
    setLoading(false)
  }

  // دالة الموافقة على التاجر
  const approveMerchant = async (id: string, shopName: string) => {
    const confirmApprove = window.confirm(`هل أنت متأكد من الموافقة على انضمام مطعم "${shopName}"؟`)
    if (!confirmApprove) return

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', id)

    if (!error) {
      alert('✅ تم تفعيل حساب التاجر بنجاح!')
      fetchPendingMerchants() // تحديث القائمة لإخفاء التاجر الذي تمت الموافقة عليه
    } else {
      alert('حدث خطأ: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-right font-sans" dir="rtl">
      
      <div className="mb-10 flex items-center gap-3">
        <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">لوحة الإدارة</h1>
          <p className="text-sm text-gray-500 font-bold">مراجعة طلبات الانضمام الجديدة</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-emerald-600 font-bold mt-20 animate-pulse">
          جاري جلب الطلبات...
        </div>
      ) : pendingMerchants.length === 0 ? (
        <div className="bg-white rounded-[30px] p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <CheckCircle size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-black text-gray-400">لا يوجد طلبات معلقة!</h2>
          <p className="text-xs text-gray-400 font-bold mt-2">لقد قمت بمراجعة جميع التجار.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingMerchants.map((merchant) => (
            <div key={merchant.id} className="bg-white rounded-[25px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Store size={20} className="text-emerald-600" />
                    {merchant.shop_name || 'مطعم غير معروف'}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">ID: {merchant.id.substring(0, 8)}...</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border border-amber-100">
                  <Clock size={12} /> قيد المراجعة
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => approveMerchant(merchant.id, merchant.shop_name)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-md shadow-emerald-100"
                >
                  <CheckCircle size={18} />
                  موافقة وتفعيل الحساب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}