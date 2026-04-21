'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowRight, Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, XCircle, Loader2, Landmark, ShieldCheck, X,
  CreditCard, Bitcoin, Banknote, UploadCloud
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PAYMENT_METHODS = [
  { id: 'local', title: 'حوالة بنكية / محلية', desc: 'شام كاش، الهرم، تحويل بنكي', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'crypto', title: 'عملات رقمية (USDT)', desc: 'شبكة TRC20', icon: Bitcoin, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'paypal', title: 'PayPal / محافظ إلكترونية', desc: 'تحويل سريع', icon: Banknote, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 'card', title: 'بطاقة بنكية', desc: 'Visa / Mastercard', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
]

export default function WalletPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showTopupModal, setShowTopupModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('local')
  const [submitting, setSubmitting] = useState(false)
  
  // دمج ميزة رفع الإيصال
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يرجى تسجيل الدخول")

      const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
      if (profile) setBalance(profile.wallet_balance || 0)

      const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
      if (txs) setTransactions(txs)
    } catch (error: any) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceiptFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleTopupRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return alert("يرجى إدخال مبلغ صحيح")
    
    if (selectedMethod === 'card') {
      alert("🔒 جاري تحويلك إلى بوابة الدفع الآمنة (Stripe)... [هذه محاكاة]")
      return
    }

    // 👑 التحقق من المرفقات (الحماية الأمنية للموظف)
    if (!reference) return alert("يرجى إدخال رقم العملية (المرجع) للمطابقة.")
    if (!receiptFile) return alert("يرجى إرفاق صورة إيصال الدفع لكي نتمكن من اعتماد الرصيد.")

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("مستخدم غير صالح")

      // 1. رفع صورة الإيصال (لكي تظهر في admin-panel)
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile)
      if (uploadError) throw new Error("فشل رفع الصورة. يرجى التأكد من إعدادات Storage في Supabase.")
      
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName)

      // 2. إرسال الطلب لجدول الشحن (topup_requests) للموظفين
      const { error: topupError } = await supabase.from('topup_requests').insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        receipt_url: publicUrl,
        status: 'pending'
      }])
      if (topupError) throw topupError

      // 3. توثيق الحركة في سجل المستخدم (transactions) كحركة قيد المراجعة
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        type: 'deposit',
        status: 'pending',
        reference_number: `${selectedMethod.toUpperCase()} - ${reference}`
      }])
      if (txError) throw txError

      alert('✅ تم إرسال طلب الشحن بنجاح! سيقوم فريقنا بمراجعته وإضافة الرصيد قريباً.')
      setShowTopupModal(false)
      setAmount('')
      setReference('')
      setReceiptFile(null)
      setPreviewUrl('')
      fetchWalletData() 
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // دوال عرض الحالات (تم إبقاؤها لجماليتها)
  const getTxIcon = (type: string, status: string) => {
    if (status === 'rejected') return <XCircle size={20} className="text-rose-500" />
    if (status === 'pending') return <Clock size={20} className="text-amber-500" />
    if (type === 'deposit' || type === 'refund') return <ArrowDownLeft size={20} className="text-emerald-500" />
    return <ArrowUpRight size={20} className="text-rose-500" />
  }

  const getTxColor = (type: string, status: string) => {
    if (status === 'rejected') return 'text-rose-500 bg-rose-50 border-rose-100'
    if (status === 'pending') return 'text-amber-600 bg-amber-50 border-amber-100'
    if (type === 'deposit' || type === 'refund') return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    return 'text-slate-600 bg-slate-50 border-slate-100' 
  }

  const getTxTitle = (type: string) => {
    switch (type) {
      case 'deposit': return 'طلب شحن رصيد'
      case 'purchase': return 'دفع قيمة مشتريات'
      case 'refund': return 'استرداد نقدي'
      default: return 'عملية مالية'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة ⏳'
      case 'completed': return 'مكتمل ✅'
      case 'rejected': return 'مرفوض ❌'
      default: return status
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-emerald-600">
      <Loader2 className="animate-spin w-10 h-10 mb-4"/> 
      <p className="font-black tracking-widest text-sm">جاري تأمين الاتصال بالمحفظة...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-right font-sans" dir="rtl">
      
      <div className="bg-slate-900 px-6 pt-12 pb-6 sticky top-0 z-20 shadow-xl rounded-b-[40px] flex items-center justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <button onClick={() => router.back()} className="bg-white/10 p-2.5 rounded-2xl active:scale-95 transition-transform text-white border border-white/10 relative z-10">
          <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black text-white relative z-10">المحفظة الرقمية</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-6 mt-6 space-y-8 animate-in slide-in-from-bottom-4">
        
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-[40px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] relative overflow-hidden text-white border border-emerald-500/30">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
                <Wallet size={28} className="text-emerald-100" />
              </div>
              <ShieldCheck size={24} className="text-emerald-300 opacity-80" />
            </div>
            
            <p className="text-xs font-black text-emerald-100/70 uppercase tracking-widest mb-1">الرصيد الإجمالي المتاح</p>
            <h2 className="text-5xl font-black tracking-tight">{balance.toFixed(2)} <span className="text-lg font-bold text-emerald-300">€</span></h2>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowTopupModal(true)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <PlusCircle size={20} className="text-emerald-400" /> شحن المحفظة
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-slate-400" /> سجل العمليات المالية
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-[35px] border border-slate-100 shadow-sm">
              <Landmark size={40} className="mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">لا توجد حركات مالية في محفظتك حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${getTxColor(tx.type, tx.status)}`}>
                      {getTxIcon(tx.type, tx.status)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{getTxTitle(tx.type)}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-base ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{tx.amount.toFixed(2)} €
                    </span>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md mt-1 inline-block ${getTxColor(tx.type, tx.status).replace('border', '')}`}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= نافذة طلب الشحن ================= */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-6 pb-10 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pt-2 pb-2">
              <div>
                <h2 className="text-xl font-black text-slate-900">شحن المحفظة 💰</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">اختر الطريقة الأنسب وأرفق الإيصال للتأكيد</p>
              </div>
              <button onClick={() => setShowTopupModal(false)} className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-[20px] border-2 text-right transition-all flex flex-col gap-2 ${selectedMethod === method.id ? `border-emerald-500 bg-emerald-50 shadow-md` : `border-slate-100 bg-white hover:border-slate-200`}`}
                >
                  <div className={`p-2 w-fit rounded-xl border ${method.bg} ${method.color} ${method.border}`}>
                    <method.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-900">{method.title}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-xs font-bold text-amber-700 mb-6 leading-relaxed flex gap-2">
              <span className="text-amber-500">💡</span>
              {selectedMethod === 'local' && "قم بتحويل المبلغ عبر فروع الهرم أو شام كاش، ثم أرفق صورة الإيصال ورقم الحوالة."}
              {selectedMethod === 'crypto' && "أرسل USDT (TRC20) إلى محفظتنا، ثم أرفق صورة لنجاح العملية مع الـ TxID."}
              {selectedMethod === 'paypal' && "أرسل إلى pay@nimah.com، ثم أرفق لقطة شاشة للعملية مع الـ Transaction ID."}
              {selectedMethod === 'card' && "سيتم تحويلك إلى بوابة الدفع المباشرة. لا حاجة لإرفاق إيصال."}
            </div>

            <form onSubmit={handleTopupRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 mr-2">المبلغ المراد شحنه (€)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.01" min="1" required value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-4 pl-12 text-lg font-black text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="مثال: 50"
                  />
                  <span className="absolute left-5 top-4 font-black text-slate-400">€</span>
                </div>
              </div>
              
              {selectedMethod !== 'card' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2 mr-2">
                      {selectedMethod === 'crypto' ? 'معرف العملية (TxID / Hash)' : 'رقم الإيصال / المرجع'}
                    </label>
                    <input 
                      type="text" required value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                      placeholder="أدخل رقم العملية للتأكيد..."
                    />
                  </div>

                  {/* 👑 منطقة رفع الإيصال (إجبارية لحماية الإدارة) */}
                  <div className="relative group">
                    <input 
                      type="file" required accept="image/*" onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 group-hover:border-emerald-300'}`}>
                      {previewUrl ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                          <img src={previewUrl} className="w-full h-full object-contain bg-white" alt="Preview" />
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-black text-xs">
                            اضغط لتغيير الصورة
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={28} className="text-emerald-500 mb-2" />
                          <span className="font-black text-xs text-slate-700">اضغط لإرفاق صورة الإيصال</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-1">يجب أن يكون رقم العملية والمبلغ واضحين</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" disabled={submitting}
                className={`w-full text-white py-4 rounded-[25px] font-black text-sm mt-4 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 ${selectedMethod === 'card' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'}`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                  selectedMethod === 'card' ? <><CreditCard size={18}/> الانتقال للدفع الآمن</> : <><PlusCircle size={18}/> تأكيد وإرسال الطلب</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}