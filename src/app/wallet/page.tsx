'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowRight, Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, XCircle, Loader2, Landmark, ShieldCheck, X,
  CreditCard, Bitcoin, Banknote
} from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// المصفوفة التي تحتوي على طرق الدفع العالمية
const PAYMENT_METHODS = [
  { id: 'local', title: 'حوالة محلية', desc: 'شام كاش، الهرم', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'card', title: 'بطاقة بنكية', desc: 'Visa / Mastercard', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'crypto', title: 'USDT', desc: 'شبكة TRC20', icon: Bitcoin, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'paypal', title: 'PayPal', desc: 'تحويل سريع', icon: Banknote, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
]

export default function WalletPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // حالات نافذة الشحن
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('local')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يرجى تسجيل الدخول")

      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()
      
      if (profile) setBalance(profile.wallet_balance || 0)

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (txs) setTransactions(txs)

    } catch (error: any) {
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTopupRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return alert("يرجى إدخال مبلغ صحيح")
    
    // محاكاة توجيه بوابات الدفع (Visa/Mastercard)
    if (selectedMethod === 'card') {
      alert("🔒 جاري تحويلك إلى بوابة الدفع الآمنة (Stripe/PayTabs)... [هذه محاكاة للتطبيق]")
      return
    }

    if (!reference && selectedMethod !== 'card') return alert("يرجى إدخال رقم العملية أو الإيصال")

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("مستخدم غير صالح")

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: parseFloat(amount),
          type: 'deposit',
          status: 'pending',
          reference_number: `${selectedMethod.toUpperCase()} - ${reference}`
        }])

      if (error) throw error

      alert('✅ تم إرسال طلب الشحن بنجاح. سيتم إضافة الرصيد فور التأكد من العملية.')
      setShowTopupModal(false)
      setAmount('')
      setReference('')
      fetchWalletData() 
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

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
    return 'text-gray-600 bg-gray-50 border-gray-100' 
  }

  const getTxTitle = (type: string) => {
    switch (type) {
      case 'deposit': return 'شحن رصيد'
      case 'purchase': return 'شراء وجبة'
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-emerald-600 font-black italic">
      <Loader2 className="animate-spin w-10 h-10 mb-4"/> 
      جاري تأمين الاتصال بالمحفظة...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-right font-sans" dir="rtl">
      
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-20 shadow-sm rounded-b-[30px] flex items-center justify-between">
        <button onClick={() => router.back()} className="bg-gray-50 p-2.5 rounded-2xl active:scale-95 transition-transform text-gray-600">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black text-gray-900">المحفظة الرقمية</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        
        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
                <Wallet size={28} className="text-emerald-300" />
              </div>
              <ShieldCheck size={24} className="text-emerald-400 opacity-80" />
            </div>
            
            <p className="text-xs font-black text-emerald-200/70 uppercase tracking-widest mb-1">الرصيد الإجمالي المتاح</p>
            <h2 className="text-5xl font-black tracking-tight">{balance.toFixed(2)} <span className="text-lg font-bold text-emerald-400">€</span></h2>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowTopupModal(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            <PlusCircle size={20} /> إضافة أموال
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-emerald-500" /> سجل العمليات
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-[35px] border border-gray-100 shadow-sm animate-in fade-in">
              <Landmark size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">لا توجد حركات مالية في محفظتك حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white p-4 rounded-[25px] border border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-100 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${getTxColor(tx.type, tx.status)}`}>
                      {getTxIcon(tx.type, tx.status)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{getTxTitle(tx.type)}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-base ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{tx.amount.toFixed(2)} €
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${getTxColor(tx.type, tx.status).replace('border', '')}`}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= نافذة طلب الشحن المتقدمة (Modal) ================= */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-6 pb-10 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pt-2">
              <div>
                <h2 className="text-xl font-black text-gray-900">شحن المحفظة 💰</h2>
                <p className="text-xs text-gray-500 font-bold mt-1">اختر الطريقة الأنسب لك لإضافة الرصيد</p>
              </div>
              <button onClick={() => setShowTopupModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
            </div>

            {/* شبكة طرق الدفع */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-[20px] border-2 text-right transition-all flex flex-col gap-2 ${selectedMethod === method.id ? `border-emerald-500 bg-emerald-50/50 shadow-md` : `border-gray-100 bg-white hover:border-gray-200`}`}
                >
                  <div className={`p-2 w-fit rounded-xl border ${method.bg} ${method.color} ${method.border}`}>
                    <method.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900">{method.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* تعليمات ديناميكية حسب الطريقة المختارة */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold text-gray-600 mb-6 leading-relaxed">
              {selectedMethod === 'local' && "💡 قم بتحويل المبلغ عبر فروع شام كاش أو الهرم، ثم أدخل رقم الحوالة أدناه للتأكيد."}
              {selectedMethod === 'crypto' && "💡 قم بإرسال USDT حصراً على شبكة (TRC20) إلى المحفظة: TX9a... ثم أدخل (TxID) أدناه."}
              {selectedMethod === 'paypal' && "💡 أرسل المبلغ إلى الإيميل: pay@nimah.com، ثم أدخل رقم العملية (Transaction ID)."}
              {selectedMethod === 'card' && "💡 الدفع الفوري: سيتم تحويلك إلى البوابة الآمنة لإدخال بيانات بطاقتك الائتمانية."}
            </div>

            <form onSubmit={handleTopupRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2">المبلغ المطلوب شحنه (€)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-4 pl-12 text-lg font-black text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="مثال: 50"
                  />
                  <span className="absolute left-5 top-4 font-black text-gray-400">€</span>
                </div>
              </div>
              
              {selectedMethod !== 'card' && (
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 mr-2">
                    {selectedMethod === 'crypto' ? 'معرف العملية (TxID / Hash)' : 'رقم الإيصال / الحوالة'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="أدخل الرمز للتأكيد..."
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className={`w-full text-white py-4 rounded-[25px] font-black text-sm mt-2 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 ${selectedMethod === 'card' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                  selectedMethod === 'card' ? <><CreditCard size={18}/> الانتقال للدفع الآمن</> : <><PlusCircle size={18}/> إرسال طلب الشحن</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}