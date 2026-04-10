"use client";

import React from "react";
import BottomNav from "@/components/BottomNav";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <div className="p-6 text-right flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md text-center">
          <div className="text-4xl mb-4">📍</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">استكشف الوجبات القريبة</h1>
          <p className="text-gray-500">هذه الصفحة ستعرض قريباً خريطة تفاعلية للوجبات المتاحة حولك.</p>
          <div className="mt-6 py-3 px-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">
            جاري تجهيز نظام تحديد المواقع...
          </div>
        </div>
      </div>
      <BottomNav activeTab="browse" />
    </div>
  );
}