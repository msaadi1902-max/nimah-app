'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  CheckCircle, XCircle, Store, Loader2, Calendar, Clock, AlertCircle, 
  Package, RefreshCw, Star, Wallet, Landmark, ArrowUpRight 
} from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function StaffPanel() {
  const [activeTab, setActiveTab] = useState<'meals' | 'finance'>('meals')
  
  // حالات قسم الوجبات
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  
  // حالات قسم المالية (الجديدة)
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setRefreshing(true)
    try {
      if (activeTab === 'meals') {
        const { data, error } = await supabase
          .from('meals')
          .select(`*, profiles:merchant_id (shop_name, full_name)`)
          .eq('is_approved', false)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (data) setPendingMeals(data)
      } else {
        // جلب العمليات المالية المعلقة مع بيانات صاحب الطلب
        const { data, error } = await supabase
          .from('transactions')
          .select(`*, profiles:user_id (full_name, email)`)
          .eq('status', 'pending')
          .order('created_at', { ascending: true }) // الأقدم أولاً
        if (error) throw error
        if (data) setPendingTransactions(data)
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ===================== دوال قسم العروض =====================
  const handleApproveMeal = async (mealId: number, isGolden: boolean) => {
    const confirmMsg = isGolden 
      ? '👑 هل أنت متأكد من تمييز هذا العرض كـ "عرض ذهبي"؟ سيظهر في أعلى السوق.' 
      : '✅ هل أنت متأكد من قبول هذا العرض كـ "عرض عادي"؟'
      
    const confirmApprove = window.confirm(confirmMsg)
    if (!confirmApprove) return

    try {
      const { error } = await supabase
        .from('meals')
        .update({ is_approved: true, is_golden: isGolden })
        .eq('id', mealId)

      if (error) throw error
      alert(isGolden ? '👑 تم قبول العرض وتتويجه كعرض ذهبي بنجاح!' : '✅ تم قبول العرض العادي ونشره بنجاح!')
      setPendingMeals(prev => prev.filter(meal => meal.id !== mealId))
    } catch (error: any) {
      alert('❌ حدث خطأ أثناء القبول: ' + error.message)
    }
  }

  const handleRejectMeal = async (mealId: number) => {
    const confirmReject = window.confirm('هل أنت متأكد من رفض وحذف هذا العرض؟')
    if (!confirmReject) return
    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId)
      if (error) throw error
      alert('🗑️ تم الحذف بنجاح.')
      setPendingMeals(prev => prev.filter(meal => meal.id !== mealId))
    } catch (error: any) {
      alert('❌ حدث خطأ: ' + error.message)
    }
  }

  // ===================== دوال قسم المالية =====================
  const handleApproveTransaction = async (txId: string, userId: string, amount: number) => {
    const confirm = window.confirm(`هل استلمت الحوالة وتأكدت من إيداع مبلغ ${amount}€؟\nهذا الإجراء سيضيف الرصيد للزبون فوراً.`)
    if (!confirm) return

    try {
      // 1. جلب الرصيد الحالي للمستخدم
      const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
      const currentBalance = profile?.wallet_balance || 0
      const newBalance = currentBalance + amount

      // 2. تحديث الرصيد (إضافة المبلغ)
      const { error: profileError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)
      if (profileError) throw profileError

      // 3. تحديث حالة العملية إلى "مكتمل"
      const { error: txError } = await supabase.from('transactions').update({ status: 'completed' }).eq('id', txId)
      if (txError) throw txError

      alert(`✅ تم شحن المحفظة بنجاح. الرصيد الجديد للزبون: ${newBalance}€`)
      setPendingTransactions(prev => prev.filter(tx => tx.id !== txId))
    } catch (error: any) {
      alert('❌ حدث خطأ مالي: ' + error.message)
    }
  }

  const handleRejectTransaction = async (txId: string) => {
    const confirm = window.confirm('هل أنت متأكد من رفض طلب الشحن هذا؟')
    if (!confirm) return
    try {
      const { error } = await supabase.from('transactions').update({ status: 'rejected' }).eq('id', txId)
      if (error) throw error
      alert('تم رفض طلب الشحن ❌')
      setPendingTransactions(prev => prev.filter(tx => tx.id !== txId))
    } catch (error: any) {
      alert('❌ حدث خطأ: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-emerald-600">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <span className="text-sm font-black tracking-widest">جاري تأمين الاتصال والبيانات...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-slate-900 text-white p-8 rounded-b-[40px] shadow-lg mb-6 relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
            <AlertCircle className="text-amber-400" /> لوحة الرقابة الشاملة
          </h1>
          <p className="text-sm text-slate-400 font-bold">إدارة العروض والمعاملات المالية</p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={refreshing}
          className="relative z-10 bg-slate-800 p-3 rounded-2xl text-emerald-400 hover:bg-slate-700 transition-all active:scale-95 shadow-inner"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* شريط التبويبات (Tabs) */}
      <div className="px-6 mb-6">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 relative">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-900 rounded-xl transition-all duration-300 ease-in-out shadow-sm ${activeTab === 'meals' ? 'right-1' : 'left-1'}`}></div>
          <button onClick={() => setActiveTab('meals')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 text-sm font-black z-10 transition-colors ${activeTab === 'meals' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            <Package size={18} /> العروض ({pendingMeals.length})
          </button>
          <button onClick={() => setActiveTab('finance')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 text-sm font-black z-10 transition-colors ${activeTab === 'finance' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-700'}`}>
            <Wallet size={18} /> طلبات الشحن ({pendingTransactions.length})
          </button>
        </div>
      </div>

      <div className="px-6">
        
        {/* ===================== قسم مراجعة العروض ===================== */}
        {activeTab === 'meals' && (
          pendingMeals.length === 0 ? (
            <div className="bg-white p-12 rounded-[30px] text-center border border-gray-100 shadow-sm animate-in fade-in">
              <CheckCircle size={56} className="mx-auto text-emerald-400 mb-4 bg-emerald-50 p-3 rounded-full" />
              <h2 className="text-xl font-black text-gray-800 mb-2">صندوق العروض فارغ!</h2>
              <p className="text-sm text-gray-500 font-bold leading-relaxed">عمل رائع، لا توجد أي عروض معلقة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {pendingMeals.map(meal => {
                const merchantData = Array.isArray(meal.profiles) ? meal.profiles[0] : meal.profiles;
                const merchantName = merchantData?.shop_name || merchantData?.full_name || 'تاجر جديد';

                return (
                  <div key={meal.id} className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-100">
                    <div className="relative h-48 bg-gray-100">
                      <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border border-white/20">
                        <Store size={14} className="text-emerald-600" />
                        <span className="text-xs font-black text-gray-800">{merchantName}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mb-2 inline-block">{meal.category}</span>
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
                          <span className="text-[10px] font-black text-gray-800 leading-tight">{meal.start_date || '-'} <br/>إلى {meal.end_date || '-'}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1 border border-gray-100">
                          <span className="text-[9px] text-gray-500 font-bold flex items-center gap-1"><Clock size={12} className="text-emerald-500"/> الاستلام</span>
                          <span className="text-[10px] font-black text-gray-800 leading-tight">{meal.pickup_time || '-'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => handleApproveMeal(meal.id, true)} className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/30">
                          <Star size={18} className="fill-slate-900" /> قبول كعرض ذهبي 🔥
                        </button>
                        <div className="flex gap-3">
                          <button onClick={() => handleApproveMeal(meal.id, false)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/20">
                            <CheckCircle size={18} /> قبول عادي
                          </button>
                          <button onClick={() => handleRejectMeal(meal.id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95">
                            <XCircle size={18} /> رفض وحذف
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ===================== قسم المراجعة المالية ===================== */}
        {activeTab === 'finance' && (
          pendingTransactions.length === 0 ? (
            <div className="bg-white p-12 rounded-[30px] text-center border border-gray-100 shadow-sm animate-in fade-in">
              <Landmark size={56} className="mx-auto text-emerald-400 mb-4 bg-emerald-50 p-3 rounded-full" />
              <h2 className="text-xl font-black text-gray-800 mb-2">لا توجد طلبات شحن!</h2>
              <p className="text-sm text-gray-500 font-bold leading-relaxed">جميع الحسابات المالية محدثة، لا يوجد زبائن بانتظار الرصيد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {pendingTransactions.map(tx => {
                const userData = Array.isArray(tx.profiles) ? tx.profiles[0] : tx.profiles;
                return (
                  <div key={tx.id} className="bg-white p-5 rounded-[25px] border-2 border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-gray-900 text-lg">{userData?.full_name || 'مستخدم غير معروف'}</h3>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5">{userData?.email}</p>
                      </div>
                      <div className="text-left bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                        <span className="block text-[10px] font-black uppercase mb-0.5">المبلغ المطلوب</span>
                        <span className="text-xl font-black">{tx.amount.toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg border border-gray-200 text-gray-400"><ArrowUpRight size={18}/></div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400">رقم الإيصال / الحوالة</span>
                        <span className="font-black text-sm text-gray-800 tracking-wider">{tx.reference_number || 'بدون رقم'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => handleApproveTransaction(tx.id, tx.user_id, tx.amount)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/20">
                        <CheckCircle size={18} /> تأكيد الإيداع
                      </button>
                      <button onClick={() => handleRejectTransaction(tx.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-5 rounded-xl font-black text-sm flex justify-center items-center transition-all active:scale-95">
                        <XCircle size={18} /> رفض
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )
        )}

      </div>
    </div>
  )
}