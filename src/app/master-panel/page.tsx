'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldCheck, UserCog, Ban, Search, Loader2, Store, User } from 'lucide-react'

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const updateRole = async (userId: string, newRole: string, userName: string) => {
    // رسالة تأكيد احترافية قبل تغيير الصلاحيات
    const confirmUpdate = window.confirm(`هل أنت متأكد من تغيير صلاحية "${userName}" إلى [${newRole}]؟`)
    if (!confirmUpdate) return

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    
    if (!error) {
      alert(`✅ تم تغيير الصلاحية إلى ${newRole} بنجاح`);
      fetchUsers(); // تحديث القائمة فوراً
    } else {
      alert(`❌ حدث خطأ: ${error.message}`);
    }
  }

  // فلترة المستخدمين بناءً على البحث
  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.includes(search)) || 
    (u.role && u.role.includes(search))
  )

  // دالة مساعدة لتلوين الرتب بشكل احترافي
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
      case 'staff': return 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
      case 'merchant': return 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
      default: return 'bg-slate-700 text-slate-300' // Customer
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans text-right" dir="rtl">
      
      {/* الهيدر وشريط البحث */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center gap-3">
            <ShieldCheck size={36} className="text-emerald-400" /> لوحة التحكم العليا 👑
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-bold">إدارة النظام، الصلاحيات، والمستخدمين ({users.length} مستخدم)</p>
        </div>
        
        <div className="relative w-full md:w-auto">
           <input 
             type="text"
             placeholder="ابحث بالاسم أو الرتبة..." 
             className="bg-slate-900 border border-slate-800 p-3.5 pr-12 rounded-xl text-sm font-bold outline-none w-full md:w-72 text-white focus:border-emerald-500 transition-colors" 
             onChange={(e) => setSearch(e.target.value)} 
           />
           <Search size={20} className="absolute right-4 top-3.5 text-slate-500" />
        </div>
      </div>

      {/* قائمة المستخدمين */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 text-emerald-500">
          <Loader2 className="animate-spin w-12 h-12 mb-4" />
          <span className="font-black tracking-widest text-sm">جاري جلب البيانات...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center bg-slate-900 p-10 rounded-[30px] border border-slate-800 text-slate-500 font-bold">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          لا يوجد مستخدمين يطابقون بحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[30px] flex flex-col md:flex-row md:items-center justify-between shadow-xl hover:border-slate-700 transition-colors gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700 shadow-inner">
                  {user.full_name?.charAt(0) || <User size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-lg">{user.full_name || 'مستخدم بدون اسم'}</h3>
                  <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase mt-1.5 inline-block tracking-wider ${getRoleBadgeColor(user.role || 'customer')}`}>
                    {user.role || 'customer'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => updateRole(user.id, 'staff', user.full_name)} 
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95"
                >
                  <UserCog size={16} /> تعيين موظف
                </button>
                <button 
                  onClick={() => updateRole(user.id, 'merchant', user.full_name)} 
                  className="bg-amber-600 hover:bg-amber-500 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95"
                >
                  <Store size={16} /> تاجر
                </button>
                <button 
                  onClick={() => updateRole(user.id, 'customer', user.full_name)} 
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 text-slate-300"
                >
                  <User size={16} /> زبون
                </button>
                
                {/* زر الحظر (مجهز برمجياً للمستقبل) */}
                <button className="bg-rose-900/50 text-rose-400 p-3 rounded-xl hover:bg-rose-900 hover:text-rose-300 transition-all active:scale-95 border border-rose-900/50">
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