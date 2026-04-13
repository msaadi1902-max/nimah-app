'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Store, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function AdminRequestsPage() {
  const router = useRouter()
  
  // بيانات تجريبية (يتم جلبها من Supabase جدول المستخدمين حيث role = pending_merchant)
  const [requests, setRequests] = useState([
    { id: 1, name: 'مخبز الأمل', owner: 'أحمد سعيد', type: 'مخبوزات', date: 'منذ ساعتين' },
    { id: 2, name: 'مطعم الشام', owner: 'خالد عمر', type: 'وجبات سريعة', date: 'منذ يوم' },
  ])

  const handleAction = (id: number, action: 'accept' | 'reject') => {
    // هنا يتم تحديث قاعدة البيانات
    setRequests(requests.filter(req => req.id !== id))
    alert(action === 'accept' ? 'تم قبول المتجر بنجاح ✅' : 'تم رفض الطلب ❌')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      <div className="bg-slate-900 text-white p-6 pt-12 pb-10 rounded-b-[40px] shadow-lg mb-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/10 p-2 rounded-xl"><ArrowRight size={20} /></button>
        <h1 className="relative z-10 text-xl font-black flex items-center gap-2"><ShieldCheck className="text-emerald-400"/> طلبات الانضمام</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100"><Store size={40} className="mx-auto text-gray-200 mb-3"/> <p className="font-bold text-gray-400">لا توجد طلبات معلقة</p></div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Store size={24} /></div>
                <div>
                  <h3 className="font-black text-gray-900">{req.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold">بإدارة: {req.owner} • {req.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleAction(req.id, 'accept')} className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 py-2.5 rounded-xl text-xs font-black flex justify-center items-center gap-1 active:scale-95"><CheckCircle size={16}/> قبول المتجر</button>
                <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 bg-rose-50 text-rose-600 border border-rose-100 py-2.5 rounded-xl text-xs font-black flex justify-center items-center gap-1 active:scale-95"><XCircle size={16}/> رفض</button>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav activeTab="profile" />
    </div>
  )
}