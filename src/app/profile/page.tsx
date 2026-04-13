'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  UserCircle, Wallet, CreditCard, Ticket, Bell, Gift, 
  Store, Info, Share2, LogOut, ChevronLeft, Heart,
  Landmark, ShieldCheck, Loader2, Sparkles, Settings
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdvancedProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      }
    } else {
      router.replace('/welcome') 
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('user_role')
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/welcome')
  }

  // بناء الأقسام ديناميكياً بناءً على الصلاحيات
  const buildSections = () => {
    const sections = []

    // 1. قسم التأثير (للجميع)
    sections.push({
      title: "تأثيرك المجتمعي",
      items: [
        { name: 'أثري الإيجابي والبيئي ✨', icon: Sparkles, color: 'text-emerald-600', path: '/impact' },
      ]
    })

    // 2. ميزات الزبون فقط
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

    // 3. ميزات التاجر فقط
    if (userRole === 'merchant') {
      sections.push({
        title: "إدارة الأعمال",
        items: [
          { name: 'لوحة تحكم المتجر 👨‍🍳', icon: Store, color: 'text-emerald-600', path: '/merchant' },
          { name: 'إدارة الطلبات الواردة 📦', icon: ShieldCheck, color: 'text-blue-600', path: '/merchant-orders' },
        ]
      })
    }

    // 4. إعدادات عامة
    sections.push({
      title: "الإعدادات والدعم",
      items: [
        { name: 'إعدادات الحساب', icon: Settings, color: 'text-gray-600', path: '/settings' },
        { name: 'عن نِعمة وتوزيع الأرباح', icon: Info, color: 'text-indigo-500', path: '/about-us' },
        { name: 'سياسة الخصوصية', icon: Heart, color: 'text-rose-400', path: '/legal' },
      ]
    })

    return sections
  }

  const paymentMethods = [
    { name: 'بطاقات بنكية', icon: CreditCard, color: 'text-blue-600', path: '/payment/cards', subtitle: 'Visa / MasterCard' },
    { name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', path: '/payment/local', subtitle: 'متوفر في سوريا' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-emerald-600 font-black italic">
      <Loader2 className="animate-spin w-10 h-10 mb-4"/> 
      جاري تحميل ملفك الشخصي...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-right font-sans" dir="rtl">
      
      {/* هيدر البروفايل المطور */}
      <div className="relative h-72 bg-emerald-600 text-white rounded-b-[60px] shadow-2xl flex flex-col items-center justify-center p-6 overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-[35px] bg-white/20 mb-4 border-4 border-white/50 flex items-center justify-center shadow-2xl backdrop-blur-md">
             <div className="w-full h-full bg-emerald-50 rounded-[30px] flex items-center justify-center text-emerald-600 text-3xl font-black shadow-inner">
               {profile?.full_name?.charAt(0) || <UserCircle size={48} />}
             </div>
          </div>
          <h1 className="text-2xl font-black">{profile?.full_name || profile?.email?.split('@')[0]}</h1>
          <div className="flex items-center gap-2 mt-2 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {userRole === 'merchant' ? 'تاجر معتمد' : 'زبون موثق'}
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
          <button onClick={() => router.push('/payment/local')} className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all">
            شحن <CreditCard size={14} className="inline mr-1" />
          </button>
        </div>

        {/* أقسام المالية (تظهر للزبائن) */}
        {userRole !== 'merchant' && (
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
              {section.items.map((item, i) => (
                <button key={i} onClick={() => router.push(item.path)} className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none">
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
          className="w-full bg-rose-50 text-rose-600 p-5 rounded-[30px] border border-rose-100 font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm mb-10 mt-6"
        >
          <LogOut size={22} /> تسجيل الخروج بأمان
        </button>
      </div>
      
      <BottomNav activeTab="profile" />
    </div>
  )
}