'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Clock, ArrowRight, Loader2, Store, TrendingUp, CheckCircle, 
  AlertCircle, QrCode, Search, ShieldCheck, XCircle, Trash2, 
  ImagePlus, Crown, Megaphone, Lock, PackageX, MapPin, Calendar, Map
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import dynamic from 'next/dynamic'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// 👑 التصنيفات الشاملة للسوق الجديد (Marketplace)
const CATEGORIES = ['مطاعم', 'مخابز', 'حلويات', 'بقالة', 'عصرونية', 'ألبسة', 'عطور', 'موبايلات', 'أثاث', 'سيارات ودراجات', 'مكتبة', 'خدمات']

// استدعاء خريطة تحديد الموقع بشكل ديناميكي لمنع أخطاء الخادم (SSR)
const DynamicLocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-50 rounded-[30px] border border-slate-100 flex flex-col items-center justify-center text-emerald-500"><Loader2 className="animate-spin mb-2" /><span className="text-xs font-bold text-slate-400">جاري تحميل الخريطة...</span></div>
})

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  // بيانات التاجر (البائع)
  const [merchantName, setMerchantName] = useState('جاري التحميل...')
  const [merchantStatus, setMerchantStatus] = useState('pending') 
  const [merchantRole, setMerchantRole] = useState('merchant') // 👑 للتحقق من صلاحية الـ VIP
  const [myMeals, setMyMeals] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'scan'>('dashboard')

  // حالات إضافة إعلان/منتج
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [product, setProduct] = useState({
    title: '',
    description: '',
    category: 'أثاث',
    currency: 'ل.س',
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    // 👑 الحقول الجغرافية الهرمية
    state: '',
    city: '',
    street: '',
    // 👑 حقول أوقات التوفر
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // افتراضياً ينتهي بعد 30 يوم
    startTime: '09:00',
    endTime: '22:00'
  })

  // 📍 حالة تخزين إحداثيات الموقع (للخريطة)
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)

  // حالات التحقق من كود التسليم
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

    // جلب بيانات البروفايل للتحقق من حالة ورتبة البائع
    const { data: profile } = await supabase.from('profiles').select('shop_name, full_name, status, role').eq('id', user.id).single()
    if (profile) {
      setMerchantName(profile.shop_name || profile.full_name || 'بائع نِعمة')
      setMerchantStatus(profile.status || 'pending') 
      setMerchantRole(profile.role || 'merchant')
    }

    // جلب الإعلانات
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false })

    if (meals) setMyMeals(meals)
    setDataLoading(false)
  }

  // === دالة التحقق من الكود الرقمي (محدثة للتشخيص الدقيق 🔍) ===
  const handleVerifyTicket = async () => {
    if (!ticketInput) return
    setVerifying(true)
    setScanResult(null)

    const cleanTicketCode = ticketInput.trim().toUpperCase()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. نبحث عن الكود في كل النظام (بدون تقييده بالتاجر حالياً) لنكتشف أين المشكلة
      const { data: order, error } = await supabase
        .from('orders')
        .select(`*, meals (name, image_url)`)
        .eq('ticket_code', cleanTicketCode)
        .single()

      if (error || !order) {
        setScanResult({ error: `الكود (${cleanTicketCode}) غير موجود في النظام نهائياً ❌` })
      } else if (order.merchant_id !== user?.id) {
        // 🚨 هنا سنمسك الخطأ إذا كان الـ merchant_id لا يتم حفظه!
        setScanResult({ error: `الكود صحيح، ولكنه غير مربوط بحسابك كتاجر! ⚠️ (قيمة التاجر في القاعدة: ${order.merchant_id || 'فارغ null'})` })
      } else {
        setScanResult(order)
      }
    } catch (err) {
      setScanResult({ error: "حدث خطأ أثناء الاتصال بالقاعدة" })
    } finally {
      setVerifying(false)
    }
  }

  // === دالة تأكيد تسليم المنتج ===
  const handleRedeemTicket = async (orderId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('orders').update({ status: 'used' }).eq('id', orderId)
      if (error) throw error
      alert('✅ تم تأكيد التسليم بنجاح!')
      setScanResult(null)
      setTicketInput('')
      fetchMerchantData()
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // === دالة حذف الإعلان ===
  const handleDeleteMeal = async (mealId: number) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الإعلان نهائياً؟ 🗑️')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId)
      if (error) throw error
      alert('تم الحذف بنجاح ✅')
      fetchMerchantData()
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // 👑 الميزة الإستراتيجية: الترويج للصفحة الرئيسية (محمية)
  const handlePromoteMeal = async (mealId: number) => {
    if (merchantRole !== 'trusted_merchant' && merchantRole !== 'vip') {
      return alert('🔒 عذراً، ميزة ترويج الإعلانات للصفحة الرئيسية متاحة فقط للحسابات الموثقة والمشتركة (VIP). يرجى التواصل مع الإدارة للترقية.');
    }

    const hasSponsored = myMeals.some(m => m.is_sponsored === true);
    if (hasSponsored) {
      return alert('🚫 عذراً، يُسمح لك بترويج إعلان واحد فقط. يرجى إزالة الترويج عن الإعلان السابق أولاً.');
    }

    if (!window.confirm('هل تريد تثبيت هذا الإعلان في الواجهة الرئيسية لزيادة المشاهدات؟ 🚀')) return;

    setLoading(true)
    try {
      const { error } = await supabase.from('meals').update({ is_sponsored: true }).eq('id', mealId)
      if (error) throw error
      alert('🎉 تم تثبيت الإعلان في الصفحة الرئيسية بنجاح!');
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

  // === إضافة الإعلان (النشر التلقائي الشامل) ===
  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (merchantStatus !== 'active') return alert("حسابك قيد المراجعة، لا يمكنك النشر حالياً ⏳");
    if (imageFiles.length === 0) return alert("يرجى إرفاق صورة واحدة على الأقل 📸")
    if (!product.state || !product.city || !product.street) return alert("يرجى تعبئة كافة تفاصيل العنوان (المحافظة، المدينة، الشارع) 📍")
    
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
        // 👑 الحفظ الجغرافي الهرمي
        state: product.state,
        city: product.city,
        street: product.street,
        // 👑 حفظ أوقات الدوام
        start_date: product.startDate,
        end_date: product.endDate,
        pickup_time: `من ${product.startTime} إلى ${product.endTime}`,
        
        image_url: uploadedUrls[0],
        images_gallery: uploadedUrls,
        is_approved: true, // النشر التلقائي والفوري يعمل
        latitude: location?.lat || null, // اختياري إذا لم يحدد على الخريطة
        longitude: location?.lng || null
      }])

      if (error) throw error
      alert('✅ تم النشر بنجاح! إعلانك متاح الآن للزبائن في السوق.')
      
      setProduct({ ...product, title: '', description: '', originalPrice: '', discountedPrice: '', quantity: '1', state: '', city: '', street: '' })
      setImageFiles([])
      setPreviewUrls([])
      setLocation(null)
      setActiveTab('dashboard')
      fetchMerchantData()
    } catch (error: any) {
      alert('❌ خطأ في النظام: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 👑 إحصائيات متقدمة
  const activeMealsCount = myMeals.filter(m => m.quantity > 0).length
  const outOfStockCount = myMeals.filter(m => m.quantity <= 0).length

  if (dataLoading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-emerald-600 w-12 h-12"/></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 👑 الهيدر الإمبراطوري للبائع */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[40px] shadow-2xl mb-6 sticky top-0 z-30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform hover:bg-white/20">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tight">لوحة تحكم البائع 🏪</h1>
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
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"><Clock size={10}/> قيد المراجعة الإدارية</span>
                )}
                {(merchantRole === 'vip' || merchantRole === 'trusted_merchant') && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md font-black flex items-center gap-1 ml-1"><Crown size={10}/> VIP</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mt-6 backdrop-blur-md relative z-10 border border-slate-800">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-white'}`}>الإعلانات</button>
          <button onClick={() => setActiveTab('scan')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'scan' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-white'}`}>الطلبات 🎫</button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeTab === 'add' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>إضافة إعلان</button>
        </div>
      </div>

      {/* 1. تبويب الإحصائيات وإدارة الإعلانات */}
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
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-500"><PackageX size={24}/></div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">نفدت الكمية</p>
                <p className="text-2xl font-black text-slate-900">{outOfStockCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 mr-2 flex items-center gap-2">إدارة إعلاناتك <Store size={16} className="text-slate-400"/></h2>
            {myMeals.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-[35px] border border-slate-100 text-slate-400 font-bold">لا توجد إعلانات حالياً. ابدأ بإضافة أول إعلان لك!</div>
            ) : (
              myMeals.map(meal => (
                <div key={meal.id} className={`bg-white p-4 rounded-[30px] shadow-sm border ${meal.quantity === 0 ? 'border-rose-100 opacity-75' : 'border-slate-100'} flex gap-4 items-center group relative overflow-hidden`}>
                  
                  {/* زر الحذف */}
                  <button 
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="absolute top-4 left-4 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors active:scale-90 z-10"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* زر الترويج (سيظهر فقط إذا كان نشطاً ولديه كمية) */}
                  {!meal.is_sponsored && meal.quantity > 0 && (
                    <button 
                      onClick={() => handlePromoteMeal(meal.id)}
                      className="absolute bottom-4 left-4 p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-colors active:scale-90 z-10 flex items-center gap-1 font-black text-[10px]"
                      title="ترويج للصفحة الرئيسية"
                    >
                      <Megaphone size={14} /> ترويج VIP
                    </button>
                  )}

                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 relative">
                    <img src={meal.image_url} alt={meal.name} className={`w-full h-full object-cover transition-transform duration-500 ${meal.quantity === 0 ? 'grayscale' : 'group-hover:scale-110'}`} />
                    {meal.is_sponsored && (
                      <div className="absolute inset-x-0 bottom-0 bg-amber-500 text-slate-900 text-[8px] font-black text-center py-1 flex justify-center items-center gap-1">
                        <Crown size={10}/> ممول
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 py-1 min-w-0">
                    <h3 className="font-black text-sm text-slate-900 line-clamp-1">{meal.name}</h3>
                    <p className="text-[11px] font-black text-emerald-600 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">{meal.discounted_price} {meal.currency || 'ل.س'}</p>
                    
                    {/* 👑 إظهار تاريخ النشر للمراقبة */}
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                      <Calendar size={10} /> نُشر: {new Date(meal.created_at).toLocaleDateString('ar-EG')}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${meal.quantity > 0 ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'}`}>
                        {meal.quantity > 0 ? `الكمية المتوفرة: ${meal.quantity}` : 'نفدت الكمية ⚠️'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. تبويب استلام الطلبات (نظام الـ PIN السريع) */}
      {activeTab === 'scan' && (
        <div className="px-6 space-y-6 animate-in zoom-in-95">
           <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">تسليم المنتجات</h2>
            <p className="text-xs text-slate-500 font-bold mb-6">اطلب من الزبون إعطاءك كود الطلب وأدخله هنا للتحقق</p>
            <div className="relative">
              <input 
                type="text" 
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value.trim())} // 👑 ميزة ה-trim لإلغاء الفراغات الخاطئة
                placeholder="مثال: 4829" // 👑 توضيح أن الكود أصبح رقماً بسيطاً
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-center font-mono font-black text-xl tracking-[0.2em] focus:border-blue-500 outline-none transition-all uppercase"
              />
              <button 
                onClick={handleVerifyTicket}
                disabled={verifying || !ticketInput}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black mt-4 flex justify-center items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
              >
                {verifying ? <Loader2 className="animate-spin" /> : <><Search size={20}/> التحقق من الكود</>}
              </button>
            </div>
          </div>
          
          {scanResult && (
            <div className="animate-in slide-in-from-top-4">
              {scanResult.error ? (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-[30px] flex flex-col items-center text-center shadow-sm">
                  <XCircle size={40} className="text-rose-500 mb-2" />
                  <p className="font-black text-rose-700 text-sm">{scanResult.error}</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-emerald-100 p-6 rounded-[35px] shadow-xl">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-emerald-100">
                      <img src={scanResult.meals?.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1 inline-block uppercase">كود صحيح ومطابق ✅</span>
                      <h3 className="font-black text-slate-900">{scanResult.meals?.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{scanResult.customer_email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-400">حالة الطلب:</span>
                      <span className={`font-black ${scanResult.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {scanResult.status === 'active' ? 'جاهز للتسليم' : 'تم تسليمه مسبقاً! 🛑'}
                      </span>
                    </div>
                    {scanResult.status === 'active' ? (
                      <button onClick={() => handleRedeemTicket(scanResult.id)} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> تأكيد التسليم للزبون</>}
                      </button>
                    ) : (
                      <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-center font-black text-xs border border-rose-100">
                        تحذير: لا تقم بتسليم المنتج، هذا الكود تم استخدامه.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. تبويب إضافة إعلان (محمي بنظام Guardian + العناوين الهرمية 📍) */}
      {activeTab === 'add' && (
        <div className="px-6 animate-in slide-in-from-left-4">
          
          {merchantStatus !== 'active' ? (
            <div className="bg-white p-8 rounded-[35px] border border-slate-100 text-center shadow-sm flex flex-col items-center mt-10">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
                <Lock size={36} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">حسابك قيد المراجعة</h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                أهلاً بك في منصة نِعمة الشاملة! فريقنا يقوم حالياً بمراجعة طلب انضمامك. ستتمكن من نشر إعلاناتك فور التفعيل.
              </p>
              <button onClick={() => fetchMerchantData()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs active:scale-95 flex items-center gap-2">
                <Loader2 size={16} className={dataLoading ? "animate-spin" : ""} /> تحديث الحالة
              </button>
            </div>
          ) : (
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
                      <span className="font-black text-sm text-slate-700">اضغط لرفع صور الإعلان 📸</span>
                      <span className="text-[10px] text-slate-400 font-bold">يمكنك رفع عدة صور لتوضيح المنتج</span>
                    </>
                  )}
                </div>
              </div>

              {/* 👑 قسم العنوان الجغرافي الدقيق (Willhaben Style) */}
              <div className="space-y-4 bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                <label className="text-xs font-black text-slate-900 flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-emerald-500" /> العنوان التفصيلي للإعلان
                </label>
                <div className="space-y-3">
                  <input type="text" required value={product.state} placeholder="المحافظة (مثال: دمشق، حلب...)" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm" onChange={(e) => setProduct({...product, state: e.target.value})} />
                  <input type="text" required value={product.city} placeholder="المدينة / المنطقة" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm" onChange={(e) => setProduct({...product, city: e.target.value})} />
                  <input type="text" required value={product.street} placeholder="الشارع / نقطة علام للزبون" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm" onChange={(e) => setProduct({...product, street: e.target.value})} />
                </div>

                {/* الخريطة (اختيارية كدعم بصري) */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block flex items-center gap-1"><Map size={12}/> (اختياري) حدد النقطة على الخريطة</label>
                  <DynamicLocationPicker onLocationSelect={(lat: number, lng: number) => setLocation({lat, lng})} />
                </div>
              </div>

              {/* تفاصيل العرض والأوقات */}
              <div className="space-y-4 bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                <input type="text" required value={product.title} placeholder="عنوان الإعلان (مثال: شاشة سامسونج، طاولة، وجبة...)" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black focus:border-emerald-500 focus:bg-white outline-none transition-all" onChange={(e) => setProduct({...product, title: e.target.value})} />
                
                <textarea 
                  value={product.description} 
                  placeholder="وصف دقيق للمنتج حالته، مواصفاته..." 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-bold text-sm focus:border-emerald-500 focus:bg-white outline-none resize-none h-28 transition-all" 
                  onChange={(e) => setProduct({...product, description: e.target.value})} 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select required value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} className="bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black outline-none focus:border-emerald-500 transition-all text-sm">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" required value={product.currency} placeholder="العملة" className="bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black outline-none focus:border-emerald-500 transition-all text-sm" onChange={(e) => setProduct({...product, currency: e.target.value})} />
                </div>
                
                {/* 👑 أوقات الاستلام (تمت استعادتها) */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-900 mb-2 block flex items-center gap-1"><Clock size={14} className="text-emerald-500"/> أوقات التواصل أو الاستلام</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" required className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-3 text-slate-900 font-black text-center focus:border-emerald-500 outline-none" value={product.startTime} onChange={(e) => setProduct({...product, startTime: e.target.value})} />
                    <input type="time" required className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-3 text-slate-900 font-black text-center focus:border-emerald-500 outline-none" value={product.endTime} onChange={(e) => setProduct({...product, endTime: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-2 border-t border-slate-100">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">السعر الأساسي (للمقارنة)</label>
                    <input type="number" required placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-400 font-black text-center line-through focus:border-emerald-500 transition-all" value={product.originalPrice} onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-emerald-600 mb-1 block">سعر البيع النهائي</label>
                    <input type="number" required placeholder="0.00" className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-900 font-black text-center focus:border-emerald-500 transition-all" value={product.discountedPrice} onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="text-[10px] font-black text-slate-400 mb-1 block">الكمية المتوفرة للبيع (المخزون)</label>
                  <input type="number" required min="1" placeholder="أدخل الكمية المتوفرة..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-slate-900 font-black text-center focus:border-emerald-500 transition-all" value={product.quantity} onChange={(e) => setProduct({...product, quantity: e.target.value})} />
                </div>

              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[25px] font-black text-lg flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : 'نشر الإعلان 🚀'}
              </button>
            </form>
          )}
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}