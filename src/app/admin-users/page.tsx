'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Store, Clock, ShieldAlert, Loader2, UserCheck, ArrowRight, XCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminUsersPage() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchMerchants = async () => {
    setLoading(true)
    // نجلب كل من يحمل رتبة merchant لنتمكن من إدارتهم بالكامل
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'merchant')
      .order('created_at', { ascending: false })
    
    if (data) setMerchants(data)
    setLoading(false)
  }

  useEffect(() => { fetchMerchants() }, [])

  const toggleApproval = async (id: string, shopName: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'إيقاف' : 'تفعيل';
    if (confirm(`هل أنت متأكد من ${actionText} حساب مطعم "${shopName}"؟`)) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: !currentStatus })
        .eq('id', id)
      
      if (!error) {
        alert(`✅ تم ${actionText} الحساب بنجاح!`)
        setMerchants(merchants.map(m => m.id === id ? { ...m, is_approved: !currentStatus } : m))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      
      {/* الهيدر بتصميمك الأنيق مع إضافة زر الرجوع */}
      <div className="bg-slate-900 text-white p-8 pt-12 pb-16 rounded-b-[50px] shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-emerald-600 p-4 rounded-[22px] text-white shadow-lg">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic">إدارة الشركاء 🛡️</h1>
            <p className="text-xs text-emerald-100/70 font-bold mt-1">الموافقة والتحكم في حسابات التجار</p>
          </div>
        </div>
      </div>

      <div className="px-6 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
             <Loader2 className="animate-spin text-emerald-600" size={35} />
             <p className="text-gray-400 font-bold text-sm italic">جاري مراجعة سجلات التجار...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="bg-white rounded-[45px] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <UserCheck size={80} className="text-emerald-100 mb-6" />
            <h2 className="text-xl font-black text-gray-900">لا يوجد تجار حالياً</h2>
            <p className="text-sm text-gray-400 font-bold mt-3 leading-relaxed">بمجرد تسجيل مطاعم جديدة ستظهر طلباتهم هنا.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {merchants.map((merchant) => (
              <div key={merchant.id} className="bg-white rounded-[35px] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                {/* شريط الحالة الذكي */}
                <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${merchant.is_approved ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                      <Store size={26} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">
                        {merchant.shop_name || 'مطعم قيد التسمية'}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold tracking-tight">{merchant.email}</p>
                    </div>
                  </div>
                  
                  {merchant.is_approved ? (
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                      <ShieldCheck size={14} /> حساب معتمد
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-amber-100 flex items-center gap-1 animate-pulse">
                      <Clock size={14} /> بانتظار المراجعة
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => toggleApproval(merchant.id, merchant.shop_name, merchant.is_approved)}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                    merchant.is_approved 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-100' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                  }`}
                >
                  {merchant.is_approved ? (
                    <><XCircle size={18} /> إيقاف صلاحية التاجر</>
                  ) : (
                    <><CheckCircle size={18} /> تفعيل التاجر الآن</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}