'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Gift, Ticket, Star, Zap, ChevronLeft, Award, Sparkles } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function VouchersPage() {
  const router = useRouter()
  
  // نقاط المستخدم (مثال سنربطه لاحقاً بقاعدة البيانات)
  const [orderCount, setOrderCount] = useState(7) 
  const goal = 10

  const activeVouchers = [
    { id: 1, title: 'خصم أول طلب', code: 'WELCOME10', discount: '10%', expiry: 'تنتهي خلال 3 أيام', color: 'bg-emerald-500' },
    { id: 2, title: 'هدية الصديق', code: 'FRIEND5', discount: '5€', expiry: 'صالحة لمرة واحدة', color: 'bg-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6 border-b border-gray-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900">المكافآت والقسائم 🎁</h1>
          <div className="w-10"></div>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full -ml-10 -mt-10 blur-3xl"></div>
      </div>

      <div className="px-6 space-y-6">
        
        {/* بطاقة الولاء (Loyalty Card) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
          <Sparkles className="absolute right-[-10px] top-[-10px] w-24 h-24 text-emerald-500 opacity-20" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-black text-lg mb-1 italic">نظام تجميع النقاط</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">اطلب 10 وجبات واحصل على واحدة مجاناً!</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Award size={24} />
            </div>
          </div>

          {/* دوائر النقاط */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[...Array(goal)].map((_, i) => (
              <div key={i} className={`h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                i < orderCount ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10'
              }`}>
                {i < orderCount ? <Zap size={16} fill="white" /> : <span className="text-[10px] opacity-20 font-black">{i + 1}</span>}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] font-black">
            <span className="bg-white/10 px-3 py-1.5 rounded-full">بقي لك {goal - orderCount} طلبات فقط! 🚀</span>
            <span className="text-emerald-400">70% مكتمل</span>
          </div>
        </div>

        {/* قائمة القسائم */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 mr-2 flex items-center gap-2">
            <Ticket size={18} className="text-emerald-600" /> القسائم المتاحة
          </h2>
          
          {activeVouchers.map((v) => (
            <div key={v.id} className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden flex relative group">
              {/* الجزء الملون */}
              <div className={`${v.color} w-24 flex flex-col items-center justify-center text-white p-4 relative`}>
                <span className="text-2xl font-black">{v.discount}</span>
                <span className="text-[8px] font-black uppercase opacity-80 italic">خصم فوري</span>
                <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-around py-2">
                  {[...Array(6)].map((_, i) => <div key={i} className="w-4 h-4 bg-white rounded-full"></div>)}
                </div>
              </div>

              {/* تفاصيل القسيمة */}
              <div className="flex-1 p-5 pr-8">
                <h4 className="font-black text-gray-900 text-sm mb-1">{v.title}</h4>
                <p className="text-[10px] text-gray-400 font-bold mb-3">{v.expiry}</p>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-dashed border-gray-200">
                  <span className="text-xs font-mono font-black text-gray-600 tracking-widest uppercase px-2">{v.code}</span>
                  <button className="text-[10px] font-black text-emerald-600 active:scale-95 transition-all">نسخ الكود</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* تذكير */}
        <div className="bg-amber-50 p-5 rounded-[30px] border border-amber-100 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><Star size={20} /></div>
          <p className="text-[10px] text-amber-900 leading-loose font-bold">
            تأكد من إظهار كود الخصم للتاجر عند استلام الوجبة أو إدخاله في صفحة الدفع لتفعيل العرض.
          </p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}