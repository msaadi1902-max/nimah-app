'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldCheck, CheckCircle, XCircle, Star, Loader2, ShoppingBag, Eye } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminMealsPage() {
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('is_approved', false)
      .order('id', { ascending: false })
    if (data) setPendingMeals(data)
    setLoading(false)
  }

  useEffect(() => { fetchPending() }, [])

  const updateStatus = async (id: number, approved: boolean, featured: boolean = false) => {
    if (approved) {
      const { error } = await supabase.from('meals').update({ is_approved: true, is_featured: featured }).eq('id', id)
      if (!error) {
        alert(featured ? "🏆 تم تفعيل العرض كعرض متميز في الرئيسية" : "✅ تم تفعيل العرض في صفحة التصفح")
        setPendingMeals(pendingMeals.filter(m => m.id !== id))
      }
    } else {
      if (confirm("هل أنت متأكد من رفض وحذف هذا العرض نهائياً؟")) {
        const { error } = await supabase.from('meals').delete().eq('id', id)
        if (!error) {
          alert("❌ تم حذف العرض بنجاح")
          setPendingMeals(pendingMeals.filter(m => m.id !== id))
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans pb-20 text-right" dir="rtl">
      <div className="pt-10 mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">إدارة العروض <ShieldCheck className="text-emerald-400" /></h1>
          <p className="text-slate-400 text-xs mt-2 font-bold italic">مراجعة وجبات التجار قبل النشر</p>
        </div>
        <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black border border-emerald-500/30">
          {pendingMeals.length} عرض معلق
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
          <p className="text-slate-500 font-bold animate-pulse">جاري فحص العروض المعلقة...</p>
        </div>
      ) : pendingMeals.length === 0 ? (
        <div className="text-center py-24 bg-slate-800/30 rounded-[50px] border-2 border-dashed border-slate-700/50">
          <CheckCircle size={50} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 font-black text-lg">لا توجد عروض تنتظر الموافقة</p>
          <p className="text-slate-600 text-xs mt-2">كل شيء تحت السيطرة!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingMeals.map((meal) => (
            <div key={meal.id} className="bg-slate-800/50 backdrop-blur-md rounded-[40px] overflow-hidden border border-slate-700 shadow-2xl transition-all hover:border-emerald-500/30">
              <div className="relative h-56">
                <img src={meal.image_url} className="w-full h-full object-cover opacity-90" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-6">
                   <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{meal.category}</span>
                </div>
              </div>
              
              <div className="p-7">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">{meal.name}</h3>
                    <div className="flex gap-3 text-sm font-bold">
                       <span className="text-emerald-400">{meal.discounted_price} €</span>
                       <span className="text-slate-500 line-through">{meal.original_price} €</span>
                    </div>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] text-slate-500 font-bold">الكمية: {meal.quantity}</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ID: #{meal.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => updateStatus(meal.id, true, false)} className="bg-slate-700 hover:bg-emerald-600 text-white p-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> تفعيل عادي
                  </button>
                  <button onClick={() => updateStatus(meal.id, true, true)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2">
                    <Star size={16} fill="currentColor" /> تفعيل + تمييز
                  </button>
                  <button onClick={() => updateStatus(meal.id, false)} className="col-span-2 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white p-4 rounded-2xl font-black text-xs transition-all mt-2 border border-rose-500/20">
                    <XCircle size={16} /> رفض وحذف العرض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}