'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Bell, BellOff, Package, Info, CheckCheck, Gift, ShieldCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function NotificationsPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setNotes(data)
    setLoading(false)
  }

  // دالة لتحديث حالة "مقروء" في قاعدة البيانات والواجهة
  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotes(notes.map(n => ({ ...n, is_read: true })))
  }

  // دالة ذكية لاختيار الأيقونة واللون بناءً على كلمة في عنوان الإشعار
  const getIconDetails = (title: string) => {
    if (title.includes('نجاح') || title.includes('موافقة')) return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (title.includes('طلب') || title.includes('حجز')) return { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' }
    if (title.includes('هدية') || title.includes('مكافأة')) return { icon: Gift, color: 'text-amber-600', bg: 'bg-amber-100' }
    return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* هيدر الصفحة الفاخر (استخدمنا لون Indigo كما في تصميمك) */}
      <div className="bg-indigo-600 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg relative overflow-hidden mb-6 flex items-center justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        
        <div className="relative z-10 flex flex-col items-center flex-1">
           <h1 className="text-2xl font-black italic flex items-center gap-2 mb-1">
             التنبيهات <Bell size={24} className="animate-bounce" />
           </h1>
        </div>

        <button onClick={markAllAsRead} className="relative z-10 text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm">
          مقروء
        </button>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={30} />
            <p className="text-gray-400 font-bold text-sm italic">جاري جلب الإشعارات...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center border border-gray-100 shadow-sm mt-10">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <BellOff size={40} className="opacity-50" />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-1">لا توجد تنبيهات</h3>
            <p className="text-gray-400 font-bold text-xs italic leading-relaxed">لم يصلك أي إشعار جديد حتى الآن.</p>
          </div>
        ) : (
          notes.map((note) => {
            const { icon: Icon, color, bg } = getIconDetails(note.title)
            return (
              <div key={note.id} className={`p-5 rounded-[30px] shadow-sm border flex items-start gap-4 transition-all ${note.is_read ? 'bg-white border-gray-50' : 'bg-indigo-50/40 border-indigo-100'}`}>
                
                <div className={`p-3 rounded-2xl shrink-0 ${note.is_read ? 'bg-gray-50 text-gray-400' : `${bg} ${color}`}`}>
                  <Icon size={22} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-black text-sm ${note.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{note.title}</h3>
                    {!note.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
                  </div>
                  <p className={`text-[11px] font-bold leading-relaxed mb-2 ${note.is_read ? 'text-gray-400' : 'text-gray-500'}`}>{note.message}</p>
                  <span className="text-[9px] text-gray-400 block font-black uppercase tracking-wider">
                     {new Date(note.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} • {new Date(note.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
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