'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldCheck, UserCog, Ban, Search, Loader2, Store, User, Users, Shield } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MasterPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchUsers() 
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setUsers(data)
    } catch (error: any) {
      console.error("Error fetching users:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId: string, newRole: string, userName: string) => {
    const confirmUpdate = window.confirm(`هل أنت متأكد من تغيير صلاحية "${userName}" إلى [${newRole}]؟`)
    if (!confirmUpdate) return

    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) throw error
      
      alert(`✅ تم تغيير الصلاحية إلى ${newRole} بنجاح`);
      // تحديث الواجهة فوراً بدون إعادة تحميل من السيرفر
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.includes(search)) || 
    (u.role && u.role.includes(search))
  )

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
      case 'staff': return 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
      case 'merchant': return 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      default: return 'bg-slate-700 text-slate-300' 
    }
  }

  // حساب الإحصائيات ديناميكياً
  const stats = {
    total: users.length,
    merchants: users.filter(u => u.role === 'merchant').length,
    staff: users.filter(u => u.role === 'staff' || u.role === 'super_admin').length,
    customers: users.filter(u => !u.role || u.role === 'customer').length
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans text-right" dir="rtl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center gap-3">
            <ShieldCheck size={36} className="text-emerald-400" /> الإدارة العليا 👑
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-bold">التحكم الكامل في حسابات النظام وصلاحيات الوصول</p>
        </div>
        
        <div className="relative w-full md:w-auto">
           <input 
             type="text"
             placeholder="ابحث بالاسم أو الرتبة..." 
             className="bg-slate-900 border border-slate-800 p-4 pr-12 rounded-2xl text-sm font-bold outline-none w-full md:w-80 text-white focus:border-emerald-500 transition-colors shadow-inner" 
             onChange={(e) => setSearch(e.target.value)} 
           />
           <Search size={20} className="absolute right-4 top-4 text-slate-500" />
        </div>
      </div>

      {/* شريط الإحصائيات السريع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-emerald-400"><Users size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">الإجمالي</p><p className="text-xl font-black">{stats.total}</p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-amber-400"><Store size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">التجار</p><p className="text-xl font-black">{stats.merchants}</p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-slate-300"><User size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">الزبائن</p><p className="text-xl font-black">{stats.customers}</p></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-xl text-blue-400"><Shield size={24}/></div>
          <div><p className="text-xs text-slate-400 font-bold">الإدارة والموظفين</p><p className="text-xl font-black">{stats.staff}</p></div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 text-emerald-500">
          <Loader2 className="animate-spin w-12 h-12 mb-4" />
          <span className="font-black tracking-widest text-sm">جاري جلب البيانات...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center bg-slate-900 p-12 rounded-[30px] border border-slate-800 text-slate-500 font-bold animate-in fade-in">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          لا يوجد مستخدمين يطابقون بحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[25px] flex flex-col xl:flex-row xl:items-center justify-between hover:border-slate-700 transition-colors gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700 shadow-inner flex-shrink-0">
                  {user.full_name?.charAt(0) || <User size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-lg">{user.full_name || 'مستخدم بدون اسم'}</h3>
                  <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase mt-1 inline-block tracking-wider ${getRoleBadgeColor(user.role || 'customer')}`}>
                    {user.role || 'customer'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateRole(user.id, 'staff', user.full_name)} className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border border-blue-600/20">
                  <UserCog size={16} /> تعيين موظف
                </button>
                <button onClick={() => updateRole(user.id, 'merchant', user.full_name)} className="bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-slate-900 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border border-amber-600/20">
                  <Store size={16} /> ترقية لتاجر
                </button>
                <button onClick={() => updateRole(user.id, 'customer', user.full_name)} className="bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 text-slate-300">
                  <User size={16} /> زبون عادي
                </button>
                <button className="bg-rose-900/20 text-rose-500 p-3 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-900/30 ml-auto">
                  <Ban size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}