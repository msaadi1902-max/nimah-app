'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Clock, Eye, Loader2, ShieldCheck, ArrowRight, Wallet, Utensils, Info, Images, AlertTriangle, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// 👑 1. حماية الكود عبر تعريف هياكل البيانات (TypeScript Interfaces)
interface TopupRequest {
  id: number;
  user_id: string;
  amount: number;
  receipt_url: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface PendingMeal {
  id: number;
  name: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  currency: string;
  quantity: number;
  pickup_time: string;
  image_url: string;
  images_gallery?: string[];
  created_at: string;
  profiles?: { shop_name: string };
}

export default function AdminDashboard() {
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'meals' | 'topups'>('meals')
  const [requests, setRequests] = useState<TopupRequest[]>([])
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([])
  
  const [loading, setLoading] = useState(true)
  // 👑 تتبع ذكي لزر التحميل (لتجنب دوران كل الأزرار معاً)
  const [actionLoading, setActionLoading] = useState<{ id: number, type: 'approve' | 'reject' } | null>(null)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  // 👑 2. جدار الحماية (Security Firewall)
  const checkAuthAndFetchData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return router.replace('/admin-login')

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      
      // السماح للموظف والمدير العام فقط بالدخول
      if (profile?.role !== 'staff' && profile?.role !== 'super_admin') {
        alert('🚫 تم منع الوصول: هذه اللوحة مخصصة لموظفي الجودة فقط.')
        return router.replace('/')
      }

      fetchData()
    } catch (error) {
      console.error("Auth Error:", error)
      router.replace('/')
    }
  }

  const fetchData = async () => {
    try {
      // جلب طلبات الشحن بانتظار الموافقة
      const { data: topupsData } = await supabase
        .from('topup_requests')
        .select('*, profiles(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (topupsData) setRequests(topupsData as TopupRequest[])

      // جلب العروض بانتظار المراجعة
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*, profiles:merchant_id(shop_name)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
      if (mealsData) setPendingMeals(mealsData as PendingMeal[])

    } catch (error) {
      console.error("Fetch Data Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // === 1. معالجة طلبات الشحن ===
  const handleTopupAction = async (requestId: number, userId: string, amount: number, status: 'approved' | 'rejected', userName: string) => {
    if (status === 'rejected' && !window.confirm(`هل أنت متأكد من رفض طلب الشحن للمستخدم ${userName}؟`)) return;
    
    setActionLoading({ id: requestId, type: status === 'approved' ? 'approve' : 'reject' })
    try {
      if (status === 'approved') {
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
        const newBalance = (profile?.wallet_balance || 0) + amount
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)
      }
      await supabase.from('topup_requests').update({ status }).eq('id', requestId)
      
      alert(status === 'approved' ? '✅ تمت الموافقة وشحن الرصيد بنجاح' : '❌ تم رفض الطلب')
      setRequests(requests.filter(r => r.id !== requestId))
    } catch (err) {
      alert('⚠️ حدث خطأ في معالجة الطلب.')
    } finally {
      setActionLoading(null)
    }
  }

  // === 2. معالجة طلبات العروض (الوجبات) ===
  const handleMealAction = async (mealId: number, action: 'approve' | 'reject', mealName: string) => {
    if (action === 'reject' && !window.confirm(`هل أنت متأكد من رفض وحذف العرض "${mealName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;

    setActionLoading({ id: mealId, type: action })
    try {
      if (action === 'approve') {
        const { error } = await supabase.from('meals').update({ is_approved: true }).eq('id', mealId)
        if (error) throw error
        alert('🚀 تمت الموافقة على العرض ونشره في السوق بنجاح!')
      } else {
        const { error } = await supabase.from('meals').delete().eq('id', mealId)
        if (error) throw error
        alert('🗑️ تم رفض العرض وحذفه من النظام.')
      }
      setPendingMeals(pendingMeals.filter(m => m.id !== mealId))
    } catch (err: any) {
      alert('⚠️ خطأ النظام: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-right font-sans" dir="rtl">
      
      {/* 👑 الهيدر الإداري الاحترافي */}
      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="bg-white/10 p-2.5 rounded-xl active:scale-95 transition-transform hover:bg-white/20">
            <ArrowRight size={20} />
          </button>
          <div className="flex flex-col items-end">
            <h1 className="text-2xl font-black flex items-center gap-2">
              لوحة الموظفين <ShieldCheck className="text-emerald-400" size={28} />
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">مراقبة الجودة والمالية</p>
          </div>
        </div>

        {/* 👑 تبويبات التنقل الذكية */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl relative z-10 backdrop-blur-xl border border-slate-700 shadow-inner">
          <button 
            onClick={() => setActiveTab('meals')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'meals' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Utensils size={16} /> مراجعة العروض 
            {pendingMeals.length > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${activeTab === 'meals' ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-500 text-slate-900'}`}>{pendingMeals.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('topups')} 
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'topups' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Wallet size={16} /> طلبات الشحن
            {requests.length > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${activeTab === 'topups' ? 'bg-slate-900 text-blue-400' : 'bg-blue-500 text-white'}`}>{requests.length}</span>}
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600 space-y-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-sm font-black text-slate-400 tracking-widest animate-pulse">جاري فحص البيانات...</p>
          </div>
        ) : activeTab === 'topups' ? (
          /* =================== قسم طلبات الشحن =================== */
          requests.length === 0 ? (
            <div className="bg-white p-12 rounded-[35px] text-center border border-dashed border-slate-200 shadow-sm animate-in zoom-in-95">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-900 font-black mb-1">لا توجد طلبات شحن</p>
              <p className="text-xs text-slate-400 font-bold">جميع الطلبات المالية تمت معالجتها بنجاح.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 space-y-5 relative overflow-hidden animate-in slide-in-from-bottom-4 hover:shadow-md transition-shadow">
                  
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-emerald-600 font-black text-xl border border-emerald-100/50 shadow-sm">
                      {req.amount} €
                    </div>
                    <div className="text-left bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 block uppercase">تاريخ الطلب</span>
                      <span className="text-xs font-bold text-slate-700">{new Date(req.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                      <UserX size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-tight">{req.profiles?.full_name || 'مستخدم مجهول'}</h3>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">{req.profiles?.email}</p>
                    </div>
                  </div>

                  <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                    <img src={req.receipt_url} alt="إيصال الدفع" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <a href={req.receipt_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black text-xs gap-2 backdrop-blur-sm">
                      <Eye size={24} /> عرض الإيصال بدقة عالية
                    </a>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      disabled={actionLoading !== null}
                      onClick={() => handleTopupAction(req.id, req.user_id, req.amount, 'approved', req.profiles?.full_name || '')}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionLoading?.id === req.id && actionLoading.type === 'approve' ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> اعتماد الشحن</>}
                    </button>
                    <button 
                      disabled={actionLoading !== null}
                      onClick={() => handleTopupAction(req.id, req.user_id, req.amount, 'rejected', req.profiles?.full_name || '')}
                      className="flex-1 bg-white text-rose-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border-2 border-rose-100 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {actionLoading?.id === req.id && actionLoading.type === 'reject' ? <Loader2 className="animate-spin" size={18} /> : <><XCircle size={18} /> رفض الإيصال</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* =================== قسم مراجعة العروض (الوجبات) =================== */
          pendingMeals.length === 0 ? (
            <div className="bg-white p-12 rounded-[35px] text-center border border-dashed border-slate-200 shadow-sm animate-in zoom-in-95">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-900 font-black mb-1">لا توجد عروض للمراجعة</p>
              <p className="text-xs text-slate-400 font-bold">جميع العروض تم تدقيقها ونشرها.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMeals.map((meal) => {
                const images = meal.images_gallery && meal.images_gallery.length > 0 ? meal.images_gallery : [meal.image_url]

                return (
                  <div key={meal.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 space-y-5 animate-in slide-in-from-bottom-4 hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                      <div>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg mb-2 inline-block">
                          {meal.profiles?.shop_name || 'تاجر معتمد'}
                        </span>
                        <h3 className="font-black text-slate-900 text-lg leading-tight">{meal.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1"><Clock size={10}/> رفع بتاريخ: {new Date(meal.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 line-through mb-0.5">{meal.original_price} {meal.currency}</p>
                        <p className="text-xl font-black text-emerald-600 leading-none">{meal.discounted_price} <span className="text-xs">{meal.currency || 'ل.س'}</span></p>
                      </div>
                    </div>

                    {/* عرض الصور */}
                    <div>
                      <p className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-1"><Images size={14} /> الصور المرفقة ({images.length})</p>
                      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                        {images.map((img: string, idx: number) => (
                          <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* الملاحظات */}
                    {meal.description && (
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-600 mb-1 flex items-center gap-1"><Info size={14} /> مواصفات وملاحظات العرض:</p>
                        <p className="text-xs text-slate-700 font-bold whitespace-pre-line leading-relaxed">{meal.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-center">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">الكمية المتوفرة</span>
                        <span className="text-base font-black text-slate-900 bg-white px-4 py-1 rounded-xl shadow-sm border border-slate-100 inline-block">{meal.quantity}</span>
                      </div>
                      <div className="text-center border-r border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">وقت الاستلام</span>
                        <span className="text-xs font-black text-slate-900 mt-1.5 inline-block">{meal.pickup_time}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        disabled={actionLoading !== null}
                        onClick={() => handleMealAction(meal.id, 'approve', meal.name)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                      >
                        {actionLoading?.id === meal.id && actionLoading.type === 'approve' ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> قبول ونشر</>}
                      </button>
                      <button 
                        disabled={actionLoading !== null}
                        onClick={() => handleMealAction(meal.id, 'reject', meal.name)}
                        className="flex-1 bg-white hover:bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border-2 border-rose-100 disabled:opacity-50"
                      >
                        {actionLoading?.id === meal.id && actionLoading.type === 'reject' ? <Loader2 className="animate-spin" size={18} /> : <><XCircle size={18} /> رفض للحذف</>}
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