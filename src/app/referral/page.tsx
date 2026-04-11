'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Share2, Copy, Users, Gift, Check, Sparkles, Megaphone } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function ReferralPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  
  // كود الدعوة (سنربطه لاحقاً بـ ID المستخدم الحقيقي)
  const referralCode = "NIMAH-5521"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { title: 'أرسل الكود', desc: 'شارك كود الدعوة الخاص بك مع أصدقائك', icon: Megaphone },
    { title: 'يسجلون في نِعمة', desc: 'عندما يقوم صديقك بإنشاء حساب جديد', icon: Users },
    { title: 'اربح المكافأة', desc: 'ستحصل على 5€ رصيد بمجرد طلبهم الأول', icon: Gift },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-white p-6 pt-12 pb-8 rounded-b-[40px] shadow-sm mb-6 border-b border-gray-100 relative overflow-hidden text-center">
        <button onClick={() => router.back()} className="absolute top-12 right-6 bg-gray-100 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-inner">
          <Gift size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">اربح 5€ مجانية! 🎁</h1>
        <p className="text-gray-400 text-xs font-bold px-10">ادعُ أصدقاءك لإنقاذ الطعام واربح رصيداً في محفظتك عن كل صديق ينضم إلينا.</p>
      </div>

      <div className="px-6 space-y-6">
        
        {/* كود الدعوة */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-purple-900/5 border border-purple-50 text-center relative overflow-hidden">
          <Sparkles className="absolute left-4 top-4 text-purple-200" size={24} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">كود الدعوة الخاص بك</p>
          
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-3xl border-2 border-dashed border-purple-200 mb-6 group">
            <span className="flex-1 text-2xl font-black text-purple-700 tracking-[0.3em] font-mono pr-4">{referralCode}</span>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded-2xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white shadow-lg shadow-purple-200 active:scale-90'}`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200">
            <Share2 size={20} /> مشاركة الرابط السريع
          </button>
        </div>

        {/* خطوات العمل */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 mr-2 italic">كيف يعمل نظام المكافآت؟</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-5 rounded-[30px] border border-gray-100 flex items-center gap-4">
                <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 font-black shrink-0">
                  <step.icon size={22} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm mb-0.5">{step.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تنبيه */}
        <div className="bg-amber-50 p-5 rounded-[30px] border border-amber-100 text-center">
          <p className="text-[10px] text-amber-900 font-bold leading-relaxed">
            * تطبق الشروط والأحكام. يتم إضافة الرصيد لمحفظتك بمجرد إتمام الصديق لعملية الحجز الأولى بنجاح.
          </p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}