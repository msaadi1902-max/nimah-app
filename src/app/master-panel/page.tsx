'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, UserCog, Ban, Search, Loader2, Store, 
  User, Users, Shield, Star, Megaphone, ArrowRight, 
  LayoutDashboard, Utensils 
} from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MasterPanel() {
  const router = useRouter()
  
  // 👑 تبويبات اللوحة العليا
  const [activeTab, setActiveTab] = useState<'users' | 'ads'>('users')
  
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

      // التحقق من الصلاحيات العليا
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'super_admin') {
        alert('🚫 صلاحيات غير كافية للوصول للوحة الإدارة العليا')
        return router.replace('/')
      }

      // جلب المستخدمين
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

  // === 1. إدارة المستخدمين والصلاحيات ===
  const updateRole = async (userId: string, newRole: string, userName: string) => {
    const confirmUpdate = window.confirm(`هل أنت متأكد من تغيير صلاحية "${userName}" إلى [${newRole}]؟`)
    if (!confirmUpdate) return

    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) throw error
      
      alert(`✅ تم تغيير الصلاحية إلى ${newRole} بنجاح`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  const toggleTrusted = async (userId: string, currentStatus: boolean, userName: string) => {
    const newStatus = !currentStatus
    const actionText = newStatus ? 'توثيق' : 'إلغاء توثيق'
    
    const confirmUpdate = window.confirm(`هل أنت متأكد من ${actionText} حساب التاجر "${userName}" كتاجر موثوق؟`)
    if (!confirmUpdate) return

    try {
      const { error } = await supabase.from('profiles').update({ is_trusted: newStatus }).eq('id', userId)
      if (error) throw error
      
      alert(`✅ تم ${actionText} الحساب بنجاح`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_trusted: newStatus } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  // === 2. إدارة الإعلانات الممولة (الرئيسية) ===
  const toggleSponsored = async (mealId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('meals')
        .update({ is_sponsored: !currentStatus })
        .eq('id', mealId)
      
      if (error) throw error
      
      setAllMeals(allMeals.map(m => m.id === mealId ? { ...m, is_sponsored: !currentStatus } : m))
      alert(currentStatus ? 'تم إزالة العرض من الصفحة الرئيسية' : '✅ تم تعيين العرض كإعلان ممول في الرئيسية')
    } catch (err: any) {
      alert('خطأ: ' + err.message)
    }
  }

  // === الفلاتر والإحصائيات ===
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.includes(search)) || 
    (u.role && u.role.includes(search))
  )

  const filteredMeals = allMeals.filter(m => 
    (m.name && m.name.includes(search)) || 
    (m.profiles?.shop_name && m.profiles.shop_name.includes(search))
  )

  const stats = {
    total: users.length,
    merchants: users.filter(u => u.role === 'merchant').length,
    trustedMerchants: users.filter(u => u.role === 'merchant' && u.is_trusted).length,
    staff: users.filter(u => u.role === 'staff' || u.role === 'super_admin').length,
    customers: users.filter(u => !u.role || u.role === 'customer').length,
    meals: allMeals.length,
    sponsoredMeals: allMeals.filter(m => m.is_sponsored).length
  }

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
      case 'staff': return 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
      case 'merchant': return 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      default: return 'bg-slate-700 text-slate-300' 
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans text-right pb-28" dir="rtl">
      
      {/* الهيدر المطور */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center gap-3">
            <ShieldCheck size={36} className="text-emerald-400" /> الإدارة العليا 👑
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-bold">التحكم الكامل في حسابات النظام والإعلانات الممولة</p>
        </div>
        <button onClick={() => router.push('/profile')} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 active:scale-95 hover:text-white transition-colors">
          <ArrowRight size={20}/>
        </button>
      </div>

      {/* تبويبات التنقل */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl mb-8 border border-slate-800">
        <button 
          onClick={() => setActiveTab('users')} 
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'users' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Users size={18} /> إدارة المستخدمين
        </button>
        <button 
          onClick={() => setActiveTab('ads')} 
          className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'ads' ? 'bg-slate-800 text-amber-400 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Megaphone size={18} /> إدارة الإعلانات (الرئيسية)
        </button>
      </div>

      {/* الإحصائيات الشاملة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-blue-400"><Users size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">إجمالي المستخدمين</p><p className="text-xl font-black">{stats.total}</p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-amber-400 relative">
            <Store size={24}/>
            {stats.trustedMerchants > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
          </div>
          <div><p className="text-xs text-slate-400 font-bold">التجار</p><p className="text-xl font-black">{stats.merchants} <span className="text-[10px] text-yellow-500 font-bold">({stats.trustedMerchants} موثوق)</span></p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-emerald-400"><Shield size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">فريق العمل</p><p className="text-xl font-black">{stats.staff}</p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-rose-400"><Utensils size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">إجمالي العروض</p><p className="text-xl font-black">{stats.meals} <span className="text-[10px] text-rose-400 font-bold">({stats.sponsoredMeals} إعلان)</span></p></div>
        </div>
      </div>

      {/* شريط البحث الموحد */}
      <div className="relative w-full mb-6">
        <input 
          type="text"
          placeholder={activeTab === 'users' ? "ابحث بالاسم أو الرتبة..." : "ابحث عن اسم العرض أو المتجر..."} 
          className="bg-slate-900 border border-slate-800 p-4 pr-12 rounded-2xl text-sm font-bold outline-none w-full text-white focus:border-emerald-500 transition-colors shadow-inner" 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <Search size={20} className="absolute right-4 top-4 text-slate-500" />
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 text-emerald-500">
          <Loader2 className="animate-spin w-12 h-12 mb-4" />
          <span className="font-black tracking-widest text-sm">جاري جلب البيانات...</span>
        </div>
      ) : activeTab === 'users' ? (
        /* =================== تبويب المستخدمين =================== */
        filteredUsers.length === 0 ? (
          <div className="text-center bg-slate-900 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold animate-in fade-in">
            <Search size={48} className="mx-auto mb-4 opacity-30" /> لا يوجد مستخدمين يطابقون بحثك.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[25px] flex flex-col xl:flex-row xl:items-center justify-between hover:border-slate-700 transition-colors gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700 shadow-inner flex-shrink-0">
                    {user.full_name?.charAt(0) || <User size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg">{user.full_name || 'مستخدم بدون اسم'}</h3>
                      {user.is_trusted && <Star size={16} className="text-yellow-400 fill-yellow-400 animate-in zoom-in" />}
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-wider ${getRoleBadgeColor(user.role || 'customer')}`}>
                        {user.role || 'customer'}
                      </span>
                      {user.is_trusted && (
                        <span className="text-[10px] px-3 py-1 rounded-lg font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          تاجر موثوق 👑
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {user.role === 'merchant' && (
                    <button 
                      onClick={() => toggleTrusted(user.id, user.is_trusted, user.full_name)} 
                      className={`px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border ${user.is_trusted ? 'bg-rose-900/20 text-rose-500 border-rose-900/30 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-white'}`}
                    >
                      <ShieldCheck size={16} /> {user.is_trusted ? 'سحب التوثيق' : 'توثيق التاجر'}
                    </button>
                  )}
                  <button onClick={() => updateRole(user.id, 'staff', user.full_name)} className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border border-blue-600/20">
                    <UserCog size={16} /> تعيين موظف
                  </button>
                  <button onClick={() => updateRole(user.id, 'merchant', user.full_name)} className="bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-slate-900 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border border-amber-600/20">
                    <Store size={16} /> ترقية لتاجر
                  </button>
                  <button onClick={() => updateRole(user.id, 'customer', user.full_name)} className="bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 text-slate-300">
                    <User size={16} /> زبون عادي
                  </button>
                  <button className="bg-rose-900/20 text-rose-500 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-900/30 ml-auto md:ml-0">
                    <Ban size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      ) : (
        /* =================== تبويب الإعلانات الممولة =================== */
        filteredMeals.length === 0 ? (
          <div className="text-center bg-slate-900 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold animate-in fade-in">
            <Megaphone size={48} className="mx-auto mb-4 opacity-30" /> لا توجد عروض تطابق بحثك.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
            {filteredMeals.map(meal => (
              <div key={meal.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[25px] flex items-center justify-between hover:border-slate-700 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                    <img src={meal.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white line-clamp-1">{meal.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                      <Store size={10}/> {meal.profiles?.shop_name || 'تاجر معتمد'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleSponsored(meal.id, meal.is_sponsored)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 flex-shrink-0 ${
                    meal.is_sponsored 
                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 active:scale-95' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white active:scale-95'
                  }`}
                >
                  <Megaphone size={14} className={meal.is_sponsored ? 'text-slate-900' : 'text-amber-400'} />
                  {meal.is_sponsored ? 'إعلان نشط ✅' : 'ترويج للإعلان'}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}