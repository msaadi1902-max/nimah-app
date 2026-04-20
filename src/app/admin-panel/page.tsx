'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Clock, Eye, Loader2, ShieldCheck, ArrowRight, Wallet, Utensils, Info, Images } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminDashboard() {
  const router = useRouter()
  
  // 👑 الميزة الجديدة: نظام التبويبات للتنقل بين المهام
  const [activeTab, setActiveTab] = useState<'meals' | 'topups'>('meals')
  
  // حالات البيانات
  const [requests, setRequests] = useState<any[]>([])
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // جلب طلبات الشحن
    const { data: topupsData } = await supabase
      .from('topup_requests')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (topupsData) setRequests(topupsData)

    // 👑 الميزة الجديدة: جلب الوجبات التي بانتظار الموافقة
    const { data: mealsData } = await supabase
      .from('meals')
      .select('*, profiles:merchant_id(shop_name)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
    if (mealsData) setPendingMeals(mealsData)

    setLoading(false)
  }

  // === 1. معالجة طلبات الشحن ===
  const handleTopupAction = async (requestId: number, userId: string, amount: number, status: 'approved' | 'rejected') => {
    setActionLoading(requestId)
    try {
      if (status === 'approved') {
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
        const newBalance = (profile?.wallet_balance || 0) + amount
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)
      }
      await supabase.from('topup_requests').update({ status }).eq('id', requestId)
      
      alert(status === 'approved' ? 'تمت الموافقة وشحن الرصيد بنجاح ✅' : 'تم رفض الطلب ❌')
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (err) {
      alert('حدث خطأ في المعالجة')
    } finally {
      setActionLoading(null)
    }
  }

  // === 2. معالجة طلبات الوجبات (الميزة الجديدة) ===
  const handleMealAction = async (mealId: number, action: 'approve' | 'reject') => {
    setActionLoading(mealId)
    try {
      if (action === 'approve') {
        const { error } = await supabase.from('meals').update({ is_approved: true }).eq('id', mealId)
        if (error) throw error
        alert('تمت الموافقة على العرض ونشره في السوق بنجاح 🚀')
      } else {
        // إذا تم الرفض، نحذف العرض تماماً
        const { error } = await supabase.from('meals').delete().eq('id', mealId)
        if (error) throw error
        alert('تم رفض العرض وحذفه ❌')
      }
      // تحديث القائمة فوراً
      setPendingMeals(pendingMeals.filter(m => m.id !== mealId))
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 pt-16 pb-6 rounded-b-[50px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full -ml-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl mb-4 active:scale-90 transition-transform"><ArrowRight size={20} /></button>
        <h1 className="text-2xl font-black italic flex items-center gap-2">اللوحة الإدارية <ShieldCheck className="text-emerald-400" /></h1>
        <p className="text-xs opacity-60 font-bold mt-1 uppercase tracking-widest">إدارة العروض والشحن</p>

        {/* 👑 تبويبات التنقل */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl mt-6 relative z-10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('meals')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'meals' ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-slate-300 hover:text-white'}`}
          >
            <Utensils size={16} /> مراجعة العروض 
            {pendingMeals.length > 0 && <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">{pendingMeals.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('topups')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'topups' ? 'bg-white text-slate-900 shadow-md scale-100' : 'text-slate-300 hover:text-white'}`}
          >
            <Wallet size={16} /> طلبات الشحن
            {requests.length > 0 && <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">{requests.length}</span>}
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-emerald-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-black text-gray-400">جاري جلب البيانات...</p>
          </div>
        ) : activeTab === 'topups' ? (
          /* =================== قسم طلبات الشحن =================== */
          requests.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200 animate-in fade-in">
              <Clock size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-black">لا توجد طلبات شحن بانتظارك</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-4 relative overflow-hidden animate-in slide-in-from-bottom-4">
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

                <div className="relative group rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-100">
                  <img src={req.receipt_url} alt="Receipt" className="w-full h-full object-cover" />
                  <a href={req.receipt_url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-2">
                    <Eye size={18} /> عرض الإيصال بحجم كامل
                  </a>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={actionLoading === req.id}
                    onClick={() => handleTopupAction(req.id, req.user_id, req.amount, 'approved')}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                  >
                    {actionLoading === req.id ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> قبول</>}
                  </button>
                  <button 
                    disabled={actionLoading === req.id}
                    onClick={() => handleTopupAction(req.id, req.user_id, req.amount, 'rejected')}
                    className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-100"
                  >
                    <XCircle size={16} /> رفض
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          /* =================== قسم مراجعة العروض (الوجبات) =================== */
          pendingMeals.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200 animate-in fade-in">
              <Utensils size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-black">لا توجد عروض بانتظار المراجعة</p>
            </div>
          ) : (
            pendingMeals.map((meal) => {
              // تجهيز مصفوفة الصور لعرضها للإدارة
              const images = meal.images_gallery && meal.images_gallery.length > 0 ? meal.images_gallery : [meal.image_url]

              return (
                <div key={meal.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-bottom-4">
                  
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-2 inline-block">
                        {meal.profiles?.shop_name || 'تاجر معتمد'}
                      </span>
                      <h3 className="font-black text-gray-900 text-lg leading-tight">{meal.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">تم الرفع: {new Date(meal.created_at).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="text-left bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 line-through mb-0.5">{meal.original_price}</p>
                      <p className="text-xl font-black text-emerald-600 leading-none">{meal.discounted_price} <span className="text-[10px]">{meal.currency || 'ل.س'}</span></p>
                    </div>
                  </div>

                  {/* 👑 عرض الصور المتعددة للموظف */}
                  <div>
                    <p className="text-[10px] font-black text-gray-500 mb-2 flex items-center gap-1"><Images size={12} /> الصور المرفقة ({images.length})</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                      {images.map((img: string, idx: number) => (
                        <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 👑 عرض الوصف والملاحظات */}
                  {meal.description && (
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                      <p className="text-[10px] font-black text-emerald-700 mb-1 flex items-center gap-1"><Info size={12} /> ملاحظات التاجر:</p>
                      <p className="text-xs text-gray-700 font-bold whitespace-pre-line leading-relaxed">{meal.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <span className="block text-[9px] font-black text-gray-400">الكمية المتوفرة</span>
                      <span className="text-sm font-black text-gray-900">{meal.quantity}</span>
                    </div>
                    <div className="text-center border-r border-gray-200">
                      <span className="block text-[9px] font-black text-gray-400">وقت الاستلام</span>
                      <span className="text-sm font-black text-gray-900">{meal.pickup_time}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      disabled={actionLoading === meal.id}
                      onClick={() => handleMealAction(meal.id, 'approve')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                    >
                      {actionLoading === meal.id ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> قبول ونشر</>}
                    </button>
                    <button 
                      disabled={actionLoading === meal.id}
                      onClick={() => handleMealAction(meal.id, 'reject')}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-rose-200"
                    >
                      <XCircle size={18} /> رفض وحذف
                    </button>
                  </div>

                </div>
              )
            })
          )
        )}
      </div>
    </div>
  )
}