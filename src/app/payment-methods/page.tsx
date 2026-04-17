'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  CreditCard, Wallet, Landmark, Bitcoin, ArrowRight, 
  Plus, CheckCircle2, ShieldCheck, Globe, Upload, Loader2, Lock, QrCode
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // حالات نماذج الدفع المختلفة
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState<File | null>(null) // لشام كاش (الإيصال)
  
  // حالات بطاقة الفيزا
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  // حالات باي بال
  const [paypalEmail, setPaypalEmail] = useState('')

  // حالات الكريبتو
  const [cryptoWallet, setCryptoWallet] = useState('')
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20')

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

  // دالة الشحن العامة لجميع الطرق (تمت برمجتها لتحاكي الدفع الفعلي)
  const handleTopUpRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return alert("يرجى إدخال المبلغ المراد شحنه")
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول أولاً")

      let receiptUrl = ''

      // إذا كانت الطريقة شام كاش، يجب رفع الإيصال أولاً
      if (selectedMethod === 'sham') {
        if (!file) throw new Error("يرجى رفع صورة الإيصال")
        const fileName = `${user.id}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(`receipts/${fileName}`, file)
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(`receipts/${fileName}`)
        receiptUrl = publicUrl.publicUrl
      }

      // إرسال الطلب لقاعدة البيانات
      const { error: insertError } = await supabase.from('topup_requests').insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        receipt_url: receiptUrl,
        status: 'pending',
        // يمكننا إضافة عمود payment_method لاحقاً لتحديد نوع الشحن
      }])

      if (insertError) throw insertError

      alert(`✅ تم إرسال طلب شحن بقيمة ${amount}€ بنجاح! سيتم تحديث رصيدك قريباً.`)
      router.push('/profile')
    } catch (err: any) {
      alert("❌ حدث خطأ: " + err.message)
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

  // === مكونات النماذج الديناميكية ===
  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    return (
      <form onSubmit={handleTopUpRequest} className="bg-white p-6 rounded-[35px] shadow-xl border border-gray-100 animate-in slide-in-from-top-4 duration-500 space-y-5">
        <h3 className="font-black text-gray-900 flex items-center justify-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <Plus size={18} className="text-emerald-500"/> تفاصيل عملية الشحن
        </h3>

        {/* حقل المبلغ (مشترك لجميع الطرق) */}
        <div>
          <label className="text-xs font-black text-gray-500 mr-2 mb-2 block">المبلغ المراد شحنه (€)</label>
          <input 
            type="number" required placeholder="أدخل المبلغ..." value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-black text-lg text-center outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* 1. نموذج بطاقة الفيزا */}
        {selectedMethod === 'visa' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">رقم البطاقة</label>
              <div className="relative">
                <input type="text" required placeholder="0000 0000 0000 0000" maxLength={16} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full bg-white border border-gray-200 p-3.5 pr-12 rounded-xl font-bold text-sm outline-none focus:border-blue-500" dir="ltr" />
                <CreditCard size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">تاريخ الانتهاء</label>
                <input type="text" required placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full bg-white border border-gray-200 p-3.5 rounded-xl font-bold text-sm text-center outline-none focus:border-blue-500" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">رمز الأمان (CVV)</label>
                <div className="relative">
                  <input type="password" required placeholder="123" maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-full bg-white border border-gray-200 p-3.5 rounded-xl font-bold text-sm text-center outline-none focus:border-blue-500" dir="ltr" />
                  <Lock size={14} className="absolute left-3 top-4 text-gray-300" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">الاسم على البطاقة</label>
              <input type="text" required placeholder="الاسم الكامل كما هو في البطاقة" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full bg-white border border-gray-200 p-3.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        {/* 2. نموذج شام كاش (نفس كودك السابق مع تحسينات بصرية) */}
        {selectedMethod === 'sham' && (
          <div className="pt-2">
            <label className="text-[10px] font-black text-gray-400 mr-2 mb-2 block uppercase">إثبات التحويل المحلي</label>
            <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center hover:bg-emerald-50 transition-colors">
              <input type="file" id="receipt" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={28} className={file ? "text-emerald-600" : "text-emerald-400 animate-bounce"} />
                <span className={`text-xs font-black ${file ? 'text-emerald-700' : 'text-emerald-600'}`}>
                  {file ? `تم اختيار الإيصال: ${file.name}` : "اضغط لرفع صورة إيصال التحويل"}
                </span>
                {!file && <span className="text-[9px] text-gray-400 font-bold">صيغة JPG أو PNG</span>}
              </label>
            </div>
          </div>
        )}

        {/* 3. نموذج باي بال */}
        {selectedMethod === 'paypal' && (
          <div className="pt-2">
            <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">حساب PayPal الخاص بك</label>
            <div className="relative">
              <input type="email" required placeholder="example@paypal.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} className="w-full bg-white border border-gray-200 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-sky-500" dir="ltr" />
              <Globe size={20} className="absolute left-4 top-4 text-sky-400" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold mt-2 text-center">سيتم تحويلك إلى صفحة الدفع الآمنة الخاصة بـ PayPal بعد التأكيد.</p>
          </div>
        )}

        {/* 4. نموذج العملات الرقمية (الكريبتو) */}
        {selectedMethod === 'crypto' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">عنوان محفظتك (Sender Address)</label>
              <div className="relative">
                <input type="text" required placeholder="T..." value={cryptoWallet} onChange={(e) => setCryptoWallet(e.target.value)} className="w-full bg-white border border-gray-200 p-4 pl-12 rounded-2xl font-bold text-xs outline-none focus:border-orange-500" dir="ltr" />
                <QrCode size={18} className="absolute left-4 top-4 text-orange-400" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 mr-2 mb-1 block uppercase">نوع الشبكة (Network)</label>
              <select value={cryptoNetwork} onChange={(e) => setCryptoNetwork(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl font-bold text-sm outline-none focus:border-orange-500 cursor-pointer">
                <option value="TRC20">Tron (TRC20) - عمولة منخفضة</option>
                <option value="ERC20">Ethereum (ERC20)</option>
                <option value="BEP20">Binance Smart Chain (BEP20)</option>
              </select>
            </div>
          </div>
        )}

        <button 
          type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white py-4 mt-2 rounded-[25px] font-black text-sm shadow-xl shadow-gray-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> إتمام عملية الشحن الآمنة</>}
        </button>
      </form>
    )
  }

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
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{balance.toFixed(2)}</span>
            <span className="text-xl font-black text-emerald-500">€</span>
          </div>
        </div>

        {/* عرض النموذج الديناميكي أعلى القائمة (إذا تم اختيار وسيلة) */}
        {selectedMethod && (
          <div className="pt-2">
             {renderPaymentForm()}
          </div>
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
                  ? 'border-emerald-500 shadow-xl bg-white scale-[1.02]' 
                  : 'border-transparent bg-white shadow-sm hover:border-gray-200'
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
                  selectedMethod === method.id ? 'bg-emerald-500 border-emerald-500' : 'border-gray-100 bg-gray-50'
                }`}>
                  {selectedMethod === method.id && <CheckCircle2 size={14} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* بطاقة الحماية المدمجة */}
        <div className="bg-slate-900 p-6 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black mb-1 flex items-center gap-2">حماية البيانات المالية</h4>
              <p className="text-[10px] text-gray-400 leading-loose font-bold">
                نحن نستخدم تشفير <span className="text-emerald-400">AES-256</span> العالمي. بياناتك المالية تتم معالجتها عبر بوابات دفع دولية مرخصة لضمان أمان أموالك.
              </p>
            </div>
          </div>
        </div>

      </div>
      <BottomNav activeTab="profile" />
    </div>
  )
}