'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Bell, CheckCircle, Package, Info, ArrowRight, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function NotificationsPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getNotes() {
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
    getNotes()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      {/* هيدر الصفحة */}
      <div className="p-8 bg-indigo-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <div className="relative z-10 flex items-center gap-3">
          <Bell size={28} className="animate-swing" />
          <h1 className="text-2xl font-black italic">التنبيهات 🔔</h1>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">جاري جلب الإشعارات...</div>
        ) : notes.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200">
            <Bell size={50} className="mx-auto text-gray-200 mb-4 opacity-20" />
            <p className="text-gray-400 font-bold italic">لا توجد تنبيهات جديدة حالياً</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`p-5 rounded-[30px] shadow-sm border flex items-start gap-4 transition-all ${note.is_read ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className={`p-3 rounded-2xl ${note.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {note.title.includes('طلب') ? <Package className="text-indigo-600" size={20} /> : <Info className="text-blue-500" size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-sm mb-1">{note.title}</h3>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{note.message}</p>
                <span className="text-[9px] text-gray-300 mt-2 block italic">
                   {new Date(note.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}