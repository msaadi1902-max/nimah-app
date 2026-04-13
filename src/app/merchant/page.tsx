'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Store, Package, Clock, TrendingUp, ArrowRight, Loader2, Edit, Trash2, BellRing } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import OrderNotifier from '@/components/OrderNotifier' // استدعاء المنبه الذي برمجناه

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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 1. جلب اسم المحل من البروفايل
        const { data: profile } = await supabase
          .from('profiles')
          .select('shop_name')
          .eq('id', user.id)
          .single()
        
        if (profile) setMerchantName(profile.shop_name || 'متجري')

        // 2. جلب المنتجات الخاصة بهذا التاجر فقط
        const { data: myMeals, error } = await supabase
          .from('meals')
          .select('*')
          .eq('merchant_id', user.id)
          .order('id', { ascending: false })
        
        if (myMeals) setMeals(myMeals)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Error fetching merchant data:", error)
    } finally {
      setLoading(false)
    }
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
      
      {/* استدعاء منبه الطلبات ليعمل في الخلفية */}
      <OrderNotifier />

      {/* هيدر لوحة التحكم */}
      <div className="bg-gray-900 text-white p-6 pt-12 pb-16 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
              <Store className="text-emerald-400" /> {merchantName}
            </h1>
            <p className="text-gray-400 font-bold text-sm italic">مركز إدارة الأعمال الذكي</p>
          </div>
          <button 
            onClick={() => router.push('/merchant-orders')} 
            className="bg-white/10 p-3 rounded-2xl relative active:scale-90 transition-all border border-white/5"
          >
            <BellRing size={22} className="text-amber-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          </button>
        </div>
      </div>

      <div className="px-6 -mt-10 relative z-20 space-y-6">
        
        {/* إحصائيات سريعة ومربوطة بالداتا */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[30px] shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform active:scale-95">
            <div className="bg-emerald-100 p-3 rounded-2xl mb-2 text-emerald-600"><Package size={24} /></div>
            <p className="text-3xl font-black text-gray-900">{meals.length}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">إجمالي المنتجات</p>
          </div>
          <div className="bg-white p-5 rounded-[30px] shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform active:scale-95">
            <div className="bg-amber-100 p-3 rounded-2xl mb-2 text-amber-600"><TrendingUp size={24} /></div>
            <p className="text-3xl font-black text-gray-900">{meals.reduce((sum, meal) => sum + (meal.quantity || 0), 0)}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">قطع متاحة للبيع</p>
          </div>
        </div>

        {/* زر إضافة عرض جديد */}
        <button 
          onClick={() => router.push('/merchant/add-meal')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-[30px] shadow-xl shadow-emerald-600/20 font-black flex justify-center items-center gap-3 active:scale-95 transition-all border-b-4 border-emerald-800"
        >
          <PlusCircle size={24} /> إضافة عرض جديد
        </button>

        {/* قائمة عروض التاجر */}
        <div>
          <div className="flex justify-between items-center mb-4 mr-2">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">منتجاتي الحالية</h2>
            <button onClick={fetchMerchantData} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">تحديث يدوي</button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
              <p className="text-[10px] font-bold text-gray-400">جاري مزامنة المخزون...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-[35px] border border-gray-100 border-dashed shadow-sm">
              <Package size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-900 font-black text-lg">مخزنك فارغ حالياً</p>
              <p className="text-gray-500 text-xs font-bold mt-2 leading-relaxed">أضف منتجاتك لتبدأ في استقبال الطلبات فوراً.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-white p-5 rounded-[30px] shadow-md border border-gray-100 relative overflow-hidden group transition-all hover:border-emerald-200">
                  {/* شريط حالة الموافقة (ذكي) */}
                  <div className={`absolute top-0 right-0 w-2 h-full transition-colors ${meal.is_approved ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-3 pl-2 pr-4">
                    <div className="flex gap-4">
                      {/* عرض صورة مصغرة للمنتج */}
                      <img src={meal.image_url} alt="" className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100" />
                      <div>
                        <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-1">{meal.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${meal.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {meal.is_approved ? '✅ معتمد ومنشور' : '⏳ قيد مراجعة الإدارة'}
                          </span>
                          <span className="bg-gray-50 text-gray-400 text-[9px] font-black px-2 py-1 rounded-lg">{meal.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="font-black text-xl text-emerald-600">{meal.discounted_price} €</p>
                      <p className="text-[10px] text-gray-400 font-bold line-through">{meal.original_price} €</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2 pr-4">
                    <div className="flex gap-4">
                       <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                        <Package size={14} className="text-orange-400" /> متبقي: <span className="font-black text-gray-900">{meal.quantity}</span>
                      </p>
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                        <Clock size={14} className="text-blue-400" /> {meal.pickup_time || 'متاح'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(meal.id)}
                        className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* زر أسفل الشاشة للوصول السريع للطلبات الواردة */}
      <div className="fixed bottom-24 left-6 right-6 z-30">
        <button 
          onClick={() => router.push('/merchant-orders')}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <BellRing size={20} className="text-emerald-400" />
            <span className="font-black text-sm">عرض الطلبات الواردة</span>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}