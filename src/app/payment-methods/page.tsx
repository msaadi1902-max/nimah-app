'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Wallet, Landmark, Bitcoin, ArrowRight, Plus, CheckCircle2, ShieldCheck } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const paymentOptions = [
    { id: 'visa', name: 'بطاقة بنكية (Visa/Master)', icon: CreditCard, color: 'text-blue-600', desc: 'أوروبا والعالم' },
    { id: 'sham', name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', desc: 'سوريا والشرق الأوسط' },
    { id: 'crypto', name: 'العملات الرقمية (USDT)', icon: Bitcoin, color: 'text-orange-500', desc: 'دفع لا مركزي سريع' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      {/* الهيدر الفاخر */}
      <div className="p-8 bg-emerald-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <button onClick={() => router.back()} className="absolute top-8 left-8 bg-white/20 p-2 rounded-xl">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter">محفظتي المالية 💳</h1>
        <p className="text-sm opacity-90 mt-1 font-bold">إدارة الرصيد وطرق الدفع الآمنة</p>
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-10">
        
        {/* بطاقة الرصيد الحالي */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/10 border border-emerald-50 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">الرصيد المتاح حالياً</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-black text-emerald-600 tracking-tighter">0.00</span>
            <span className="text-xl font-bold text-emerald-400">€</span>
          </div>
          <button className="mt-6 w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus size={20} /> شحن الرصيد الآن
          </button>
        </div>

        {/* اختيار وسيلة الدفع */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 mr-2">طرق الدفع المضافة</h2>
          
          <div className="space-y-3">
            {paymentOptions.map((method) => (
              <button 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full bg-white p-5 rounded-[30px] flex items-center gap-4 border-2 transition-all ${selectedMethod === method.id ? 'border-emerald-500 shadow-md bg-emerald-50/30' : 'border-transparent shadow-sm'}`}
              >
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <method.icon size={26} className={method.color} />
                </div>
                <div className="flex-1 text-right">
                  <span className="font-black text-sm text-gray-800 block">{method.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{method.desc}</span>
                </div>
                {selectedMethod === method.id && <CheckCircle2 size={20} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* حماية الخصوصية */}
        <div className="bg-blue-50 p-5 rounded-[30px] border border-blue-100 flex items-start gap-4">
          <ShieldCheck size={30} className="text-blue-600 mt-1" />
          <div className="text-right">
            <h4 className="text-xs font-black text-blue-900 mb-1">تشفير بيانات الدفع المتقدم</h4>
            <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
              نحن نستخدم تقنيات التشفير العالمية لحماية بياناتك المالية. لن يتم مشاركة أرقام بطاقاتك مع أي طرف ثالث، وتتم معالجة العمليات عبر بوابات دفع مرخصة دولياً ومحلياً.
            </p>
          </div>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}