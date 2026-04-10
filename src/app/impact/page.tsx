"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Leaf, Heart, TrendingUp, Award, ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

function TopHeader() {
  const router = useRouter();
  return (
    <div className="bg-emerald-600 text-white p-6 pb-12 rounded-b-[40px] shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl mb-4 active:scale-95 transition-transform">
           <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-200" />
          أثري الإيجابي ✨
        </h1>
        <p className="text-emerald-100 text-sm font-bold">شكراً لكونك بطلاً في إنقاذ الطعام!</p>
      </div>
      <Leaf className="absolute left-[-20px] top-[-20px] w-40 h-40 text-emerald-500 opacity-20 transform -rotate-12" />
    </div>
  );
}

function ImpactStats() {
  const stats = [
    { id: 1, title: "وجبات أُنقذت", value: "24", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
    { id: 2, title: "مال وفرته", value: "€85", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, title: "انبعاثات CO2", value: "12 كغ", icon: Leaf, color: "text-teal-500", bg: "bg-teal-50" },
    { id: 4, title: "تبرعات السرطان", value: "€15", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="px-5 -mt-6 relative z-20">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
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
  );
}

function BadgesSection() {
  return (
    <div className="p-5 mt-4">
      <h3 className="font-black text-lg text-gray-800 mb-4 mr-2">أوسمة الإنجاز 👑</h3>
      <div className="bg-white p-5 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-3xl flex items-center justify-center text-3xl shadow-inner border-4 border-amber-100">
          👑
        </div>
        <div className="flex-1">
          <h4 className="font-black text-gray-900">ملك المخبوزات</h4>
          <p className="text-[10px] text-gray-400 font-bold mt-1">أنقذت 10 صناديق مخبوزات هذا الشهر!</p>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
            <div className="bg-amber-400 h-2 rounded-full w-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-right" dir="rtl">
      <div className="mx-auto max-w-md relative">
        <TopHeader />
        <ImpactStats />
        <div className="px-5 mt-6">
           <div className="bg-emerald-50 p-6 rounded-[35px] border border-emerald-100">
              <h4 className="text-emerald-900 font-black mb-2 flex items-center gap-2">أين تذهب أرباحنا؟ ❤️</h4>
              <p className="text-emerald-800/70 text-xs font-bold leading-loose">نساهم بنسبة 10% من أرباح كل وجبة لدعم الجمعيات الخيرية ومشاريع حماية البيئة العالمية.</p>
           </div>
        </div>
        <BadgesSection />
      </div>
      <BottomNav activeTab="profile" />
    </div>
  );
}