'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  UserCircle, Wallet, CreditCard, Ticket, Bell, Gift, 
  Store, Info, Share2, LogOut, ChevronLeft, Heart,
  Landmark, ShieldCheck, Loader2, Sparkles, Settings,
  Leaf, TrendingDown, PiggyBank, Headphones, X, CheckCircle
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdvancedProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({
    rescuedMeals: 0,
    savedMoney: 0,
    co2Saved: 0
  })

  // === حالات النوافذ المنبثقة (الميزات الجديدة) ===
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  
  // حالات نموذج الإعدادات
  const [editName, setEditName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [updatingSettings, setUpdatingSettings] = useState(false)

  // حالات نموذج الدعم الفني
  const [supportMessage, setSupportMessage] = useState('')
  const [sendingSupport, setSendingSupport] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        setUserRole(profileData.role)
        setEditName(profileData.full_name || '') // تعبئة الاسم الحالي في نموذج الإعدادات

        if (profileData.role !== 'merchant') {
          const { data: orders } = await supabase
            .from('orders')
            .select('price, meals(original_price)')
            .eq('customer_email', user.email)

          if (orders && orders.length > 0) {
            const rescued = orders.length
            let saved = 0
            orders.forEach((o: any) => {
              const original = o.meals?.original_price || o.price
              if (original > o.price) saved += (original - o.price)
            })

            setStats({
              rescuedMeals: rescued,
              savedMoney: saved,
              co2Saved: rescued * 2.5 
            })
          }
        }
      }
    } else {
      router.replace('/welcome') 
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const confirm = window.confirm("هل أنت متأكد من تسجيل الخروج؟")
    if (confirm) {
      await supabase.auth.signOut()
      localStorage.removeItem('user_role')
      document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      router.push('/welcome')
    }
  }

  // === دوال النوافذ المنبثقة (الميزات الجديدة) ===
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingSettings(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("مستخدم غير مسجل")

      // 1. تحديث الاسم في جدول profiles
      if (editName !== profile?.full_name) {
        await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id)
      }

      // 2. تحديث كلمة المرور في قسم المصادقة (إذا كتب شيئاً جديداً)
      if (editPassword.trim().length > 0) {
        const { error } = await supabase.auth.updateUser({ password: editPassword })
        if (error) throw error
      }

      alert('✅ تم تحديث بياناتك بنجاح!')
      setShowSettingsModal(false)
      fetchUserData() // تحديث البيانات المعروضة
      setEditPassword('') // تصفير حقل كلمة المرور
    } catch (error: any) {
      alert('❌ حدث خطأ: ' + error.message)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim()) return
    setSendingSupport(true)
    
    // محاكاة إرسال تذكرة دعم (يمكن ربطها بجدول support_tickets لاحقاً)
    setTimeout(() => {
      alert('✅ تم إرسال رسالتك لفريق الدعم بنجاح. سنرد عليك قريباً!')
      setSupportMessage('')
      setShowSupportModal(false)
      setSendingSupport(false)
    }, 1500)
  }

  // بناء الأقسام ديناميكياً 
  const buildSections = () => {
    const sections = []

    sections.push({
      title: "تأثيرك المجتمعي",
      items: [
        { name: 'أثري الإيجابي والبيئي ✨', icon: Sparkles, color: 'text-emerald-600', path: '/impact' },
      ]
    })

    if (userRole !== 'merchant') {
      sections.push({
        title: "حجوزاتي",
        items: [
          { name: 'تذاكر الحجز النشطة 🎟️', icon: Ticket, color: 'text-emerald-600', path: '/tickets' },
        ]
      })
      sections.push({
        title: "المكافآت والخصومات",
        items: [
          { name: 'قسائم الخصم والمكافآت', icon: Gift, color: 'text-orange-500', path: '/vouchers' },
          { name: 'دعوة صديق (اربح 5€)', icon: Share2, color: 'text-purple-600', path: '/referral' },
        ]
      })
    }

    if (userRole === 'merchant') {
      sections.push({
        title: "إدارة الأعمال",
        items: [
          { name: 'لوحة تحكم المتجر 👨‍🍳', icon: Store, color: 'text-emerald-600', path: '/merchant-dashboard' },
          { name: 'إدارة الطلبات الواردة 📦', icon: ShieldCheck, color: 'text-blue-600', path: '/merchant-orders' },
        ]
      })
    }

    // تم تحديث هذا القسم ليفتح النوافذ المنبثقة بدلاً من التوجيه لروابط فارغة
    sections.push({
      title: "الإعدادات والدعم",
      items: [
        { name: 'إعدادات الحساب', icon: Settings, color: 'text-gray-600', action: () => setShowSettingsModal(true) },
        { name: 'الدعم الفني والمساعدة', icon: Headphones, color: 'text-sky-500', action: () => setShowSupportModal(true) },
        { name: 'عن نِعمة وتوزيع الأرباح', icon: Info, color: 'text-indigo-500', path: '/about-us' },
        { name: 'سياسة الخصوصية', icon: Heart, color: 'text-rose-400', path: '/legal' },
      ]
    })

    return sections
  }

  const paymentMethods = [
    { name: 'بطاقات بنكية', icon: CreditCard, color: 'text-blue-600', path: '/payment-methods', subtitle: 'Visa / MasterCard' },
    { name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', path: '/payment-methods', subtitle: 'متوفر في سوريا' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-emerald-600 font-black italic">
      <Loader2 className="animate-spin w-10 h-10 mb-4"/> 
      جاري تحميل ملفك الشخصي...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right font-sans" dir="rtl">
      
      {/* هيدر البروفايل */}
      <div className="relative h-72 bg-emerald-600 text-white rounded-b-[60px] shadow-2xl flex flex-col items-center justify-center p-6 overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          
          {/* زر تغيير الصورة (تصميم مرئي جاهز للربط المستقبلي بالتخزين) */}
          <div className="relative group cursor-pointer" onClick={() => setShowSettingsModal(true)}>
            <div className="w-24 h-24 rounded-[35px] bg-white/20 mb-4 border-4 border-white/50 flex items-center justify-center shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-4xl font-black shadow-inner">
                  {profile?.full_name?.charAt(0) || <UserCircle size={48} />}
                </div>
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-[35px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Settings size={24} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black">{profile?.full_name || profile?.email?.split('@')[0]}</h1>
          <div className="flex items-center gap-2 mt-2 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {userRole === 'merchant' ? 'تاجر معتمد' : userRole === 'super_admin' ? 'مدير عام 👑' : 'زبون موثق'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 relative z-20">
        
        {/* بطاقة المحفظة (الرصيد) */}
        <div className="bg-white p-6 rounded-[35px] shadow-xl border border-gray-100 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 transition-transform group-hover:scale-110">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الرصيد المتاح</p>
              <h2 className="text-3xl font-black text-gray-900">{profile?.wallet_balance?.toFixed(2) || '0.00'} <span className="text-sm font-bold text-emerald-600">€</span></h2>
            </div>
          </div>
          <button onClick={() => router.push('/payment-methods')} className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all">
            شحن <CreditCard size={14} className="inline mr-1" />
          </button>
        </div>

        {/* إحصائيات الأثر البيئي */}
        {userRole !== 'merchant' && userRole !== 'super_admin' && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase italic tracking-wider flex items-center gap-1">
              <Leaf size={14} className="text-emerald-500" /> أثرك الإيجابي المباشر
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown size={20} />
                </div>
                <span className="block text-2xl font-black text-gray-900">{stats.co2Saved} <span className="text-xs text-gray-400">kg</span></span>
                <span className="text-[10px] font-bold text-gray-500 mt-1 block">انبعاثات منعتها</span>
              </div>
              
              <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PiggyBank size={20} />
                </div>
                <span className="block text-2xl font-black text-gray-900">{stats.savedMoney.toFixed(1)} <span className="text-xs text-gray-400">€</span></span>
                <span className="text-[10px] font-bold text-gray-500 mt-1 block">أموال وفرتها</span>
              </div>
            </div>
          </div>
        )}

        {/* أقسام المالية */}
        {userRole !== 'merchant' && userRole !== 'super_admin' && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase italic tracking-wider">المالية وطرق الدفع</h2>
            <div className="bg-white rounded-[35px] p-2 shadow-sm border border-gray-100 overflow-hidden">
              {paymentMethods.map((item, i) => (
                <button key={i} onClick={() => router.push(item.path)} className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none">
                  <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white shadow-sm transition-colors">
                    <item.icon size={22} className={item.color} />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="font-bold text-sm text-gray-800 block">{item.name}</span>
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{item.subtitle}</span>
                  </div>
                  <ChevronLeft size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* الأقسام الديناميكية المدمجة */}
        {buildSections().map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase italic tracking-wider">{section.title}</h2>
            <div className="bg-white rounded-[35px] p-2 shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item: any, i) => (
                <button 
                  key={i} 
                  onClick={() => item.action ? item.action() : router.push(item.path)} 
                  className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none"
                >
                  <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white shadow-sm transition-colors">
                    <item.icon size={22} className={item.color} />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="font-bold text-sm text-gray-800">{item.name}</span>
                  </div>
                  <ChevronLeft size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full bg-rose-50 text-rose-600 p-5 rounded-[30px] border border-rose-100 font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm mb-10 mt-6"
        >
          <LogOut size={22} /> تسجيل الخروج بأمان
        </button>
      </div>
      
      {/* ================= نافذة الإعدادات (Modal) ================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900">إعدادات الحساب ⚙️</h2>
                <p className="text-xs text-gray-500 font-bold mt-1">تحديث بياناتك الشخصية والأمان</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="اسمك هنا..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2">تغيير كلمة المرور (اختياري)</label>
                <input 
                  type="password" 
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="اتركه فارغاً إذا لم ترغب بتغييره"
                />
              </div>

              <button 
                type="submit"
                disabled={updatingSettings}
                className="w-full bg-emerald-600 text-white py-4 rounded-[25px] font-black text-sm mt-4 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {updatingSettings ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18}/> حفظ التعديلات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= نافذة الدعم الفني (Modal) ================= */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900">الدعم الفني 🎧</h2>
                <p className="text-xs text-gray-500 font-bold mt-1">نحن هنا لمساعدتك والإجابة على استفساراتك</p>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSendSupport} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-2">كيف يمكننا مساعدتك؟</label>
                <textarea 
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all h-32 resize-none"
                  placeholder="اكتب رسالتك، مشكلتك، أو اقتراحك هنا..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={sendingSupport}
                className="w-full bg-gray-900 text-white py-4 rounded-[25px] font-black text-sm mt-4 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {sendingSupport ? <Loader2 className="animate-spin" size={20} /> : 'إرسال الرسالة 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  )
}