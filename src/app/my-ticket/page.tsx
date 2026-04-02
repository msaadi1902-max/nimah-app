'use client'
import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, MapPin, Clock, ShieldCheck, MessageSquareWarning, Copy } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// 1. استخراج المحتوى الذي يستخدم useSearchParams إلى مكوّن منفصل
function TicketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // بيانات تجريبية (سيتم جلبها من قاعدة البيانات لاحقاً)
  const orderNumber = searchParams.get('order_no') || 'A-452' 
  const itemName = searchParams.get('name') || 'صندوق نِعمة للمفاجآت'
  const storeName = searchParams.get('store') || 'مخبز البركة'

  return (
    <>
      {/* الهيدر */}
      <div className="flex items-center justify-between text-white mb-8">
        <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black italic">تفاصيل الحجز ✨</h1>
        <div className="w-10"></div>
      </div>

      {/* بطاقة الرقم الضخم */}
      <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl relative">
        <div className="p-10 flex flex-col items-center border-b-2 border-dashed border-gray-100 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">أعطِ هذا الرقم لصاحب المطعم</p>
          
          <div className="bg-emerald-50 px-10 py-6 rounded-[35px] border-2 border-emerald-100 mb-6 group relative">
            <span className="text-6xl font-black text-emerald-700 tracking-tighter italic">
              {orderNumber}
            </span>
            <button className="absolute -bottom-2 -right-2 bg-white shadow-md p-2 rounded-full text-emerald-600">
               <Copy size={16} />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-1">{itemName}</h2>
          <p className="text-sm text-emerald-600 font-bold italic">{storeName}</p>
        </div>

        {/* تفاصيل الاستلام والشكاوى */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl">
            <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
              <Clock size={16} className="text-emerald-500" /> متاح حتى 22:30
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
              <MapPin size={16} className="text-emerald-500" /> دمشق - الميدان
            </div>
          </div>

          <div className="flex gap-4 pt-4">
             <button className="flex-1 bg-emerald-600 text-white py-5 rounded-[25px] font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all">
               تم الاستلام بنجاح ✅
             </button>
          </div>

          {/* زر الشكاوى - لحفظ الحقوق */}
          <button className="w-full flex items-center justify-center gap-2 text-rose-500 font-black text-xs mt-2 p-2 hover:bg-rose-50 rounded-xl transition-colors">
            <MessageSquareWarning size={16} />
            إبلاغ عن مشكلة في هذا الطلب
          </button>
        </div>

        {/* دوائر قص التذكرة الجمالية */}
        <div className="absolute top-[52%] -left-5 w-10 h-10 bg-emerald-600 rounded-full"></div>
        <div className="absolute top-[52%] -right-5 w-10 h-10 bg-emerald-600 rounded-full"></div>
      </div>

      <div className="mt-8 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
         <p className="text-white text-[10px] text-center font-bold leading-relaxed">
           بمجرد ضغطك على "تم الاستلام" أو قيام التاجر بتأكيد الرقم، يتم إغلاق الطلب وحفظ الحقوق المالية للطرفين.
         </p>
      </div>
    </>
  )
}

// 2. المكون الرئيسي الذي يغلف المحتوى بـ Suspense
export default function OrderNumberTicketPage() {
  return (
    <div className="min-h-screen bg-emerald-600 pb-28 text-right p-6 font-sans" dir="rtl">
      {/* هنا غلاف الحماية الذي سيحل المشكلة */}
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-white font-bold">جاري تحميل التذكرة...</div>}>
        <TicketContent />
      </Suspense>
      <BottomNav activeTab="home" />
    </div>
  )
}