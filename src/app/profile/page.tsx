'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js' // 👈 أضفنا الاتصال
import { 
  UserCircle, Wallet, CreditCard, Ticket, Bell, Gift, 
  Store, Info, Share2, LogOut, ChevronLeft, Star, Heart,
  CircleDollarSign, Landmark, ShieldCheck // 👈 أضفنا أيقونة الدرع
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'

// 👈 إعداد الاتصال بقاعدة البيانات
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdvancedProfilePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null) // 👈 حالة الإيميل

  // 👈 فحص المستخدم عند فتح الصفحة
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? '')
      } else {
        router.replace('/login') // طرد المستخدم غير المسجل
      }
    }
    checkUser()
  }, [])

  // 👈 دالة تسجيل الخروج الحقيقية
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // --- قسم المالية والدفع المطور ---
  const paymentSection = {
    title: "المالية وطرق الدفع",
    items: [
      { name: 'بطاقات بنكية (Visa / MasterCard)', icon: CreditCard, color: 'text-blue-600', path: '/payment/cards', subtitle: 'أوروبا والعالم' },
      { name: 'حساب PayPal الإلكتروني', icon: CircleDollarSign, color: 'text-blue-800', path: '/payment/paypal', subtitle: 'دفع سريع وآمن' },
      { name: 'شام كاش / تحويل محلي', icon: Landmark, color: 'text-emerald-600', path: '/payment/local', subtitle: 'الخدمة المتوفرة في سوريا' },
      { name: 'عملات رقمية (USDT / Crypto)', icon: Wallet, color: 'text-orange-500', path: '/payment/crypto', subtitle: 'دفع لا مركزي سريع' },
    ]
  }

  // --- باقي الأقسام كما هي ---
  const otherSections = [
    {
      title: "المكافآت والخصومات",
      items: [
        { name: 'قسائم الخصم (10 طلبات = هدية)', icon: Ticket, color: 'text-orange-500', path: '/vouchers' },
        { name: 'دعوة صديق (اربح 5€)', icon: Share2, color: 'text-purple-600', path: '/referral' },
      ]
    },
    {
      title: "مركز الإشعارات والإدارة",
      items: [
        { name: 'عروض الإدارة الحصرية 📢', icon: Bell, color: 'text-rose-500', path: '/admin-deals' },
        { name: 'سجل مطعمك (أسبوع مجاني)', icon: Store, color: 'text-emerald-600', path: '/register-restaurant' },
      ]
    },
    {
      title: "عن نِعمة",
      items: [
        { name: 'شرح الشركة وتوزيع الأرباح', icon: Info, color: 'text-gray-600', path: '/about-us' },
        { name: 'سياسة الخصوصية وحقوق الملكية', icon: Heart, color: 'text-rose-400', path: '/legal' },
      ]
    }
  ]

  // إذا لم يتم جلب الإيميل بعد، نعرض شاشة تحميل أنيقة
  if (!userEmail) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-emerald-600 font-black animate-pulse">جاري فحص الحساب...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right font-sans" dir="rtl">
      
      {/* 👈 الهيدر الاحترافي (تم تعديله ليعرض اسم المستخدم) */}
      <div className="relative h-64 bg-emerald-600 text-white rounded-b-[60px] shadow-2xl flex flex-col items-center justify-center p-6 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/20 mb-3 border-4 border-white flex items-center justify-center shadow-inner backdrop-blur-md">
            <UserCircle size={40} className="text-white" />
          </div>
          {/* عرض الجزء الأول من الإيميل كاسم */}
          <h1 className="text-2xl font-black">{userEmail.split('@')[0]}</h1>
          <p className="text-xs font-bold text-emerald-100 flex items-center gap-1 mt-1 justify-center">
            <ShieldCheck size={14} /> حساب موثق
          </p>
        </div>
      </div>

      <div className="px-6 space-y-6 relative z-20">
        
        {/* بطاقة الإحالة السريعة */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-[35px] shadow-xl text-white flex justify-between items-center active:scale-95 transition-all">
          <div className="flex-1 text-right">
            <h3 className="font-black text-lg italic">اربح 5€ مجاناً! 🎁</h3>
            <p className="text-[10px] opacity-80 mt-1">ادعُ 5 أصدقاء واحصل على خصم فوري عند طلبهم الأول</p>
          </div>
          <Share2 size={30} className="opacity-40" />
        </div>

        {/* عرض قسم الدفع المطور */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase tracking-tighter opacity-70 italic">{paymentSection.title}</h2>
          <div className="bg-white rounded-[35px] p-2 shadow-sm border border-gray-100">
            {paymentSection.items.map((item, i) => (
              <button key={i} onClick={() => router.push(item.path)} className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none">
                <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white shadow-sm">
                  <item.icon size={22} className={item.color} />
                </div>
                <div className="flex-1 text-right">
                  <span className="font-bold text-sm text-gray-800 block">{item.name}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{item.subtitle}</span>
                </div>
                <ChevronLeft size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* عرض باقي الأقسام */}
        {otherSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 mr-4 mb-2 uppercase tracking-tighter opacity-70 italic">{section.title}</h2>
            <div className="bg-white rounded-[35px] p-2 shadow-sm border border-gray-100">
              {section.items.map((item, i) => (
                <button key={i} onClick={() => router.push(item.path)} className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 rounded-[25px] transition-all group border-b border-gray-50 last:border-none">
                  <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white shadow-sm">
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

        {/* 👈 زر تسجيل الخروج החقيقي */}
        <button 
          onClick={handleLogout}
          className="w-full bg-rose-50 text-rose-600 p-5 rounded-[30px] border border-rose-100 font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm mb-10"
        >
          <LogOut size={22} /> تسجيل الخروج بأمان
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}