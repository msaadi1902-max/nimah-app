'use client'
import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, MessageSquareWarning, Copy, UploadCloud, CheckCircle2, Ticket, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function TicketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploading, setUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  
  // جلب رقم الطلب من الرابط
  const orderNumber = searchParams.get('order_no') || 'NIMAH-XXXX' 

  // 👑 تطوير دالة الرفع لتطابق معاييرنا الصارمة
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${orderNumber}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setIsUploaded(true)
      alert('✅ تم رفع المستند بنجاح! سيتم مراجعته في حال وجود خلاف.')
    } catch (error: any) {
      alert('❌ خطأ في الرفع: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderNumber)
    alert('تم نسخ رقم التذكرة 📋')
  }

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="flex items-center justify-between text-white mb-8">
        <button onClick={() => router.back()} className="bg-white/20 hover:bg-white/30 p-2.5 rounded-2xl transition-all backdrop-blur-md border border-white/10 active:scale-95">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          تفاصيل الاستلام <Ticket size={20} className="text-emerald-200" />
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-[45px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative animate-in zoom-in-95 duration-500">
        
        {/* قسم الرقم الفاخر */}
        <div className="p-10 flex flex-col items-center border-b-2 border-dashed border-slate-200 text-center relative bg-slate-50/50">
          <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            صالحة للاستلام
          </div>
          
          <p className="text-xs font-black text-slate-400 mb-5 tracking-widest uppercase mt-4">أعطِ هذا الرمز للمطعم للمطابقة</p>
          
          <div 
            onClick={copyToClipboard}
            className="bg-white px-8 py-6 rounded-[30px] border-2 border-emerald-500/20 mb-6 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors group relative"
            title="اضغط للنسخ"
          >
            <span className="text-4xl md:text-5xl font-mono font-black text-emerald-700 tracking-[0.2em] group-hover:scale-105 transition-transform block">
              {orderNumber}
            </span>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Copy size={10} /> نسخ
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">وجبة إنقاذ نِعمة</h2>
        </div>

        {/* قسم الإجراءات ورفع الملفات */}
        <div className="p-8 space-y-4 bg-white">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50 flex gap-3 items-start mb-2">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
              إذا طلب منك التاجر إثبات الدفع، يمكنك التقاط لقطة شاشة للطلب ورفعها هنا كإثبات.
            </p>
          </div>

          <div className="relative group">
            <input 
              type="file" 
              id="file-upload" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading || isUploaded}
            />
            <label 
              htmlFor="file-upload" 
              className={`w-full flex items-center justify-center gap-2 py-5 rounded-[20px] font-black text-sm border-2 border-dashed transition-all cursor-pointer ${
                isUploaded 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {uploading ? <Loader2 className="animate-spin text-slate-500" size={20} /> : 
               isUploaded ? <><CheckCircle2 size={20}/> تم إرفاق الإثبات بنجاح</> : 
               <><UploadCloud size={20}/> رفع صورة للإثبات (اختياري)</>}
            </label>
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-rose-500 font-black text-xs p-4 rounded-2xl hover:bg-rose-50 transition-colors mt-2 border border-transparent hover:border-rose-100">
            <MessageSquareWarning size={16} /> الإبلاغ عن مشكلة في الاستلام
          </button>
        </div>

        {/* تصميم القص المذهل */}
        <div className="absolute top-[48%] -left-5 w-10 h-10 bg-slate-900 rounded-full shadow-inner"></div>
        <div className="absolute top-[48%] -right-5 w-10 h-10 bg-slate-900 rounded-full shadow-inner"></div>
      </div>
    </div>
  )
}

export default function OrderNumberTicketPage() {
  return (
    <div className="min-h-screen bg-slate-900 pb-10 text-right p-4 md:p-6 font-sans flex flex-col justify-center" dir="rtl">
      <Suspense fallback={<div className="flex flex-col items-center justify-center h-screen text-emerald-500"><Loader2 className="animate-spin w-12 h-12 mb-4" /><p className="font-black text-sm tracking-widest animate-pulse">جاري تحضير التذكرة...</p></div>}>
        <div className="max-w-md mx-auto w-full">
          <TicketContent />
        </div>
      </Suspense>
    </div>
  )
}