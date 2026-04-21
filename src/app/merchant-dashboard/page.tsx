'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Clock, ArrowRight, Loader2, Store, TrendingUp, CheckCircle, 
  AlertCircle, QrCode, Search, ShieldCheck, XCircle, Trash2, 
  ImagePlus, Crown, Megaphone, Lock
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['مطاعم', 'مخابز', 'حلويات', 'بقالة', 'عصرونية', 'ألبسة', 'عطور', 'موبايلات', 'أثاث']

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  // بيانات التاجر
  const [merchantName, setMerchantName] = useState('جاري التحميل...')
  const [merchantStatus, setMerchantStatus] = useState('pending') // pending, active, blocked
  const [myMeals, setMyMeals] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'scan'>('dashboard')

  // حالات إضافة منتج
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [product, setProduct] = useState({
    title: '',
    description: '',
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

  // حالات التحقق من التذكرة
  const [ticketInput, setTicketInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  useEffect(() => {
    fetchMerchantData()
  }, [])

  const fetchMerchantData = async () => {
    setDataLoading(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      router.replace('/auth?role=merchant')
      return
    }

    // جلب بيانات البروفايل للتحقق من حالة المتجر
    const { data: profile } = await supabase.from('profiles').select('shop_name, full_name, status').eq('id', user.id).single()
    if (profile) {
      setMerchantName(profile.shop_name || profile.full_name || 'تاجر نِعمة')
      setMerchantStatus(profile.status || 'pending') // افتراضياً قيد المراجعة
    }

    // جلب العروض
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
      const { data: order, error } = await supabase
        .from('orders')
        .select(`*, meals (name, image_url)`)
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
      const { error } = await supabase.from('orders').update({ status: 'used' }).eq('id', orderId)
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

  // === دالة حذف العرض ===
  const handleDeleteMeal = async (mealId: number) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا العرض نهائياً؟ 🗑️')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId)
      if (error) throw error
      alert('تم حذف العرض بنجاح ✅')
      fetchMerchantData()
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 👑 الميزة الإستراتيجية: الترويج للصفحة الرئيسية
  const handlePromoteMeal = async (mealId: number) => {
    const hasSponsored = myMeals.some(m => m.is_sponsored === true);
    if (hasSponsored) {
      return alert('🚫 عذراً، يُسمح لك بترويج عرض واحد فقط في الصفحة الرئيسية. يرجى إزالة الترويج عن العرض السابق أولاً.');
    }

    if (!window.confirm('هل تريد رفع هذا العرض للواجهة الرئيسية لزيادة المبيعات؟ 🚀')) return;

    setLoading(true)
    try {
      const { error } = await supabase.from('meals').update({ is_sponsored: true }).eq('id', mealId)
      if (error) throw error
      alert('🎉 تم تثبيت العرض في الصفحة الرئيسية بنجاح!');
      fetchMerchantData();
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // === رفع الصور ===
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setImageFiles(filesArray)
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  // === إضافة العرض ===
  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (merchantStatus !== 'active') return alert("حسابك قيد المراجعة، لا يمكنك النشر حالياً ⏳");
    if (imageFiles.length === 0) return alert("يرجى إرفاق صورة واحدة على الأقل 📸")
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uploadedUrls: string[] = []

      // رفع الصور
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user?.id}/${Math.random()}.${fileExt}`
        await supabase.storage.from('product-images').upload(fileName, file)
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(publicUrl)
      }

      const { error } = await supabase.from('meals').insert([{
        merchant_id: user?.id,
        name: product.title,
        description: product.description,
        category: product.category,
        currency: product.currency,
        original_price: parseFloat(product.originalPrice),
        discounted_price: parseFloat(product.discountedPrice),
        quantity: parseInt(product.quantity),
        start_date: product.startDate,
        end_date: product.endDate,
        pickup_time: `من ${product.startTime} إلى ${product.endTime}`,
        image_url: uploadedUrls[0],
        images_gallery: uploadedUrls,
        is_approved: false // يحتاج موافقة الموظفين أولاً
      }])

      if (error) throw error
      alert('✅ تم إرسال العرض بنجاح! سيظهر للزبائن فور موافقة الإدارة.')
      
      setProduct({ ...product, title: '', description: '', originalPrice: '', discountedPrice: '' })
      setImageFiles([])
      setPreviewUrls([])
      setActiveTab('dashboard')
      fetchMerchantData()
    } catch (error: any) {
      alert('❌ خطأ في النظام: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const activeMealsCount = myMeals.filter(m => m.is_approved && m.quantity > 0).length
  const pendingMealsCount = myMeals.filter(m => !m.is_approved).length

  if (dataLoading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-12 h-12"/></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 👑 الهيدر الإمبراطوري للتاجر */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[40px] shadow-2xl mb-6 sticky top-0 z-30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform hover:bg-white/20">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tight">مركز البائعين 🏪</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between backdrop-blur-xl border border-slate-700 relative z-10 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-900 font-black text-2xl shadow-lg shadow-emerald-500/20 uppercase">
              {merchantName.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-base text-white">{merchantName}</h2>
              <div className="flex items-center gap-1 mt-1">
                {merchantStatus === 'active' ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><CheckCircle size={10}/> موثق ومفعل</span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><Clock size={10}/> قيد المراجعة</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mt-6 backdrop-blur-md relative z-10 border border-slate-800">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-white'}`}>المنتجات</button>
          <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'scan' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-white'}`}>تسليم 🎫</button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'add' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>إضافة عرض</button>
        </div>
      </div>

      {/* 1. تبويب الإحصائيات (Dashboard) */}
      {activeTab === 'dashboard' && (
        <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[25px] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><TrendingUp size={24}/></div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">نشطة للبيع</p>
                <p className="text-2xl font-black text-slate-900">{activeMealsCount}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[25px] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-500"><Clock size={24}/></div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">بانتظار الإدارة</p>
                <p className="text-2xl font-black text-slate-900">{pendingMealsCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 mr-2 flex items-center gap-2">إدارة المنتجات <Store size={16} className="text-slate-400"/></h2>
            {myMeals.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-[35px] border border-slate-100 text-slate-400 font-bold">لا توجد عروض حالياً. ابدأ بإضافة أول عرض لك!</div>
            ) : (
              myMeals.map(meal => (
                <div key={meal.id} className="bg-white p-4 rounded-[30px] shadow-sm border border-slate-100 flex gap-4 items-center group relative overflow-hidden">
                  
                  {/* زر الحذف */}
                  <button 
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="absolute top-4 left-4 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors active:scale-90 z-10"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* زر الترويج (VIP) */}
                  {meal.is_approved && !meal.is_sponsored && (
                    <button 
                      onClick={() => handlePromoteMeal(meal.id)}
                      className="absolute bottom-4 left-4 p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-colors active:scale-90 z-10 flex items-center gap-1 font-black text-[10px]"
                      title="ترويج للصفحة الرئيسية"
                    >
                      <Megaphone size={14} /> ترويج
                    </button>
                  )}

                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                    <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {meal.is_sponsored && (
                      <div className="absolute inset-x-0 bottom-0 bg-amber-500 text-slate-900 text-[8px] font-black text-center py-1 flex justify-center items-center gap-1">
                        <Crown size={10}/> ممول
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 py-1">
                    <h3 className="font-black text-sm text-slate-900 line-clamp-1">{meal.name}</h3>
                    <p className="text-[11px] font-black text-emerald-600 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">{meal.discounted_price} {meal.currency || 'ل.س'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${meal.is_approved ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>
                        {meal.is_approved ? 'معروض للبيع' : 'قيد التدقيق ⏳'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. تبويب مسح التذاكر (Scan) - بقي كما هو لقوته */}
      {activeTab === 'scan' && (
        <div className="px-6 space-y-6 animate-in zoom-in-95">
          {/* ... (نفس كود التبويب السابق الخاص بمسح التذاكر - يمكنك الاحتفاظ به كما هو في كودك) ... */}
           <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-2">تسليم الوجبات</h2>
            <p className="text-xs text-gray-500 font-bold mb-6">أدخل كود التذكرة للتحقق والتسليم</p>
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
          {scanResult && (
            <div className="animate-in slide-in-from-top-4">
              {scanResult.error ? (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[30px] flex flex-col items-center text-center">
                  <XCircle size={40} className="text-rose-500 mb-2" />
                  <p className="font-black text-rose-700 text-sm">{scanResult.error}</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-emerald-100 p-6 rounded-[35px] shadow-xl">
                  {/* ... تفاصيل التذكرة ... */}
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
                      <button onClick={() => handleRedeemTicket(scanResult.id)} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 shadow-lg shadow-emerald-100">
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

      {/* 3. تبويب إضافة وجبة (محمي بنظام Guardian) */}
      {activeTab === 'add' && (
        <div className="px-6 animate-in slide-in-from-left-4">
          
          {/* 🛡️ قفل النشر للتجار الجدد */}
          {merchantStatus !== 'active' ? (
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 text-center shadow-sm flex flex-col items-center mt-10">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
                <Lock size={36} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">حسابك قيد المراجعة</h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                أهلاً بك في عائلة نِعمة! فريقنا يقوم حالياً بمراجعة طلب انضمامك. ستتمكن من نشر عروضك فور تفعيل حسابك للحفاظ على جودة المنصة.
              </p>
              <button onClick={() => fetchMerchantData()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs active:scale-95 flex items-center gap-2">
                <Loader2 size={16} className={dataLoading ? "animate-spin" : ""} /> تحديث الحالة
              </button>
            </div>
          ) : (
            /* نموذج الإضافة يعمل فقط إذا كان نشطاً */
            <form onSubmit={handleSubmitMeal} className="space-y-6">
              
              {/* قسم رفع الصور */}
              <div className="relative group">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-3 min-h-[180px] overflow-hidden hover:bg-emerald-50 transition-all shadow-sm">
                  {previewUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {previewUrls.map((url, index) => (
                        <img key={index} src={url} className="w-full h-24 object-cover rounded-2xl shadow-sm border border-slate-100" alt={`Preview ${index}`} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="bg-emerald-50 p-4 rounded-full text-emerald-500"><ImagePlus size={32} /></div>
                      <span className="font-black text-sm text-slate-700">اضغط لرفع صور المنتج 📸</span>
                      <span className="text-[10px] text-slate-400 font-bold">يفضل رفع صور واضحة ومغرية</span>
                    </>
                  )}
                </div>
              </div>

              {/* تفاصيل العرض */}
              <div className="space-y-4 bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                <input type="text" required value={product.title} placeholder="اسم الوجبة/المنتج" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black focus:border-emerald-500 focus:bg-white outline-none transition-all" onChange={(e) => setProduct({...product, title: e.target.value})} />
                
                <textarea 
                  value={product.description} 
                  placeholder="وصف شهي للمنتج (المكونات، يكفي لكم شخص...)" 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-bold text-sm focus:border-emerald-500 focus:bg-white outline-none resize-none h-28 transition-all" 
                  onChange={(e) => setProduct({...product, description: e.target.value})} 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select required value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} className="bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black outline-none focus:border-emerald-500 transition-all">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" required value={product.currency} placeholder="العملة" className="bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, currency: e.target.value})} />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">السعر الأساسي</label>
                    <input type="number" required placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-400 font-black text-center line-through focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-emerald-600 mb-1 block">سعر التخفيض (نِعمة)</label>
                    <input type="number" required placeholder="0.00" className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-900 font-black text-center focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[25px] font-black text-lg flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : 'إطلاق العرض 🚀'}
              </button>
            </form>
          )}
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}