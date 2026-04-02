'use client'
import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, MapPin, Clock, MessageSquareWarning, Copy, Upload, CheckCircle2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

function TicketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploading, setUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)

  const orderNumber = searchParams.get('order_no') || 'A-452' 
  
  // دالة رفع الملف
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${orderNumber}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      setIsUploaded(true)
      alert('تم رفع ملف الإثبات بنجاح!')
    } catch (error) {
      alert('خطأ في الرفع، تأكد من إنشاء Bucket باسم proofs في Supabase')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between text-white mb-8">
        <button onClick={() => router.back()} className="bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black italic">تفاصيل الحجز ✨</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl relative">
        <div className="p-10 flex flex-col items-center border-b-2 border-dashed border-gray-100 text-center">
          <p className="text-xs font-black text-gray-400 mb-4 tracking-widest">أعطِ هذا الرقم لصاحب المطعم</p>
          <div className="bg-emerald-50 px-10 py-6 rounded-[35px] border-2 border-emerald-100 mb-6">
            <span className="text-6xl font-black text-emerald-700 italic">{orderNumber}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">صندوق نِعمة للمفاجآت</h2>
        </div>

        <div className="p-8 space-y-4">
          <button className="w-full bg-emerald-600 text-white py-5 rounded-[25px] font-black shadow-lg active:scale-95 transition-all">
            تم الاستلام بنجاح ✅
          </button>

          {/* زر رفع الملفات الجديد */}
          <div className="relative">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label 
              htmlFor="file-upload" 
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all cursor-pointer ${
                isUploaded ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {uploading ? 'جاري الرفع...' : isUploaded ? <><CheckCircle2 size={18}/> تم رفع الإثبات</> : <><Upload size={18}/> رفع إثبات الملكية (صور/مستندات)</>}
            </label>
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-rose-500 font-black text-xs p-2">
            <MessageSquareWarning size={16} /> إبلاغ عن مشكلة
          </button>
        </div>

        <div className="absolute top-[52%] -left-5 w-10 h-10 bg-emerald-600 rounded-full"></div>
        <div className="absolute top-[52%] -right-5 w-10 h-10 bg-emerald-600 rounded-full"></div>
      </div>
    </>
  )
}

export default function OrderNumberTicketPage() {
  return (
    <div className="min-h-screen bg-emerald-600 pb-28 text-right p-6 font-sans" dir="rtl">
      <Suspense fallback={<div className="text-white">جاري التحميل...</div>}>
        <TicketContent />
      </Suspense>
      <BottomNav activeTab="home" />
    </div>
  )
}