'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Heart, Share2, MapPin, Clock, Loader2, CheckCircle2 } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function OfferDetailsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [meal, setMeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchMealDetails()
  }, [id])

  const fetchMealDetails = async () => {
    const { data, error } = await supabase.from('meals').select('*').eq('id', id).single()
    if (data) setMeal(data)
    setLoading(false)
  }

  const handleBooking = async () => {
    setBookingLoading(true)
    try {
      // 1. فحص هل المستخدم مسجل دخول؟
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('يرجى تسجيل الدخول أولاً لتتمكن من حجز الوجبة! 🔐')
        router.push('/login')
        return
      }

      // 2. تسجيل الطلب في جدول orders
      const { error: orderError } = await supabase.from('orders').insert([{
        customer_email: user.email,
        meal_name: meal.name,
        price: meal.discounted_price
      }])
      if (orderError) throw orderError

      // 3. إنقاص الكمية المتوفرة من الوجبة بمقدار 1
      const newQuantity = meal.quantity - 1
      const { error: updateError } = await supabase.from('meals').update({ quantity: newQuantity }).eq('id', meal.id)
      if (updateError) throw updateError

      // 4. نجاح العملية والتوجه لصفحة التذاكر! 🎟️
      alert('🎉 تم حجز الوجبة بنجاح! طعامك اللذيذ بانتظارك.')
      router.push('/tickets') 

    } catch (error: any) {
      alert('❌ حدث خطأ أثناء الحجز: ' + error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-600 font-black italic animate-pulse" dir="rtl">جاري تجهيز التفاصيل... <Loader2 className="animate-spin mr-2" /></div>
  if (!meal) return <div className="text-center py-20 font-black">عذراً، الوجبة غير موجودة 🛑</div>

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right pb-24" dir="rtl">
      <div className="relative h-80 w-full bg-gray-200">
        <img src={meal.image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover" alt={meal.name} />
        <div className="absolute top-10 left-0 w-full px-4 flex justify-between items-center z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow-sm"><ArrowRight size={20} /></button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow-sm"><Share2 size={20} /></button>
            <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow-sm text-rose-500"><Heart size={20} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white px-6 pt-8 pb-6 rounded-t-[30px] -mt-8 relative z-20 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{meal.name}</h1>
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl font-black text-xs whitespace-nowrap">باقي {meal.quantity}</div>
        </div>
        <p className="text-emerald-700 font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={16}/> مطعم شريك معتمد</p>
        
        <div className="flex gap-4 border-t border-gray-100 pt-6">
          <div className="flex-1 bg-emerald-50 p-4 rounded-2xl text-center">
            <Clock size={20} className="mx-auto text-emerald-600 mb-1" />
            <p className="text-[10px] text-gray-500 font-bold">وقت الاستلام</p>
            <p className="text-xs font-black">{meal.pickup_time}</p>
          </div>
          <div className="flex-1 bg-blue-50 p-4 rounded-2xl text-center">
            <MapPin size={20} className="mx-auto text-blue-600 mb-1" />
            <p className="text-[10px] text-gray-500 font-bold">الموقع</p>
            <p className="text-xs font-black">فيينا، النمسا</p>
          </div>
        </div>
      </div>

      {/* شريط الحجز السفلي */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs text-gray-400 line-through">{meal.original_price} €</p>
          <p className="text-2xl font-black text-emerald-800">{meal.discounted_price} €</p>
        </div>
        
        <button 
          onClick={handleBooking}
          disabled={bookingLoading || meal.quantity <= 0}
          className={`px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${meal.quantity <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-800 text-white active:scale-95 shadow-xl shadow-emerald-100'}`}
        >
          {bookingLoading ? <Loader2 className="animate-spin" /> : (meal.quantity <= 0 ? 'نفدت الكمية 😔' : 'احجز الآن 🚀')}
        </button>
      </div>
    </div>
  )
}