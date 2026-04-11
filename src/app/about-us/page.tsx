'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Info, Heart, Leaf, Users, Store, Globe, Sparkles } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function AboutUsPage() {
  const router = useRouter()

  const values = [
    { icon: Leaf, title: 'حماية البيئة', desc: 'كل وجبة ننقذها تقلل من الانبعاثات الكربونية الناتجة عن هدر الطعام.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Users, title: 'دعم المجتمع', desc: 'نوفر وجبات عالية الجودة بأسعار تناسب الطلاب والعائلات.', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Store, title: 'تمكين المتاجر', desc: 'نساعد المطاعم والمخابز على استرداد تكاليفهم بدلاً من رمي الفائض.', color: 'text-amber-500', bg: 'bg-amber-50' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-16 rounded-b-[50px] shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
             <Heart size={35} className="text-emerald-500" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black mb-2">قصة نِعمة 🌱</h1>
          <p className="text-emerald-100 text-xs font-bold leading-relaxed px-4">
            تطبيق رائد يهدف إلى القضاء على هدر الطعام وبناء مجتمع مستدام ومتكافل.
          </p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        
        {/* من نحن */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 relative overflow-hidden">
          <Sparkles className="absolute left-[-10px] top-[-10px] w-20 h-20 text-emerald-50 opacity-50" />
          <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
            <Info size={20} className="text-emerald-500" /> من نحن؟
          </h2>
          <p className="text-xs text-gray-500 font-bold leading-loose">
            "نِعمة" هي منصة تقنية تربط بين المتاجر (مطاعم، مخابز، سوبر ماركت) التي لديها فائض طعام طازج وعالي الجودة في نهاية اليوم، وبين المستهلكين الراغبين في الحصول على وجبات لذيذة بخصومات تصل إلى 70%.
          </p>
        </div>

        {/* قيمنا */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 mr-2 italic">القيم التي نؤمن بها</h2>
          <div className="grid gap-3">
            {values.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-[30px] border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
                <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* رسالة شكر */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] text-center shadow-xl relative overflow-hidden mt-8">
          <Globe className="absolute right-[-20px] bottom-[-20px] w-32 h-32 opacity-10" />
          <h3 className="text-lg font-black mb-2 relative z-10">معاً نصنع الفرق 🌍</h3>
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed relative z-10">
            كلما استخدمت تطبيق نِعمة، أنت لا توفر المال فقط، بل تساهم بشكل مباشر في جعل كوكب الأرض مكاناً أفضل للأجيال القادمة. شكراً لكونك جزءاً من هذا التغيير الإيجابي.
          </p>
        </div>

      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}