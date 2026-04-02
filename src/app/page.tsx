import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Leaf, ShoppingBag, TrendingDown } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* القسم العلوي (الترحيب) */}
      <div className="bg-emerald-600 px-6 pt-14 pb-12 rounded-b-[45px] shadow-lg relative overflow-hidden">
        {/* تأثيرات بصرية للخلفية */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white mb-3">مرحباً بك في نِعمة ✨</h1>
          <p className="text-emerald-100 font-bold text-sm leading-relaxed">
            أنقذ الطعام اللذيذ، وفر مالك، واحمِ كوكبنا. خطوتك الأولى نحو استهلاك أكثر وعياً تبدأ من هنا.
          </p>
        </div>
      </div>

      {/* زر اتخاذ الإجراء (الدخول السريع للعروض) */}
      <div className="px-6 -mt-8 relative z-20">
        <Link href="/explore" className="bg-gray-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between group active:scale-95 transition-all">
          <div>
            <h2 className="text-lg font-black mb-1">استكشف العروض الآن</h2>
            <p className="text-xs text-gray-300 font-bold">وجبات شهية بأسعار مخفضة جداً</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-full group-hover:-translate-x-2 transition-transform">
            <ArrowLeft size={20} className="text-emerald-400" />
          </div>
        </Link>
      </div>

      {/* قسم المميزات (لماذا نِعمة؟) */}
      <div className="px-6 mt-10 space-y-4">
        <h3 className="text-xl font-black text-gray-900 mb-4">لماذا نِعمة؟</h3>

        <div className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">توفير يصل إلى 70%</h4>
            <p className="text-xs text-gray-500 font-bold mt-1">احصل على وجباتك المفضلة بأسعار لا تقبل المنافسة.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">طعام طازج ولذيذ</h4>
            <p className="text-xs text-gray-500 font-bold mt-1">فائض المطاعم والمخابز بجودة عالية يومياً.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <Leaf size={24} />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base">حماية البيئة</h4>
            <p className="text-xs text-gray-500 font-bold mt-1">كل وجبة تنقذها تقلل من انبعاثات الكربون المضرة.</p>
          </div>
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <BottomNav activeTab="home" />
    </div>
  )
}