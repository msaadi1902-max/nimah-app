"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Sparkles, Leaf, Heart, TrendingUp, Award, ArrowRight, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ImpactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // حالات الإحصائيات الحقيقية
  const [stats, setStats] = useState({
    rescuedMeals: 0,
    savedMoney: 0,
    co2Saved: 0,
    donations: 0
  });

  useEffect(() => {
    fetchMyImpact()
  }, [])

  const fetchMyImpact = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.replace('/welcome')
        return
      }

      // جلب طلبات المستخدم المكتملة
      const { data: orders } = await supabase
        .from('orders')
        .select('price, donation_amount, meals(original_price)')
        .eq('customer_email', user.email)
        .eq('status', 'completed') // نحسب فقط ما تم استلامه فعلاً

      if (orders && orders.length > 0) {
        const rescued = orders.length
        let saved = 0
        let totalDonation = 0

        orders.forEach((o: any) => {
          const original = o.meals?.original_price || o.price // في حال حذفت الوجبة الأصلية
          if (original > o.price) saved += (original - o.price)
          totalDonation += (o.donation_amount || 0)
        })

        setStats({
          rescuedMeals: rescued,
          savedMoney: saved,
          co2Saved: rescued * 2.5, // 2.5kg CO2 لكل وجبة
          donations: totalDonation
        })
      }
    } catch (error) {
      console.error("Error fetching personal impact:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-emerald-600 font-black italic">
        <Loader2 className="animate-spin w-10 h-10 mb-4"/> 
        جاري تحميل أثرك الرائع... ✨
      </div>
    )
  }

  // مصفوفة الإحصائيات الديناميكية المدمجة مع تصميمك
  const statCards = [
    { id: 1, title: "وجبات أُنقذت", value: stats.rescuedMeals.toString(), icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
    { id: 2, title: "مال وفرته", value: `€${stats.savedMoney.toFixed(1)}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, title: "انبعاثات CO2", value: `${stats.co2Saved.toFixed(1)} كغ`, icon: Leaf, color: "text-teal-500", bg: "bg-teal-50" },
    { id: 4, title: "تبرعات خيرية", value: `€${stats.donations.toFixed(2)}`, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-right" dir="rtl">
      <div className="mx-auto max-w-md relative">
        
        {/* الهيدر بتصميمك الساحر */}
        <div className="bg-emerald-600 text-white p-6 pb-12 rounded-b-[40px] shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl mb-4 active:scale-95 transition-transform">
               <ArrowRight size={20} />
            </button>
            <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-200" />
              أثري الإيجابي ✨
            </h1>
            <p className="text-emerald-100 text-sm font-bold">شكراً لكونك بطلاً في إنقاذ الطعام والكوكب!</p>
          </div>
          <Leaf className="absolute left-[-20px] top-[-20px] w-40 h-40 text-emerald-500 opacity-20 transform -rotate-12" />
        </div>

        {/* الإحصائيات بأرقام حقيقية */}
        <div className="px-5 -mt-6 relative z-20">
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{stat.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* رسالة الخير */}
        <div className="px-5 mt-6">
           <div className="bg-emerald-50 p-6 rounded-[35px] border border-emerald-100 relative overflow-hidden">
             <Heart className="absolute -left-4 -top-4 w-24 h-24 text-emerald-100 opacity-50" />
              <h4 className="text-emerald-900 font-black mb-2 flex items-center gap-2 relative z-10">أين تذهب أرباحنا؟ ❤️</h4>
              <p className="text-emerald-800/80 text-xs font-bold leading-loose relative z-10">
                نساهم بنسبة 10% من أرباح التطبيق لدعم الجمعيات الخيرية ومشاريع حماية البيئة العالمية.
              </p>
           </div>
        </div>

        {/* قسم الأوسمة (يعتمد على إنجازات المستخدم الحقيقية) */}
        <div className="p-5 mt-4">
          <h3 className="font-black text-lg text-gray-800 mb-4 mr-2">أوسمة الإنجاز 👑</h3>
          <div className="bg-white p-5 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner border-4 ${stats.rescuedMeals >= 5 ? 'bg-gradient-to-br from-amber-200 to-amber-400 border-amber-100' : 'bg-gray-100 border-gray-200 grayscale opacity-50'}`}>
              👑
            </div>
            <div className="flex-1">
              <h4 className={`font-black ${stats.rescuedMeals >= 5 ? 'text-gray-900' : 'text-gray-500'}`}>
                {stats.rescuedMeals >= 5 ? 'بطل إنقاذ الطعام' : 'بطل المستقبل'}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">
                {stats.rescuedMeals >= 5 ? 'لقد أنقذت 5 وجبات أو أكثر!' : 'أنقذ 5 وجبات لفتح هذا الوسام'}
              </p>
              
              {/* شريط التقدم الفعلي لفتح الوسام */}
              <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-amber-400 h-2 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000" 
                  style={{ width: `${Math.min((stats.rescuedMeals / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <BottomNav activeTab="profile" />
    </div>
  );
}