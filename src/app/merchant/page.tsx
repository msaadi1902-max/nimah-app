'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Store, Package, Clock, TrendingUp, ArrowRight, Loader2, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MerchantDashboard() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [merchantName, setMerchantName] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchMerchantData()
  }, [])

  const fetchMerchantData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // جلب اسم المطعم
      const { data: profile } = await supabase.from('profiles').select('shop_name').eq('id', user.id).single()
      if (profile) setMerchantName(profile.shop_name || 'مطعمي')

      // جلب وجبات هذا التاجر فقط
      const { data: myMeals } = await supabase
        .from('meals')
        .select('*')
        .eq('merchant_id', user.id)
        .order('id', { ascending: false })
      
      if (myMeals) setMeals(myMeals)
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض نهائياً؟')) {
      const { error } = await supabase.from('meals').delete().eq('id', id)
      if (!error) {
        setMeals(meals.filter(m => m.id !== id))
        alert('تم حذف العرض بنجاح.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* هيدر لوحة التحكم */}
      <div className="bg-gray-900 text-white p-6 pt-12 pb-16 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
              <Store className="text-emerald-400" /> {merchantName}
            </h1>
            <p className="text-gray-400 font-bold text-sm">إدارة العروض والمبيعات</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-20 space-y-6">
        
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[30px] shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-100 p-3 rounded-2xl mb-2 text-emerald-600"><Package size={24} /></div>
            <p className="text-3xl font-black text-gray-900">{meals.length}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">إجمالي العروض</p>
          </div>
          <div className="bg-white p-5 rounded-[30px] shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-100 p-3 rounded-2xl mb-2 text-amber-600"><TrendingUp size={24} /></div>
            <p className="text-3xl font-black text-gray-900">{meals.reduce((sum, meal) => sum + meal.quantity, 0)}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">وجبة متاحة للبيع</p>
          </div>
        </div>

        {/* زر إضافة عرض جديد */}
        <button 
          onClick={() => router.push('/merchant/add-meal')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-[30px] shadow-xl shadow-emerald-600/20 font-black flex justify-center items-center gap-3 active:scale-95 transition-all"
        >
          <PlusCircle size={24} /> إضافة عرض جديد
        </button>

        {/* قائمة عروض التاجر */}
        <div>
          <h2 className="text-sm font-black text-gray-400 mb-4 mr-2">عروضي الحالية</h2>
          
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
          ) : meals.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-[35px] border border-gray-100 border-dashed">
              <Package size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-900 font-black text-lg">لم تقم بإضافة أي عرض بعد!</p>
              <p className="text-gray-500 text-xs font-bold mt-2">ابدأ بإنقاذ الطعام وزيادة أرباحك الآن.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 relative overflow-hidden">
                  {/* شريط حالة الموافقة */}
                  <div className={`absolute top-0 right-0 w-2 h-full ${meal.is_approved ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2 pr-4">
                    <div>
                      <h3 className="font-black text-lg text-gray-900 mb-1">{meal.name}</h3>
                      <p className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                        {meal.is_approved ? '✅ معتمد' : '⏳ قيد المراجعة'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg text-emerald-600">{meal.discounted_price} €</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2 pr-4">
                    <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                      <Package size={14} className="text-orange-400" /> متبقي: <span className="font-black text-gray-900">{meal.quantity}</span>
                    </p>
                    <button 
                      onClick={() => handleDelete(meal.id)}
                      className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}