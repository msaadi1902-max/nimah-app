'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  PlusCircle, Clock, Camera, ArrowRight, Loader2, ListFilter, 
  Store, Package, TrendingUp, CheckCircle, AlertCircle, 
  Coins, Calendar, QrCode, Search, ShieldCheck, XCircle 
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['مطاعم', 'مخابز', 'حلويات', 'بقالة', 'عصرونية', 'ألبسة', 'عطور', 'موبايلات', 'أثاث']

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [merchantName, setMerchantName] = useState('جاري التحميل...')
  const [myMeals, setMyMeals] = useState<any[]>([])
  
  // تحديث التبويبات لتشمل المسح الضوئي
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'scan'>('dashboard')

  // حالات إضافة منتج
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [product, setProduct] = useState({
    title: '',
    category: 'مطاعم',
    currency: 'ل.س',
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00'
  })

  // حالات تحقق من التذكرة (الميزة الجديدة)
  const [ticketInput, setTicketInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  useEffect(() => {
    fetchMerchantData()
  }, [])

  const fetchMerchantData = async () => {
    setDataLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.replace('/welcome')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('shop_name, full_name').eq('id', user.id).single()
    if (profile) setMerchantName(profile.shop_name || profile.full_name || 'تاجر معتمد')

    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false })

    if (meals) setMyMeals(meals)
    setDataLoading(false)
  }

  // === دالة التحقق من التذكرة ===
  const handleVerifyTicket = async () => {
    if (!ticketInput) return
    setVerifying(true)
    setScanResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // البحث عن التذكرة والتأكد أنها تابعة لهذا التاجر حصراً
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          meals (name, image_url)
        `)
        .eq('ticket_code', ticketInput.toUpperCase())
        .eq('merchant_id', user?.id)
        .single()

      if (error || !order) {
        setScanResult({ error: "التذكرة غير موجودة أو لا تنتمي لمتجرك ❌" })
      } else {
        setScanResult(order)
      }
    } catch (err) {
      setScanResult({ error: "حدث خطأ أثناء الاتصال بالقاعدة" })
    } finally {
      setVerifying(false)
    }
  }

  // === دالة تأكيد تسليم الوجبة ===
  const handleRedeemTicket = async (orderId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'used' })
        .eq('id', orderId)

      if (error) throw error
      
      alert('✅ تم تأكيد الاستلام بنجاح! شكراً لمساهمتك في تقليل الهدر.')
      setScanResult(null)
      setTicketInput('')
      fetchMerchantData()
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return alert("يرجى التقاط أو رفع صورة للمنتج 📸")
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`
      await supabase.storage.from('product-images').upload(fileName, imageFile)
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)

      const { error } = await supabase.from('meals').insert([{
        merchant_id: user?.id,
        name: product.title,
        category: product.category,
        currency: product.currency,
        original_price: parseFloat(product.originalPrice),
        discounted_price: parseFloat(product.discountedPrice),
        quantity: parseInt(product.quantity),
        start_date: product.startDate,
        end_date: product.endDate,
        pickup_time: `من ${product.startTime} إلى ${product.endTime}`,
        image_url: publicUrl,
        is_approved: false 
      }])

      if (error) throw error
      alert('✅ تم إرسال العرض للإدارة بنجاح!')
      setActiveTab('dashboard')
      fetchMerchantData()
    } catch (error: any) {
      alert('❌ خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const activeMealsCount = myMeals.filter(m => m.is_approved && m.quantity > 0).length
  const pendingMealsCount = myMeals.filter(m => !m.is_approved).length

  if (dataLoading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-12 h-12"/></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      <div className="bg-emerald-900 text-white p-6 rounded-b-[40px] shadow-lg mb-6 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-lg font-black tracking-tighter">لوحة التحكم الذكية 🏪</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-900 font-black text-xl shadow-inner uppercase">
              {merchantName.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-sm">{merchantName}</h2>
              <p className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest">متجر موثق بنظام نِعمة</p>
            </div>
          </div>
        </div>

        {/* أزرار التبويبات الثلاثة */}
        <div className="flex bg-black/20 p-1 rounded-2xl mt-4 backdrop-blur-sm">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-emerald-900 shadow-md scale-100' : 'text-emerald-100'}`}>الإحصائيات</button>
          <button onClick={() => setActiveTab('scan')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${activeTab === 'scan' ? 'bg-white text-emerald-900 shadow-md scale-100' : 'text-emerald-100'}`}>مسح تذكرة 🎫</button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${activeTab === 'add' ? 'bg-white text-emerald-900 shadow-md scale-100' : 'text-emerald-100'}`}>إضافة عرض</button>
        </div>
      </div>

      {/* 1. تبويب الإحصائيات (Dashboard) */}
      {activeTab === 'dashboard' && (
        <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><TrendingUp size={20}/></div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase">عروض نشطة</p>
                <p className="text-xl font-black text-gray-900">{activeMealsCount}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-500"><Clock size={20}/></div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase">بانتظار الموافقة</p>
                <p className="text-xl font-black text-gray-900">{pendingMealsCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-900 mr-2 flex items-center gap-2 italic uppercase">قائمة المنتجات الحالية</h2>
            {myMeals.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-[35px] border border-gray-100 text-gray-400 font-bold">لا توجد عروض.</div>
            ) : (
              myMeals.map(meal => (
                <div key={meal.id} className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-100 flex gap-4 items-center group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-sm text-gray-900">{meal.name}</h3>
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">{meal.discounted_price} {meal.currency || 'ل.س'}</p>
                  </div>
                  <div className="text-left">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${meal.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {meal.is_approved ? 'منشور ✅' : 'تدقيق ⏳'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. تبويب مسح التذاكر (Verify Ticket) */}
      {activeTab === 'scan' && (
        <div className="px-6 space-y-6 animate-in zoom-in-95">
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">تسليم الوجبات</h2>
            <p className="text-xs text-gray-500 font-bold mb-6">أدخل كود التذكرة الخاص بالزبون للتحقق منه</p>

            <div className="relative">
              <input 
                type="text" 
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                placeholder="مثال: NIMAH-XXXX"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-center font-mono font-black text-xl tracking-[0.2em] focus:border-emerald-500 outline-none transition-all uppercase"
              />
              <button 
                onClick={handleVerifyTicket}
                disabled={verifying || !ticketInput}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black mt-4 flex justify-center items-center gap-2 hover:bg-black active:scale-95 transition-all"
              >
                {verifying ? <Loader2 className="animate-spin" /> : <><Search size={20}/> ابحث عن التذكرة</>}
              </button>
            </div>
          </div>

          {/* نتيجة البحث */}
          {scanResult && (
            <div className="animate-in slide-in-from-top-4">
              {scanResult.error ? (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[30px] flex flex-col items-center text-center">
                  <XCircle size={40} className="text-rose-500 mb-2" />
                  <p className="font-black text-rose-700 text-sm">{scanResult.error}</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-emerald-100 p-6 rounded-[35px] shadow-xl">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-emerald-100">
                      <img src={scanResult.meals?.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1 inline-block uppercase">تذكرة صالحة ✅</span>
                      <h3 className="font-black text-gray-900">{scanResult.meals?.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{scanResult.customer_email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">حالة التذكرة:</span>
                      <span className={`font-black ${scanResult.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {scanResult.status === 'active' ? 'جاهزة للتسليم' : 'تم استخدامها مسبقاً! 🛑'}
                      </span>
                    </div>

                    {scanResult.status === 'active' ? (
                      <button 
                        onClick={() => handleRedeemTicket(scanResult.id)}
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 shadow-lg shadow-emerald-100"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> تأكيد تسليم الوجبة الآن</>}
                      </button>
                    ) : (
                      <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-center font-black text-xs border border-rose-100">
                        تحذير: لا تقم بتسليم الوجبة، التذكرة غير صالحة.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. تبويب إضافة وجبة (Add Meal) */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitMeal} className="px-6 space-y-6 animate-in slide-in-from-left-4">
          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="bg-white p-6 rounded-[35px] border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center gap-2 min-h-[180px] overflow-hidden hover:bg-emerald-50 transition-all shadow-sm">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-40 object-cover rounded-2xl" alt="Preview" />
              ) : (
                <>
                  <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Camera size={32} /></div>
                  <span className="font-black text-sm text-gray-700">التقط صورة للوجبة</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <input type="text" required value={product.title} placeholder="اسم الوجبة (مثلاً: مشاوي مشكل)" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-gray-900 font-black focus:border-emerald-600 outline-none" onChange={(e) => setProduct({...product, title: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <select required value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-gray-900 font-black outline-none appearance-none">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="text" required value={product.currency} className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-gray-900 font-black outline-none" onChange={(e) => setProduct({...product, currency: e.target.value})} />
            </div>
            
            <div className="flex gap-4">
              <input type="number" required placeholder="السعر الأصلي" className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-5 text-gray-900 font-black text-center" onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
              <input type="number" required placeholder="سعر نِعمة" className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-emerald-900 font-black text-center" onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-5 rounded-[25px] font-black text-lg flex justify-center items-center gap-2 shadow-xl active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : 'نشر الوجبة الآن 🚀'}
          </button>
        </form>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}