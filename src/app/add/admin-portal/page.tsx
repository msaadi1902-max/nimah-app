'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldCheck, CheckCircle, XCircle, Star, Loader2, externalLink, ShoppingBag } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminPortal() {
  const [pendingMeals, setPendingMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // جلب المنتجات التي لم يتم الموافقة عليها بعد
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

  // دالة الموافقة أو الرفض
  const updateStatus = async (id: number, approved: boolean, featured: boolean = false) => {
    const { error } = await supabase
      .from('meals')
      .update({ is_approved: approved, is_featured: featured })
      .eq('id', id)
    
    if (!error) {
      alert(approved ? "✅ تم تفعيل المنتج للجمهور" : "❌ تم حذف المنتج")
      setPendingMeals(pendingMeals.filter(m => m.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans pb-20 text-right" dir="rtl">
      <div className="pt-10 mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">لوحة المدير <ShieldCheck className="text-emerald-400" /></h1>
          <p className="text-slate-400 text-xs mt-1 font-bold">إدارة طلبات الانضمام والموافقة</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl text-xs font-black">
          {pendingMeals.length} طلبات تنتظر
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : pendingMeals.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-700">
          <ShoppingBag size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد طلبات جديدة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingMeals.map((meal) => (
            <div key={meal.id} className="bg-slate-800 rounded-[35px] overflow-hidden border border-slate-700 shadow-2xl">
              <img src={meal.image_url} className="h-48 w-full object-cover opacity-80" alt="" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black">{meal.name}</h3>
                    <p className="text-emerald-400 font-bold text-xs">{meal.category} • {meal.price} €</p>
                  </div>
                  <span className="text-[10px] bg-slate-700 px-2 py-1 rounded-lg">ID: #{meal.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => updateStatus(meal.id, true, false)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl font-black text-sm transition-all"
                  >
                    <CheckCircle size={18} /> موافقة عادية
                  </button>
                  <button 
                    onClick={() => updateStatus(meal.id, true, true)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 p-4 rounded-2xl font-black text-sm text-slate-900 transition-all"
                  >
                    <Star size={18} fill="currentColor" /> موافقة + تمييز
                  </button>
                  <button 
                    onClick={() => updateStatus(meal.id, false, false)}
                    className="col-span-2 flex items-center justify-center gap-2 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white p-4 rounded-2xl font-black text-xs transition-all mt-2"
                  >
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