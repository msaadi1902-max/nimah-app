'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Store, CheckCircle, XCircle, ShieldCheck, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // جلب البيانات الحقيقية من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      // نفترض أن اسم الجدول هو users أو profiles حسب إعدادك
      const { data, error } = await supabase
        .from('users') // إذا كان اسم الجدول مختلفاً عندك، قم بتغييره هنا
        .select('*')
        .eq('role', 'pending_merchant')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setRequests(data)
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // تحديث حالة الطلب في قاعدة البيانات
  const handleAction = async (id: string | number, action: 'accept' | 'reject') => {
    try {
      // إذا قبول نجعله merchant، إذا رفض نجعله rejected
      const newRole = action === 'accept' ? 'merchant' : 'rejected'
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id)

      if (error) throw error

      // إزالة الطلب من الواجهة بعد نجاح العملية
      setRequests(requests.filter(req => req.id !== id))
      alert(action === 'accept' ? 'تم قبول المتجر وتفعيله بنجاح ✅' : 'تم رفض طلب الانضمام ❌')
      
    } catch (error: any) {
      alert('حدث خطأ أثناء معالجة الطلب: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الإداري */}
      <div className="bg-slate-900 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg mb-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <h1 className="relative z-10 text-xl font-black flex items-center gap-2">
          <ShieldCheck className="text-emerald-400"/> طلبات الانضمام
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-emerald-600 gap-3">
            <Loader2 className="animate-spin" size={35} />
            <span className="font-bold text-sm text-gray-500">جاري جلب الطلبات...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <Store size={40} className="mx-auto text-gray-200 mb-3"/> 
            <p className="font-bold text-gray-400 text-lg">لا توجد طلبات معلقة</p>
            <p className="text-xs text-gray-400 mt-1">جميع المتاجر تمت مراجعتها بنجاح.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400"></div>
              
              <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                <div className="bg-amber-50 p-3 rounded-xl text-amber-600 shrink-0">
                  <Store size={24} />
                </div>
                <div>
                  {/* استخدمنا req.name أو req.store_name لتناسب أسماء الأعمدة في قاعدة بياناتك */}
                  <h3 className="font-black text-gray-900">{req.name || req.store_name || 'اسم المتجر غير متوفر'}</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    بإدارة: <span className="text-gray-700">{req.owner || req.full_name || 'غير معروف'}</span>
                  </p>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 inline-block px-2 py-1 rounded-md mt-1">
                    {req.type || req.category || 'تصنيف عام'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAction(req.id, 'accept')} 
                  className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 py-3 rounded-xl text-xs font-black flex justify-center items-center gap-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle size={16}/> قبول المتجر
                </button>
                <button 
                  onClick={() => handleAction(req.id, 'reject')} 
                  className="flex-1 bg-rose-50 text-rose-600 border border-rose-100 py-3 rounded-xl text-xs font-black flex justify-center items-center gap-1.5 active:scale-95 transition-all"
                >
                  <XCircle size={16}/> رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <BottomNav activeTab="profile" />
    </div>
  )
}