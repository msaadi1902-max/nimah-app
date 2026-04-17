'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { PlusCircle, Clock, Camera, ArrowRight, Loader2, ListFilter, Store, Package, TrendingUp, CheckCircle, AlertCircle, Coins, Calendar } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const CATEGORIES = ['مطاعم', 'مخابز', 'حلويات', 'بقالة', 'عصرونية', 'ألبسة', 'عطور', 'موبايلات', 'أثاث']

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [merchantName, setMerchantName] = useState('جاري التحميل...')
  const [myMeals, setMyMeals] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add'>('dashboard')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // إضافة العملة وتواريخ الصلاحية للحالة
  const [product, setProduct] = useState({
    title: '',
    category: 'مطاعم',
    currency: 'ل.س', // العملة الافتراضية
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00'
  })

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return alert("يرجى التقاط أو رفع صورة للمنتج 📸")
    
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول كتاجر")

      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)

      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)

      // تضمين العملة والتواريخ عند الحفظ في قاعدة البيانات
      const { error } = await supabase.from('meals').insert([{
        merchant_id: user.id,
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
      setProduct({ ...product, title: '', originalPrice: '', discountedPrice: '' })
      setImageFile(null)
      setPreviewUrl(null)
      fetchMerchantData() 
      setActiveTab('dashboard')
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
      
      <div className="bg-emerald-800 text-white p-6 rounded-b-[40px] shadow-lg mb-6 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="bg-white/10 p-2 rounded-xl active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black">لوحة تحكم التاجر 🏪</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-800 font-black text-xl shadow-inner">
              {merchantName.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-sm">{merchantName}</h2>
              <p className="text-[10px] text-emerald-100 font-bold italic text-left">حالة الحساب: متجر معتمد ✅</p>
            </div>
          </div>
        </div>

        <div className="flex bg-white/10 p-1 rounded-xl mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 text-sm font-black rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white text-emerald-800' : 'text-emerald-100'}`}>الإحصائيات والعروض</button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2 text-sm font-black rounded-lg transition-colors ${activeTab === 'add' ? 'bg-white text-emerald-800' : 'text-emerald-100'}`}>إضافة عرض جديد</button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><TrendingUp size={24}/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold mb-1">عروض نشطة</p>
                <p className="text-2xl font-black text-gray-900 leading-none">{activeMealsCount}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-500"><Clock size={24}/></div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold mb-1">قيد المراجعة</p>
                <p className="text-2xl font-black text-gray-900 leading-none">{pendingMealsCount}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Package className="text-emerald-500" /> عروضي السابقة</h2>
            {myMeals.length === 0 ? (
              <div className="text-center bg-white p-10 rounded-[30px] border border-gray-100 shadow-sm text-gray-400 font-bold">
                <Package size={40} className="mx-auto mb-3 opacity-30" /> لم تقم بإضافة أي عروض بعد.
              </div>
            ) : (
              <div className="space-y-4">
                {myMeals.map(meal => (
                  <div key={meal.id} className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 flex gap-4 items-center">
                    <img src={meal.image_url} alt={meal.name} className="w-20 h-20 object-cover rounded-2xl" />
                    <div className="flex-1">
                      <h3 className="font-black text-sm text-gray-900">{meal.name}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">{meal.discounted_price} {meal.currency || 'ل.س'}</p>
                      <div className="mt-2 inline-block">
                        {meal.is_approved ? (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1"><CheckCircle size={12} /> منشور بالسوق</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1"><AlertCircle size={12} /> قيد المراجعة</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-xl text-center border border-gray-100">
                      <span className="block text-[8px] font-bold text-gray-400">الكمية</span>
                      <span className="text-sm font-black text-gray-900">{meal.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          
          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 min-h-[160px] overflow-hidden hover:bg-emerald-50 transition-colors shadow-sm">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-40 object-cover rounded-2xl shadow-sm" alt="Preview" />
              ) : (
                <>
                  <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Camera size={32} /></div>
                  <span className="font-black text-sm text-gray-700">اضغط لالتقاط صورة للوجبة</span>
                  <span className="text-[10px] text-gray-400 font-bold text-center">يفضل صور واضحة لجذب الزبائن</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">اسم العرض / الوجبة</label>
              <input type="text" required value={product.title} placeholder="مثال: صندوق معجنات مشكل" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm transition-all" onChange={(e) => setProduct({...product, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic flex items-center gap-1"><ListFilter size={14} className="text-emerald-500"/> التصنيف</label>
                <select required value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm appearance-none transition-all cursor-pointer">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic flex items-center gap-1"><Coins size={14} className="text-amber-500"/> العملة</label>
                <input type="text" required value={product.currency} placeholder="مثال: ليرة، دولار..." className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm transition-all" onChange={(e) => setProduct({...product, currency: e.target.value})} />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">السعر الأصلي</label>
                <input type="number" required value={product.originalPrice} step="0.01" placeholder="10.00" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black text-center focus:border-emerald-600 focus:outline-none shadow-sm transition-all" onChange={(e) => setProduct({...product, originalPrice: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-emerald-600 mb-2 mr-2 italic">سعر نِعمة</label>
                <input type="number" required value={product.discountedPrice} step="0.01" placeholder="3.00" className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-900 font-black text-center focus:border-emerald-600 focus:outline-none shadow-sm transition-all" onChange={(e) => setProduct({...product, discountedPrice: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 mb-2 mr-2 italic">الكمية المتوفرة</label>
              <input type="number" required value={product.quantity} min="1" placeholder="1" className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-black focus:border-emerald-600 focus:outline-none shadow-sm transition-all" onChange={(e) => setProduct({...product, quantity: e.target.value})} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm"><Calendar size={18} className="text-orange-500" /> الأيام المتاحة للعرض</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 block mb-1">من تاريخ</span>
                <input type="date" required value={product.startDate} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, startDate: e.target.value})} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 block mb-1">إلى تاريخ</span>
                <input type="date" required value={product.endDate} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, endDate: e.target.value})} />
              </div>
            </div>

            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm pt-4 border-t border-gray-100"><Clock size={18} className="text-emerald-600" /> أوقات توفر الاستلام</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-black text-gray-400 block mb-1">من الساعة</span>
                <input type="time" required value={product.startTime} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, startTime: e.target.value})} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-gray-400 block mb-1">إلى الساعة</span>
                <input type="time" required value={product.endTime} className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 font-black text-center border border-gray-100 focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setProduct({...product, endTime: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-5 rounded-[25px] font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : 'انشر العرض بالصورة 🚀'}
          </button>
        </form>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}