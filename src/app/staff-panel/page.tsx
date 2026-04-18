'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Store, Loader2, Calendar, Clock, AlertCircle, Package, RefreshCw } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function StaffPanel() {
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPendingMeals()
  }, [])

  const fetchPendingMeals = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*, profiles:merchant_id(shop_name, full_name)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setPendingMeals(data)
    } catch (error: any) {
      console.error('Error fetching meals:', error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (mealId: number) => {
    const confirmApprove = window.confirm('هل أنت متأكد من قبول هذا العرض ونشره في السوق؟')
    if (!confirmApprove) return

    try {
      const { error } = await supabase
        .from('meals')
        .update({ is_approved: true })
        .eq('id', mealId)

      if (error) throw error
      alert('✅ تم قبول العرض ونشره بنجاح!')
      setPendingMeals(prev => prev.filter(meal => meal.id !== mealId))
    } catch (error: any) {
      alert('❌ حدث خطأ أثناء القبول: ' + error.message)
    }
  }

  const handleReject = async (mealId: number) => {
    const confirmReject = window.confirm('هل أنت متأكد من رفض هذا العرض؟ سيتم حذفه نهائياً.')
    if (!confirmReject) return

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (error) throw error
      alert('🗑️ تم رفض وحذف العرض.')
      setPendingMeals(prev => prev.filter(meal => meal.id !== mealId))
    } catch (error: any) {
      alert('❌ حدث خطأ أثناء الحذف: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-emerald-600">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <span className="text-sm font-black tracking-widest">جاري جلب العروض المعلقة...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* الهيدر المطور */}
      <div className="bg-slate-900 text-white p-8 rounded-b-[40px] shadow-lg mb-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
            <AlertCircle className="text-amber-400" /> لوحة التدقيق
          </h1>
          <p className="text-sm text-slate-400 font-bold">
            لديك <span className="text-emerald-400 mx-1 px-2 py-0.5 bg-emerald-400/10 rounded-md">{pendingMeals.length}</span> عروض بانتظار قرارك
          </p>
        </div>
        <button 
          onClick={fetchPendingMeals} 
          disabled={refreshing}
          className="relative z-10 bg-slate-800 p-3 rounded-2xl text-emerald-400 hover:bg-slate-700 transition-all active:scale-95"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="px-6">
        {pendingMeals.length === 0 ? (
          <div className="bg-white p-12 rounded-[30px] text-center border border-gray-100 shadow-sm animate-in zoom-in duration-500">
            <CheckCircle size={56} className="mx-auto text-emerald-400 mb-4 bg-emerald-50 p-3 rounded-full" />
            <h2 className="text-xl font-black text-gray-800 mb-2">صندوق المراجعة فارغ!</h2>
            <p className="text-sm text-gray-500 font-bold leading-relaxed">عمل رائع، لا توجد أي عروض معلقة حالياً. لقد قمت بإنجاز كل مهامك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingMeals.map(meal => (
              <div key={meal.id} className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                
                <div className="relative h-48 bg-gray-100">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border border-white/20">
                    <Store size={14} className="text-emerald-600" />
                    <span className="text-xs font-black text-gray-800">
                      {meal.profiles?.shop_name || meal.profiles?.full_name || 'تاجر غير معروف'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mb-2 inline-block">
                        {meal.category}
                      </span>
                      <h3 className="font-black text-lg text-gray-900 leading-tight">{meal.name}</h3>
                    </div>
                    <div className="text-left bg-gray-50 p-2.5 rounded-xl border border-gray-100 min-w-[80px]">
                      <span className="block text-[10px] text-gray-400 line-through font-bold">{meal.original_price} {meal.currency || '€'}</span>
                      <span className="font-black text-emerald-600 text-lg leading-none">{meal.discounted_price} <span className="text-sm">{meal.currency || '€'}</span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1 border border-gray-100">
                      <span className="text-[9px] text-gray-500 font-bold flex items-center gap-1"><Package size={12} className="text-blue-500"/> الكمية</span>
                      <span className="text-xs font-black text-gray-800">{meal.quantity}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1 border border-gray-100">
                      <span className="text-[9px] text-gray-500 font-bold flex items-center gap-1"><Calendar size={12} className="text-orange-500"/> الصلاحية</span>
                      <span className="text-[10px] font-black text-gray-800 leading-tight">{meal.start_date || '-'} <br/>لـ {meal.end_date || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1 border border-gray-100">
                      <span className="text-[9px] text-gray-500 font-bold flex items-center gap-1"><Clock size={12} className="text-emerald-500"/> الاستلام</span>
                      <span className="text-[10px] font-black text-gray-800 leading-tight">{meal.pickup_time || '-'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button onClick={() => handleApprove(meal.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                      <CheckCircle size={18} /> قبول ونشر
                    </button>
                    <button onClick={() => handleReject(meal.id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95">
                      <XCircle size={18} /> رفض وحذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}