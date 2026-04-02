"use client";

import React from "react";
import { Sparkles, Leaf, Heart, TrendingUp, Award } from "lucide-react";
import BottomNav from "@/components/BottomNav";

function TopHeader() {
  return (
    <div className="bg-emerald-600 text-white p-6 pb-10 rounded-b-[40px] shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-200" />
          أثري الإيجابي
        </h1>
        <p className="text-emerald-100 text-sm">شكراً لكونك بطلاً في إنقاذ الطعام!</p>
      </div>
      {/* رسمة ديكور في الخلفية */}
      <Leaf className="absolute left-[-20px] top-[-20px] w-40 h-40 text-emerald-500 opacity-20 transform -rotate-12" />
    </div>
  );
}

function ImpactStats() {
  // هذه الأرقام سنربطها لاحقاً بقاعدة البيانات بعد أن نبرمج زر الدفع
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
            <div key={stat.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BadgesSection() {
  return (
    <div className="p-5 mt-2 mb-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">أوسمة الإنجاز</h3>
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center text-3xl shadow-inner border-4 border-amber-100">
          👑
        </div>
        <div>
          <h4 className="font-bold text-gray-900">ملك المخبوزات</h4>
          <p className="text-xs text-gray-500 mt-1">أنقذت 10 صناديق مخبوزات هذا الشهر! استمر يا بطل.</p>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
            <div className="bg-amber-400 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans" dir="rtl">
      <div className="mx-auto max-w-md relative">
        <TopHeader />
        <ImpactStats />
        <BadgesSection />
      </div>
      <BottomNav activeTab="impact" />
    </div>
  );
}