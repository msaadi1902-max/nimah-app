'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Megaphone, Users, CheckCircle, Clock, Send, ShieldAlert } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'ads' | 'requests'>('ads')
  const [adMessage, setAdMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // دالة إرسال إعلان عام (إشعار إداري)
  const sendGlobalAd = async () => {
    if (!adMessage) return alert("يرجى كتابة نص الإعلان")
    setLoading(true)
    
    // سنقوم بحفظ الإعلان في جدول إشعارات عامة
    const { error } = await supabase.from('admin_notifications').insert([
      { message: adMessage, type: 'promo', created_at: new Date() }
    ])

    if (!error) {
      alert("تم إرسال الإعلان الممول لجميع المستخدمين بنجاح! 🚀")
      setAdMessage('')
    } else {
      alert("خطأ في الإرسال: " + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6" dir="rtl">
      {/* هيدر الإدارة القوي */}
      <div className="flex items-center gap-4 mb-10 border-b border-slate-700 pb-6">
        <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-900/20">
          <ShieldAlert size={30} />
        </div>
        <div>
          <h1 className="text-2xl font-black italic">لوحة تحكم المدير 🔒</h1>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">إدارة "نِعمة" - نظام الإعلانات والشركاء</p>
        </div>
      </div>

      {/* أزرار التنقل بين الأقسام */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('ads')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'ads' ? 'bg-emerald-600 shadow-xl shadow-emerald-900/20' : 'bg-slate-800 text-slate-500'}`}
        >
          <Megaphone size={18} /> إرسال إعلان ممول
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'requests' ? 'bg-emerald-600 shadow-xl shadow-emerald-900/20' : 'bg-slate-800 text-slate-500'}`}
        >
          <Users size={18} /> طلبات الانضمام
        </button>
      </div>

      {/* محتوى قسم الإعلانات */}
      {activeTab === 'ads' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-slate-800 p-6 rounded-[35px] border border-slate-700">
            <label className="block text-xs font-black text-slate-500 mb-4 uppercase mr-2">نص الرسالة الترويجية (ستظهر لجميع المستخدمين)</label>
            <textarea 
              rows={5}
              value={adMessage}
              onChange={(e) => setAdMessage(e.target.value)}
              placeholder="اكتب هنا: مثلاً.. عرض حصري لمتابعي نِعمة! خصم 50% في مطعم..."
              className="w-full bg-slate-900 border-none rounded-2xl p-4 text-sm font-bold text-emerald-400 placeholder:text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
            <button 
              onClick={sendGlobalAd}
              disabled={loading}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 py-5 rounded-[25px] font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={20} /> {loading ? 'جاري البث...' : 'بث الإعلان الآن'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-bold italic px-10">
            * تنبيه: عند الضغط على بث، سيتم إرسال الإشعار فوراً لقسم "عروض الإدارة" لدى كافة الزبائن.
          </p>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="text-center py-20 text-slate-600 font-bold italic animate-pulse">
           جاري جلب طلبات المطاعم الجديدة من الجدول... 🔄
        </div>
      )}
    </div>
  )
}