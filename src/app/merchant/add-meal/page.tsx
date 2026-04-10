'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldAlert, CheckCircle, XCircle, Utensils, Store, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminMealsPage() {
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPendingMeals()
  }, [])

  // جلب العروض التي تنتظر الموافقة
  const fetchPendingMeals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('is_approved', false) // نجلب الغير موافق عليها فقط
      .order('created_at', { ascending: false })

    if (data) setPendingMeals(data)
    setLoading(false)
  }

  // دالة الموافقة على العرض
  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('meals')
      .update({ is_approved: true })
      .eq('id', id)

    if (!error) {
      // إخفاء العرض من هذه الشاشة لأنه تمت الموافقة عليه
      setPendingMeals(pendingMeals.filter(meal => meal.id !== id))
      alert('✅ تمت الموافقة على العرض! سيظهر للزبائن الآن.')
    }
  }

  // دالة رفض العرض (حذفه)
  const handleReject = async (id: number) => {
    if (confirm('هل أنت متأكد من رفض وحذف هذا العرض؟')) {
      const { error } = await supabase.from('meals').delete().eq('id', id)
      if (!error) {
        setPendingMeals(pendingMeals.filter(meal => meal.id !== id))
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      
      {/* هيدر الإدارة */}
      <div className="bg-slate-900 text-white p-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-2xl font-black flex items-center gap-2 mb-1">
            <ShieldAlert className="text-rose-400" /> إدارة العروض الجديدة
          </h1>
          <p className="text-gray-400 font-bold text-sm">راجع طلبات التجار ووافق عليها لتُنشر في التطبيق</p>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20">
        
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-[30px] shadow-lg"><Loader2 className="animate-spin text-slate-800 w-10 h-10" /></div>
        ) : pendingMeals.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-[35px] shadow-lg border border-gray-100">
            <CheckCircle size={50} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="font-black text-gray-900 text-xl mb-2">الوضع ممتاز!</h3>
            <p className="text-gray-500 font-bold text-sm">لا توجد عروض بانتظار المراجعة حالياً.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-black">{pendingMeals.length}</span>
              <h2 className="text-sm font-black text-gray-600">عروض قيد الانتظار</h2>
            </div>
            
            {pendingMeals.map((meal) => (
              <div key={meal.id} className="bg-white p-5 rounded-[30px] shadow-md border border-gray-100 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                  <div className="flex gap-4">
                    <img src={meal.image_url} alt={meal.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                    <div>
                      <h3 className="font-black text-lg text-gray-900 leading-tight mb-1">{meal.name}</h3>
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                        <Store size={12} /> {meal.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg text-emerald-600">{meal.discounted_price} €</p>
                    <p className="text-[10px] text-gray-400 font-bold line-through">{meal.original_price} €</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleApprove(meal.id)}
                    className="flex-1 bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-700 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle size={18} /> قبول ونشر
                  </button>
                  <button 
                    onClick={() => handleReject(meal.id)}
                    className="flex-1 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <XCircle size={18} /> رفض العرض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}