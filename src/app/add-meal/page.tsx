'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, PlusCircle, Tag, Euro, Package } from 'lucide-react'
// استدعاء Supabase إذا أردت ربطها بقاعدة البيانات

export default function AddMealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // هنا يتم إرسال البيانات إلى Supabase لاحقاً
    setTimeout(() => {
      alert('تمت إضافة العرض بنجاح! 🎉')
      router.back()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      <div className="bg-emerald-600 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl"><ArrowRight size={20} /></button>
        <h1 className="text-xl font-black">إضافة عرض جديد 🍱</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        {/* رفع الصورة */}
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-[30px] p-8 text-center flex flex-col items-center justify-center text-emerald-600 shadow-sm">
          <Upload size={30} className="mb-2 opacity-70" />
          <span className="text-sm font-black">اضغط لرفع صورة الوجبة</span>
          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG (الحد الأقصى 2MB)</span>
        </div>

        {/* الحقول */}
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1"><Tag size={14} className="text-emerald-500"/> اسم الوجبة</label>
            <input type="text" required placeholder="مثال: تشكيلة معجنات بنهاية اليوم" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1"><Euro size={14} className="text-rose-500"/> السعر الأصلي</label>
              <input type="number" required placeholder="10.00" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1"><Euro size={14} className="text-emerald-500"/> سعر العرض</label>
              <input type="number" required placeholder="3.00" className="w-full bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 text-emerald-700 font-bold" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-700 mb-1 flex items-center gap-1"><Package size={14} className="text-blue-500"/> الكمية المتاحة (صناديق)</label>
            <input type="number" required placeholder="مثال: 5" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 flex justify-center items-center gap-2 active:scale-95 transition-all mt-4">
          {loading ? 'جاري الإضافة...' : <><PlusCircle size={20} /> نشر العرض الآن</>}
        </button>
      </form>
    </div>
  )
}