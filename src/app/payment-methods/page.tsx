'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  CreditCard, Wallet, Landmark, Bitcoin, ArrowRight, 
  Plus, CheckCircle2, ShieldCheck, Globe, Upload, Loader2 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
      if (data) setBalance(data.wallet_balance || 0)
    }
  }

  const handleTopUpRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !amount) return alert("يرجى إدخال المبلغ ورفع صورة الإيصال")
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول أولاً")

      const fileName = `${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`receipts/${fileName}`, file)

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(`receipts/${fileName}`)

      const { error: insertError } = await supabase.from('topup_requests').insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        receipt_url: publicUrl.publicUrl,
        status: 'pending'
      }])

      if (insertError) throw insertError

      alert("تم إرسال طلب الشحن بنجاح! 🎉 سيتم تحديث رصيدك فور مراجعة الإدارة.")
      router.push('/profile')
    } catch (err: any) {
      alert("حدث خطأ: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions = [
    { id: 'visa', name: 'بطاقة بنكية (Visa/Master)', icon: CreditCard, color: 'text-blue-600', desc: 'أوروبا والعالم', bg: 'bg-blue-50' },
    { id: 'sham', name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', desc: 'سوريا والشرق الأوسط (رفع إيصال)', bg: 'bg-emerald-50' },
    { id: 'paypal', name: 'باي بال (PayPal)', icon: Globe, color: 'text-sky-500', desc: 'دفع إلكتروني سريع', bg: 'bg-sky-50' },
    { id: 'crypto', name: 'العملات الرقمية (USDT)', icon: Bitcoin, color: 'text-orange-500', desc: 'دفع لا مركزي سريع', bg: 'bg-orange-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      {/* هيدر المحفظة الفاخر */}
      <div className="p-8 bg-emerald-600 text-white rounded-b-[50px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <button onClick={() => router.back()} className="relative z-10 bg-white/20 p-2 rounded-xl mb-6 active:scale-95 transition-transform">
          <ArrowRight size={20} />
        </button>
        <h1 className="relative z-10 text-2xl font-black italic tracking-tighter flex items-center gap-2">محفظتي المالية 💳</h1>
        <p className="relative z-10 text-sm opacity-90 mt-1 font-bold">إدارة الرصيد وطرق الدفع الآمنة</p>
      </div>

      <div className="px-6 -mt-10 space-y-6 relative z-20">
        {/* عرض الرصيد الحقيقي */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/10 border border-emerald-50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">الرصيد المتاح حالياً</p>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-5xl font-black text-emerald-600 tracking-tighter">{balance.toFixed(2)}</span>
            <span className="text-xl font-bold text-emerald-400">€</span>
          </div>
        </div>

        {/* نموذج شحن الرصيد (يظهر عند اختيار شام كاش) */}
        {selectedMethod === 'sham' && (
          <form onSubmit={handleTopUpRequest} className="bg-white p-6 rounded-[35px] shadow-xl border-2 border-emerald-500 animate-in slide-in-from-top-4 duration-500 space-y-4">
            <h3 className="font-black text-emerald-700 flex items-center gap-2 mb-2">
              <Plus size={20} /> تفاصيل الشحن المحلي
            </h3>
            <div>
              <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block">المبلغ باليورو (€)</label>
              <input 
                type="number" 
                required
                placeholder="أدخل المبلغ..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
              <input 
                type="file" 
                id="receipt" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={24} className="text-emerald-500" />
                <span className="text-xs font-black text-gray-600">{file ? "تم اختيار الإيصال ✅" : "ارفع صورة إيصال التحويل"}</span>
              </label>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "إرسال الطلب للمراجعة"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-800 px-2">اختر وسيلة الشحن</h2>
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

        {/* بطاقة الحماية */}
        <div className="bg-slate-900 p-6 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black mb-1 flex items-center gap-2">حماية البيانات المالية</h4>
              <p className="text-[10px] text-gray-400 leading-loose font-bold">
                نحن نستخدم تشفير <span className="text-emerald-400">AES-256</span> العالمي. بياناتك المالية تتم معالجتها عبر بوابات دفع دولية مرخصة.
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav activeTab="profile" />
    </div>
  )
}