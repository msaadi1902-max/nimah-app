'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, Wallet, Landmark, Bitcoin, ArrowRight, 
  Plus, CheckCircle2, ShieldCheck, Globe, Info 
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const paymentOptions = [
    { id: 'visa', name: 'بطاقة بنكية (Visa/Master)', icon: CreditCard, color: 'text-blue-600', desc: 'أوروبا والعالم', bg: 'bg-blue-50' },
    { id: 'sham', name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', desc: 'سوريا والشرق الأوسط', bg: 'bg-emerald-50' },
    { id: 'crypto', name: 'العملات الرقمية (USDT)', icon: Bitcoin, color: 'text-orange-500', desc: 'دفع لا مركزي سريع', bg: 'bg-orange-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* الهيدر الفاخر بتصميم نِعمة */}
      <div className="p-8 bg-emerald-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <h1 className="relative z-10 text-2xl font-black italic tracking-tighter flex items-center gap-2">
           محفظتي المالية 💳
        </h1>
        <p className="relative z-10 text-sm opacity-90 mt-1 font-bold">إدارة الرصيد وطرق الدفع الآمنة</p>
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-20">
        
        {/* بطاقة الرصيد بتصميم مطور */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/10 border border-emerald-50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">الرصيد المتاح حالياً</p>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-5xl font-black text-emerald-600 tracking-tighter">0.00</span>
            <span className="text-xl font-bold text-emerald-400">€</span>
          </div>
          <button className="mt-6 w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> شحن المحفظة
          </button>
        </div>

        {/* اختيار وسيلة الدفع */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h2 className="text-sm font-black text-gray-800">طرق الدفع المدعومة</h2>
             <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
               <Globe size={12} /> آمنة دولياً
             </span>
          </div>
          
          <div className="space-y-3">
            {paymentOptions.map((method) => (
              <button 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-5 rounded-[30px] flex items-center gap-4 border-2 transition-all duration-300 group ${
                  selectedMethod === method.id 
                  ? 'border-emerald-500 shadow-xl bg-emerald-50/40 scale-[1.02]' 
                  : 'border-white bg-white shadow-sm hover:border-emerald-100'
                }`}
              >
                <div className={`${method.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <method.icon size={26} className={method.color} />
                </div>
                <div className="flex-1 text-right">
                  <span className="font-black text-sm text-gray-800 block mb-0.5">{method.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{method.desc}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === method.id ? 'bg-emerald-500 border-emerald-500' : 'border-gray-100'
                }`}>
                  {selectedMethod === method.id && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* قسم الأمان والحماية */}
        <div className="bg-slate-900 p-6 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black mb-1 flex items-center gap-2">
                حماية البيانات المالية 
              </h4>
              <p className="text-[10px] text-gray-400 leading-loose font-bold">
                نحن نستخدم تشفير <span className="text-emerald-400">AES-256</span> العالمي. بياناتك المالية لا يتم تخزينها على خوادمنا الشخصية بل تتم معالجتها عبر بوابات دفع دولية مرخصة لضمان أقصى درجات الأمان.
              </p>
            </div>
          </div>
        </div>

        {/* مساعدة */}
        <p className="text-center text-[10px] text-gray-400 font-bold pb-4 flex items-center justify-center gap-1">
          <Info size={12} /> هل تواجه مشكلة في الشحن؟ تواصل مع الدعم الفني
        </p>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}