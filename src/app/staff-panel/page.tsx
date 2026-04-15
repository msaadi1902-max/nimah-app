'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Store, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function StaffPanel() {
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingMeals()
  }, [])

  const fetchPendingMeals = async () => {
    setLoading(true)
    // جلب الوجبات التي لم تتم الموافقة عليها بعد (is_approved = false)
    const { data, error } = await supabase
      .from('meals')
      .select('*, profiles:merchant_id(shop_name, full_name)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (data) setPendingMeals(data)
    setLoading(false)
  }

  // دالة الموافقة على العرض
  const handleApprove = async (mealId: number) => {
    const confirmApprove = window.confirm('هل أنت متأكد من قبول هذا العرض ونشره في السوق؟')
    if (!confirmApprove) return

    const { error } = await supabase
      .from('meals')
      .update({ is_approved: true })
      .eq('id', mealId)

    if (!error) {
      alert('✅ تم قبول العرض ونشره بنجاح!')
      setPendingMeals(pendingMeals.filter(meal => meal.id !== mealId))
    } else {
      alert('❌ حدث خطأ أثناء القبول: ' + error.message)
    }
  }

  // دالة رفض وحذف العرض
  const handleReject = async (mealId: number) => {
    const confirmReject = window.confirm('هل أنت متأكد من رفض هذا العرض؟ سيتم حذفه نهائياً.')
    if (!confirmReject) return

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)

    if (!error) {
      alert('🗑️ تم رفض وحذف العرض.')
      setPendingMeals(pendingMeals.filter(meal => meal.id !== mealId))
    } else {
      alert('❌ حدث خطأ أثناء الحذف: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* الهيدر الخاص بالموظفين */}
      <div className="bg-slate-800 text-white p-8 rounded-b-[40px] shadow-lg mb-8">
        <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
          <AlertCircle className="text-amber-400" /> لوحة الموظفين - مراجعة العروض
        </h1>
        <p className="text-sm text-slate-300 font-bold">
          لديك ({pendingMeals.length}) عروض بانتظار المراجعة والتدقيق
        </p>
      </div>

      <div className="px-6">
        {pendingMeals.length === 0 ? (
          <div className="bg-white p-10 rounded-[30px] text-center border border-gray-100 shadow-sm">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <h2 className="text-lg font-black text-gray-800">صندوق المراجعة فارغ!</h2>
            <p className="text-sm text-gray-500 font-bold mt-2">عمل رائع، لقد قمت بمراجعة كافة العروض المقدمة من التجار.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingMeals.map(meal => (
              <div key={meal.id} className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-100">
                
                {/* صورة العرض وتفاصيل التاجر */}
                <div className="relative h-48 bg-gray-100">
                  <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                    <Store size={14} className="text-emerald-600" />
                    <span className="text-xs font-black text-gray-800">
                      {meal.profiles?.shop_name || meal.profiles?.full_name || 'تاجر غير معروف'}
                    </span>
                  </div>
                </div>

                {/* تفاصيل الوجبة للمراجعة */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg mb-2 inline-block">
                        {meal.category}
                      </span>
                      <h3 className="font-black text-lg text-gray-900">{meal.name}</h3>
                    </div>
                    <div className="text-left bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="block text-[10px] text-gray-400 line-through font-bold">{meal.original_price} {meal.currency}</span>
                      <span className="font-black text-emerald-600 text-lg">{meal.discounted_price} {meal.currency}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><Calendar size={12}/> الصلاحية</span>
                      <span className="text-xs font-black text-gray-800">{meal.start_date} <br/>إلى {meal.end_date}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><Clock size={12}/> الاستلام</span>
                      <span className="text-xs font-black text-gray-800">{meal.pickup_time}</span>
                    </div>
                  </div>

                  {/* أزرار القرار (قبول / رفض) */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleApprove(meal.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-colors shadow-lg shadow-emerald-200"
                    >
                      <CheckCircle size={18} /> قبول العرض
                    </button>
                    <button 
                      onClick={() => handleReject(meal.id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-colors"
                    >
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