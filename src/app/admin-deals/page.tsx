'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowRight, Megaphone, Clock, Sparkles, Copy, Check, Star, Bell, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// دالة لأيقونة السهم
function ChevronLeft({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function AdminDealsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getNotifications() {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setNotifications(data)
      setLoading(false)
    }
    getNotifications()
  }, [])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // دالة لاستخراج كود الخصم من النص (إذا كان الإشعار يحتوي على كود)
  const extractCode = (message: string) => {
    const match = message.match(/\[([A-Z0-9]+)\]/) // يبحث عن كود بين قوسين مثل [WEEKEND20]
    return match ? match[1] : null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* هيدر الصفحة بتصميمك الرائع */}
      <div className="p-8 bg-rose-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 absolute top-8 left-8 bg-white/20 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
            <Megaphone size={28} className="text-white animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic">عروض الإدارة 📢</h1>
            <p className="text-xs opacity-90 font-bold mt-1">تخفيضات وإعلانات حصرية من نِعمة</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-5">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
             <Loader2 className="animate-spin text-rose-500" size={35} />
             <p className="text-gray-400 font-bold text-sm italic">جاري جلب أحدث العروض... ✨</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-gray-100">
            <Bell size={50} className="mx-auto text-gray-200 mb-4 opacity-50" />
            <h3 className="font-black text-gray-900 text-lg mb-1">لا توجد عروض حالياً</h3>
            <p className="text-gray-400 font-bold text-xs italic leading-relaxed">ترقبوا مفاجآت وخصومات نِعمة قريباً!</p>
          </div>
        ) : (
          notifications.map((note) => {
            const promoCode = extractCode(note.message)
            // إزالة الكود من الرسالة ليظهر بشكل أنظف
            const cleanMessage = promoCode ? note.message.replace(`[${promoCode}]`, '') : note.message

            return (
              <div key={note.id} className="bg-white rounded-[35px] shadow-sm border border-gray-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-rose-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Sparkles size={12} className="text-rose-500" />
                      <span className="text-[10px] font-black text-rose-600 uppercase italic tracking-widest">إعلان مميز</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                      <Clock size={12} />
                      {new Date(note.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <p className="text-gray-800 font-bold leading-relaxed text-sm mb-4">
                    {cleanMessage}
                  </p>

                  {/* إذا كان الإشعار يحتوي على كود خصم، أظهر زر النسخ */}
                  {promoCode && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between mt-2 mb-4">
                      <div>
                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">كود الخصم الحصري</p>
                        <span className="font-mono font-black text-rose-600 text-base tracking-widest">{promoCode}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(promoCode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                          copiedCode === promoCode 
                          ? 'bg-emerald-500 text-white shadow-lg' 
                          : 'bg-white text-slate-700 shadow-sm border border-gray-100 hover:bg-slate-50'
                        }`}
                      >
                        {copiedCode === promoCode ? <><Check size={16} /> تم النسخ</> : <><Copy size={16} /> انسخ</>}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] font-black italic tracking-tighter uppercase opacity-80">إدارة نِعمة الموثقة</span>
                    </div>
                    <button onClick={() => router.push('/')} className="text-rose-500 font-black text-[10px] flex items-center gap-1 active:scale-95 transition-transform">
                      استفد من العرض <ChevronLeft size={14} className="mt-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}