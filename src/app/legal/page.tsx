'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, Lock, Scale, FileText, ScrollText } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function LegalPage() {
  const router = useRouter()

  const policies = [
    {
      icon: Lock,
      title: 'سياسة الخصوصية (GDPR)',
      desc: 'نحن نلتزم بحماية بياناتك الشخصية. لا نقوم ببيع أو مشاركة معلوماتك مع أطراف ثالثة لأغراض إعلانية. يتم تشفير جميع البيانات المتعلقة بالموقع الجغرافي والدفع.'
    },
    {
      icon: ScrollText,
      title: 'شروط الاستخدام',
      desc: 'باستخدامك لتطبيق "نِعمة"، فإنك توافق على الالتزام بشروط الحجز والاستلام. الوجبات المعروضة تعتمد على الفائض اليومي للمتاجر وقد تختلف كمياتها.'
    },
    {
      icon: Scale,
      title: 'سياسة الإلغاء والاسترجاع',
      desc: 'يمكنك إلغاء الحجز قبل ساعتين على الأقل من موعد الاستلام المحدد واسترداد المبلغ كاملاً. في حال عدم استلام الطلب في الوقت المحدد، لا يحق للمطالبة باسترداد المبلغ.'
    },
    {
      icon: ShieldCheck,
      title: 'أمان الدفع',
      desc: 'جميع المعاملات المالية تتم عبر بوابات دفع دولية مشفرة وموثوقة. نحن لا نقوم بتخزين تفاصيل بطاقتك الائتمانية على خوادمنا.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-slate-800 text-white p-6 pt-12 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shadow-inner mb-4 border border-slate-600">
             <FileText size={30} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">السياسات والخصوصية ⚖️</h1>
          <p className="text-slate-300 text-xs font-bold leading-relaxed">
            الشفافية هي أساس ثقتنا. اقرأ شروط استخدام التطبيق وكيفية حمايتنا لبياناتك.
          </p>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {policies.map((policy, index) => (
          <div key={index} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-800"></div>
            <div className="flex items-start gap-4 mb-3">
              <div className="bg-slate-50 p-3 rounded-2xl text-slate-700">
                <policy.icon size={22} />
              </div>
              <h3 className="font-black text-gray-900 text-base mt-2">{policy.title}</h3>
            </div>
            <p className="text-[11px] text-gray-500 font-bold leading-loose text-justify mr-2">
              {policy.desc}
            </p>
          </div>
        ))}

        {/* تاريخ التحديث */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            آخر تحديث: أبريل 2026
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            © جميع الحقوق محفوظة لتطبيق نِعمة
          </p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}