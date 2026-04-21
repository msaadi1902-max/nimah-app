'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, UserCog, Ban, Search, Loader2, Store, 
  User, Users, Shield, Star, Megaphone, ArrowRight, 
  CheckCircle, Activity, Crown, AlertTriangle 
} from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MasterPanel() {
  const router = useRouter()
  
  // 👑 تبويبات اللوحة العليا الثلاثية
  const [activeTab, setActiveTab] = useState<'merchants' | 'users' | 'ads'>('merchants')
  
  // حالات البيانات
  const [users, setUsers] = useState<any[]>([])
  const [allMeals, setAllMeals] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    checkAdminAndFetchData() 
  }, [])

  const checkAdminAndFetchData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return router.replace('/admin-login')

      // التحقق الصارم من الصلاحيات (حارس البوابة)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'super_admin') {
        alert('🚫 تم منع الوصول: هذه اللوحة مخصصة للقيادة العليا فقط.')
        return router.replace('/')
      }

      // جلب جميع المستخدمين
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (usersData) setUsers(usersData)

      // جلب جميع العروض لإدارة الإعلانات
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*, profiles:merchant_id(shop_name)')
        .order('created_at', { ascending: false })
      if (mealsData) setAllMeals(mealsData)

    } catch (error: any) {
      console.error("Error fetching master data:", error.message)
    } finally {
      setLoading(false)
    }
  }

  // === 1. إدارة حالات الحسابات (نشط / معلق / محظور) ===
  const updateStatus = async (userId: string, newStatus: string, userName: string) => {
    const actionName = newStatus === 'active' ? 'تفعيل' : newStatus === 'blocked' ? 'حظر' : 'تعليق';
    if (!window.confirm(`⚠️ تأكيد أمني: هل أنت متأكد من ${actionName} حساب "${userName}"؟`)) return

    try {
      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
      if (error) throw error
      alert(`✅ تم ${actionName} الحساب بنجاح!`);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  // === 2. إدارة الصلاحيات (موظف / زبون) ===
  const updateRole = async (userId: string, newRole: string, userName: string) => {
    if (!window.confirm(`⚠️ تأكيد إداري: تغيير صلاحية "${userName}" إلى [${newRole}]؟`)) return

    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) throw error
      alert(`✅ تم تعيين الصلاحية الجديدة بنجاح`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  // === 3. توثيق التجار (ميزة VIP المخصصة لك) ===
  const toggleTrusted = async (userId: string, currentStatus: boolean, userName: string) => {
    const newStatus = !currentStatus
    const actionText = newStatus ? 'منح شارة التوثيق' : 'سحب شارة التوثيق'
    
    if (!window.confirm(`هل أنت متأكد من ${actionText} للتاجر "${userName}"؟`)) return

    try {
      const { error } = await supabase.from('profiles').update({ is_trusted: newStatus }).eq('id', userId)
      if (error) throw error
      alert(`✅ تم التحديث بنجاح`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_trusted: newStatus } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  // === 4. إدارة الإعلانات في الصفحة الرئيسية ===
  const toggleSponsored = async (mealId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('meals').update({ is_sponsored: !currentStatus }).eq('id', mealId)
      if (error) throw error
      setAllMeals(allMeals.map(m => m.id === mealId ? { ...m, is_sponsored: !currentStatus } : m))
      alert(currentStatus ? '📉 تم سحب العرض من الصفحة الرئيسية' : '🚀 تم رفع العرض كإعلان ممول في الرئيسية!')
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    }
  }

  // === الفلاتر الديناميكية ===
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.includes(search)) || 
    (u.shop_name && u.shop_name.includes(search)) ||
    (u.role && u.role.includes(search))
  )
  
  const merchantsList = filteredUsers.filter(u => u.role === 'merchant')
  const generalUsersList = filteredUsers.filter(u => u.role !== 'merchant')
  
  const filteredMeals = allMeals.filter(m => 
    (m.name && m.name.includes(search)) || 
    (m.profiles?.shop_name && m.profiles.shop_name.includes(search))
  )

  // إحصائيات النظام
  const stats = {
    total: users.length,
    merchants: users.filter(u => u.role === 'merchant').length,
    trustedMerchants: users.filter(u => u.role === 'merchant' && u.is_trusted).length,
    staff: users.filter(u => u.role === 'staff' || u.role === 'super_admin').length,
    pendingMerchants: users.filter(u => u.role === 'merchant' && u.status === 'pending').length,
    sponsoredMeals: allMeals.filter(m => m.is_sponsored).length
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'super_admin': return <span className="bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-md font-black text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.4)]">مدير عام 👑</span>
      case 'staff': return <span className="bg-blue-500 text-white px-2 py-0.5 rounded-md font-black text-[10px] shadow-[0_0_10px_rgba(59,130,246,0.4)]">موظف 🛡️</span>
      case 'merchant': return <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded-md font-black text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.4)]">تاجر 🏪</span>
      default: return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-black text-[10px]">زبون 👤</span> 
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-emerald-500"><Loader2 className="animate-spin w-12 h-12 mb-4" /><p className="font-black tracking-widest text-sm animate-pulse">جاري تحميل البيانات...</p></div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans text-right pb-28" dir="rtl">
      
      {/* 👑 الهيدر الإمبراطوري */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-slate-900/40 p-6 rounded-[30px] border border-slate-800 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center gap-3">
            <ShieldCheck size={40} className="text-emerald-400" /> القيادة العليا
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-bold tracking-widest uppercase">NIMAH MASTER CONTROL PANEL</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <button onClick={() => router.push('/')} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-black text-xs transition-all flex items-center gap-2 border border-slate-700">
            مغادرة اللوحة <ArrowRight size={16}/>
          </button>
        </div>
      </div>

      {/* 📊 الإحصائيات الشاملة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
          <div className="bg-slate-800 p-3 rounded-xl text-blue-400"><Users size={24}/></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">إجمالي المستخدمين</p><p className="text-2xl font-black">{stats.total}</p></div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-colors">
          <div className="bg-slate-800 p-3 rounded-xl text-amber-400 relative">
            <Store size={24}/>
            {stats.pendingMerchants > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
          </div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">التجار</p><p className="text-2xl font-black">{stats.merchants} <span className="text-[10px] text-yellow-500">({stats.pendingMerchants} بانتظار التفعيل)</span></p></div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
          <div className="bg-slate-800 p-3 rounded-xl text-emerald-400"><Shield size={24}/></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">فريق الموظفين</p><p className="text-2xl font-black">{stats.staff}</p></div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-rose-500/30 transition-colors">
          <div className="bg-slate-800 p-3 rounded-xl text-rose-400"><Megaphone size={24}/></div>
          <div><p className="text-[10px] text-slate-400 font-bold uppercase">إعلانات الرئيسية</p><p className="text-2xl font-black text-rose-400">{stats.sponsoredMeals}</p></div>
        </div>
      </div>

      {/* 🧭 تبويبات التنقل الذكية */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex flex-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button onClick={() => setActiveTab('merchants')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'merchants' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>
            <Store size={16} /> ملفات التجار
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'users' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}>
            <Users size={16} /> الزبائن والموظفين
          </button>
          <button onClick={() => setActiveTab('ads')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'ads' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}>
            <Megaphone size={16} /> لوحة الإعلانات
          </button>
        </div>
        
        {/* شريط البحث المدمج */}
        <div className="relative w-full md:w-72">
          <input 
            type="text"
            placeholder="ابحث عن اسم، متجر، أو عرض..." 
            className="bg-slate-900 border border-slate-800 p-4 pr-12 rounded-2xl text-xs font-bold outline-none w-full text-white focus:border-emerald-500 transition-colors shadow-inner h-full" 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* =================== 1. تبويب التجار =================== */}
      {activeTab === 'merchants' && (
        <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4">
          {merchantsList.length === 0 ? (
            <div className="text-center bg-slate-900/50 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold">لا يوجد تجار مسجلين.</div>
          ) : (
            merchantsList.map(merchant => (
              <div key={merchant.id} className={`bg-slate-900 border ${merchant.status === 'pending' ? 'border-amber-500/30 bg-amber-900/5' : 'border-slate-800'} p-5 rounded-[25px] flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-emerald-500/30 transition-colors`}>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700 flex-shrink-0 relative">
                    {merchant.shop_name?.charAt(0) || <Store size={24} />}
                    {merchant.status === 'pending' && <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 p-1 rounded-full"><AlertTriangle size={12}/></span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg">{merchant.shop_name || merchant.full_name || 'متجر بدون اسم'}</h3>
                      {/* 👑 الحل الجذري والاحترافي للـ Star Error يكمن في إحاطتها بعنصر span */}
                      {merchant.is_trusted && <span title="تاجر موثوق VIP" className="inline-flex"><Star size={16} className="text-yellow-400 fill-yellow-400" /></span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">{merchant.email} | {merchant.phone || 'لا يوجد رقم'}</p>
                    <div className="flex gap-2 items-center mt-2">
                      {getRoleBadge(merchant.role)}
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase ${merchant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : merchant.status === 'blocked' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
                        {merchant.status === 'active' ? 'حساب مفعل ✅' : merchant.status === 'blocked' ? 'حساب محظور 🚫' : 'بانتظار الموافقة ⏳'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {merchant.status !== 'active' && (
                    <button onClick={() => updateStatus(merchant.id, 'active', merchant.shop_name)} className="px-4 py-2.5 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all border border-emerald-600/20">
                      <CheckCircle size={14} /> تفعيل المتجر
                    </button>
                  )}
                  {merchant.status !== 'blocked' && (
                    <button onClick={() => updateStatus(merchant.id, 'blocked', merchant.shop_name)} className="px-4 py-2.5 bg-rose-900/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all border border-rose-900/30">
                      <Ban size={14} /> حظر
                    </button>
                  )}
                  {merchant.status === 'active' && (
                    <button onClick={() => updateStatus(merchant.id, 'pending', merchant.shop_name)} className="px-3 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all">
                      <Activity size={14} /> تعليق مؤقت
                    </button>
                  )}

                  <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div> 

                  {/* زر التوثيق VIP */}
                  <button 
                    onClick={() => toggleTrusted(merchant.id, merchant.is_trusted, merchant.shop_name)} 
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all border ${merchant.is_trusted ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-slate-900' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'}`}
                  >
                    <Crown size={14} /> {merchant.is_trusted ? 'سحب توثيق VIP' : 'منح توثيق VIP'}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* =================== 2. تبويب الزبائن والموظفين =================== */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4">
          {generalUsersList.length === 0 ? (
            <div className="text-center bg-slate-900/50 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold">لا يوجد مستخدمين يطابقون بحثك.</div>
          ) : (
            generalUsersList.map(user => (
              <div key={user.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[25px] flex flex-col md:flex-row md:items-center justify-between hover:border-slate-700 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 ${user.role === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-white">{user.full_name || 'مستخدم غير معروف'}</h3>
                      {/* حل خطأ النجمة للزبائن الموثوقين إن وجدوا */}
                      {user.is_trusted && <span title="مستخدم موثوق" className="inline-flex"><Star size={14} className="text-yellow-400 fill-yellow-400 animate-in zoom-in" /></span>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      {user.status === 'blocked' && <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md font-black text-[9px]">محظور 🚫</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {user.role !== 'super_admin' && (
                    <>
                      {user.role !== 'staff' && (
                        <button onClick={() => updateRole(user.id, 'staff', user.full_name)} className="px-3 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black border border-blue-600/20 flex items-center gap-1 transition-all">
                          <UserCog size={14}/> ترقية لموظف
                        </button>
                      )}
                      {user.role === 'staff' && (
                        <button onClick={() => updateRole(user.id, 'customer', user.full_name)} className="px-3 py-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl text-xs font-black transition-all">
                          سحب الصلاحية
                        </button>
                      )}
                      <button onClick={() => updateStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked', user.full_name)} className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${user.status === 'blocked' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white' : 'bg-rose-900/20 text-rose-500 border-rose-900/30 hover:bg-rose-600 hover:text-white'}`}>
                        <Ban size={14} className="inline mr-1"/> {user.status === 'blocked' ? 'فك الحظر' : 'حظر الحساب'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =================== 3. تبويب الإعلانات الممولة (Ads) =================== */}
      {activeTab === 'ads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4">
          {filteredMeals.length === 0 ? (
            <div className="col-span-full text-center bg-slate-900/50 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold">
              <Megaphone size={48} className="mx-auto mb-4 opacity-30" /> لا توجد عروض منشورة للتحكم بها.
            </div>
          ) : (
            filteredMeals.map(meal => (
              <div key={meal.id} className={`bg-slate-900 border ${meal.is_sponsored ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-800'} p-4 rounded-[25px] flex flex-col gap-4 hover:border-slate-700 transition-all`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 relative">
                    <img src={meal.image_url} className="w-full h-full object-cover" alt={meal.name} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-sm text-white line-clamp-1">{meal.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                      <Store size={10} className="text-emerald-500"/> {meal.profiles?.shop_name || 'تاجر'}
                    </p>
                    <p className="text-[10px] font-black text-emerald-400 mt-1">{meal.discounted_price} {meal.currency}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleSponsored(meal.id, meal.is_sponsored)}
                  className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    meal.is_sponsored 
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' 
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Megaphone size={16} className={meal.is_sponsored ? 'text-slate-900' : 'text-amber-500'} />
                  {meal.is_sponsored ? 'إعلان نشط في الرئيسية ✅' : 'تثبيت كإعلان في الرئيسية 🚀'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}