'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  UserCircle, Wallet, CreditCard, Ticket, Bell, Gift, 
  Store, Info, Share2, LogOut, ChevronLeft, Heart,
  Landmark, ShieldCheck, Loader2, Sparkles, Settings,
  Leaf, TrendingDown, PiggyBank, Headphones, X, CheckCircle,
  History, ArrowRightLeft, BellRing
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

  // === حالات النوافذ المنبثقة ===
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  
  // === حالات نموذج الإعدادات ===
  const [editName, setEditName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [updatingSettings, setUpdatingSettings] = useState(false)

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
        setEditName(profileData.full_name || '') 

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

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingSettings(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("مستخدم غير مسجل")

      if (editName !== profile?.full_name) {
        await supabase.from('profiles').update({ full_name: editName }).eq('id', user.id)
      }

      if (editPassword.trim().length > 0) {
        const { error } = await supabase.auth.updateUser({ password: editPassword })
        if (error) throw error
      }

      alert('✅ تم تحديث إعداداتك بنجاح!')
      setShowSettingsModal(false)
      fetchUserData() 
      setEditPassword('') 
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
    
    setTimeout(() => {
      alert('✅ تم إرسال رسالتك لفريق الدعم بنجاح. سنرد عليك قريباً!')
      setSupportMessage('')
      setShowSupportModal(false)
      setSendingSupport(false)
    }, 1500)
  }

  const buildSections = () => {
    const sections = []

    sections.push({
      title: "المحفظة والعمليات",
      items: [
        { name: 'المحفظة وسجل الشحن', icon: ArrowRightLeft, color: 'text-emerald-500', path: '/wallet' },
      ]
    })

    if (userRole !== 'merchant') {
      sections.push({
        title: "طلباتي وحجوزاتي",
        items: [
          { name: 'تذاكر الحجز النشطة 🎟️', icon: Ticket, color: 'text-rose-500', path: '/tickets' },
          { name: 'سجل المشتريات السابق', icon: History, color: 'text-blue-500', path: '/order-history' },
        ]
      })
      sections.push({
        title: "المكافآت والخصومات",
        items: [
          { name: 'قسائم الخصم والمكافآت', icon: Gift, color: 'text-amber-500', path: '/vouchers' },
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

    sections.push({
      title: "الإعدادات والدعم",
      items: [
        { name: 'إعدادات الحساب والأمان', icon: Settings, color: 'text-gray-700', action: () => setShowSettingsModal(true) },
        { name: 'الدعم الفني والمساعدة', icon: Headphones, color: 'text-sky-500', action: () => setShowSupportModal(true) },
        { name: 'عن نِعمة وتوزيع الأرباح', icon: Info, color: 'text-indigo-500', path: '/about-us' },
        { name: 'سياسة الخصوصية', icon: Heart, color: 'text-rose-400', path: '/legal' },
      ]
    })

    return sections
  }

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
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
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
          <p className="text-emerald-100 text-xs font-bold mt-1 opacity-80">{profile?.email}</p>
          
          <div className="flex items-center gap-2 mt-3 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {userRole === 'merchant' ? 'تاجر معتمد' : userRole === 'super_admin' ? 'مدير عام 👑' : 'زبون موثق'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 relative z-20">
        
        {/* 💳 بطاقة المحفظة الرقمية (تصميم Tier-1) */}
        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 p-6 rounded-[35px] shadow-2xl relative overflow-hidden text-white flex items-center justify-between group">
          {/* تأثيرات لمعان البطاقة */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
              <Wallet size={28} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-200/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                رصيد المحفظة <CheckCircle size={10} className="text-emerald-400" />
              </p>
              <h2 className="text-3xl font-black tracking-tight">{profile?.wallet_balance?.toFixed(2) || '0.00'} <span className="text-sm font-bold text-emerald-400">{profile?.currency || '€'}</span></h2>
            </div>
          </div>
          <button onClick={() => router.push('/wallet')} className="relative z-10 bg-white text-emerald-900 px-5 py-3.5 rounded-2xl text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center gap-2 hover:bg-emerald-50">
            شحن <CreditCard size={14} />
          </button>
        </div>

        {/* إحصائيات الأثر البيئي */}
        {userRole !== 'merchant' && userRole !== 'super_admin' && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase italic tracking-wider flex items-center gap-1">
              <Leaf size={14} className="text-emerald-500" /> أثرك الإيجابي المباشر
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown size={20} />
                </div>
                <span className="block text-2xl font-black text-gray-900">{stats.co2Saved} <span className="text-xs text-gray-400">kg</span></span>
                <span className="text-[10px] font-bold text-gray-500 mt-1 block">انبعاثات منعتها</span>
              </div>
              
              <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PiggyBank size={20} />
                </div>
                <span className="block text-2xl font-black text-gray-900">{stats.savedMoney.toFixed(1)} <span className="text-xs text-gray-400">€</span></span>
                <span className="text-[10px] font-bold text-gray-500 mt-1 block">أموال وفرتها</span>
              </div>
            </div>
          </div>
        )}

        {/* الأقسام الديناميكية */}
        {buildSections().map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase italic tracking-wider">{section.title}</h2>
            <div className="bg-white rounded-[35px] p-2 shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item: any, i) => (
                <button 
                  key={i} 
                  onClick={() => item.action ? item.action() : router.push(item.path)} 
                  className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50/50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none"
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

        {/* زر تسجيل الخروج */}
        <button 
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 p-5 rounded-[30px] border border-rose-100 font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm mb-10 mt-6"
        >
          <LogOut size={22} /> تسجيل الخروج بأمان
        </button>
      </div>
      
      {/* ================= نافذة الإعدادات (Modal) ================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
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

              {/* تحكم الإشعارات السريع */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><BellRing size={18}/></div>
                  <div>
                    <span className="block text-sm font-black text-gray-900">تنبيهات العروض</span>
                    <span className="block text-[10px] font-bold text-gray-400">احصل على إشعار عند توفر وجبات</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notificationsEnabled ? 'left-1' : 'right-1'}`}></div>
                </button>
              </div>

              <button 
                type="submit"
                disabled={updatingSettings}
                className="w-full bg-emerald-600 text-white py-4 rounded-[25px] font-black text-sm mt-6 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {updatingSettings ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18}/> حفظ التعديلات</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= نافذة الدعم الفني (Modal) ================= */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-end animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all h-32 resize-none shadow-inner"
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