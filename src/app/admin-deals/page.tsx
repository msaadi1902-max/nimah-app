'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Bell, Megaphone, Clock, ArrowRight, Sparkles, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminDealsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getNotifications() {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setNotifications(data)
      setLoading(false)
    }
    getNotifications()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      {/* هيدر الصفحة */}
      <div className="p-8 bg-rose-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
            <Megaphone size={28} className="text-white animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic">عروض نِعمة الحصرية 📢</h1>
            <p className="text-xs opacity-90 font-bold">إعلانات وعروض مختارة من الإدارة</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold italic animate-pulse">
            جاري جلب أحدث العروض... ✨
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-gray-100">
            <Bell size={50} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-black italic">لا توجد عروض إدارية حالياً.. ترقبوا المفاجآت!</p>
          </div>
        ) : (
          notifications.map((note) => (
            <div key={note.id} className="bg-white rounded-[35px] shadow-xl shadow-rose-900/5 border-r-8 border-rose-500 overflow-hidden relative group transition-all active:scale-95">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={12} className="text-rose-500" />
                    <span className="text-[10px] font-black text-rose-600 uppercase italic tracking-widest">إعلان مميز</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300 text-[10px] font-bold">
                    <Clock size={12} />
                    {new Date(note.created_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>

                <p className="text-gray-800 font-bold leading-relaxed text-sm mb-4">
                  {note.message}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-[10px] font-black italic tracking-tighter uppercase opacity-80">إدارة نِعمة الموثقة</span>
                  </div>
                  <button className="text-rose-500 font-black text-[10px] flex items-center gap-1">
                    انتقل للعرض <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
              
              {/* خلفية جمالية شفافة للبطاقة */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-rose-50 rounded-full blur-2xl opacity-50"></div>
            </div>
          ))
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}

// أيقونة إضافية مفقودة بالكود العلوي
function ChevronLeft({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}