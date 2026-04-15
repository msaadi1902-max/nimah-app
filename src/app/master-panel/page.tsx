'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ShieldCheck, UserCog, Ban, CheckCircle, Trash2, Search } from 'lucide-react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function MasterPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      alert(`تم تغيير الصلاحية إلى ${newRole} بنجاح ✅`);
      fetchUsers();
    }
  }

  const filteredUsers = users.filter(u => u.full_name?.includes(search) || u.role?.includes(search))

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">لوحة التحكم العليا - المدير العام 👑</h1>
        <div className="relative">
           <input placeholder="ابحث عن مستخدم..." className="bg-slate-900 border border-slate-800 p-3 pr-10 rounded-xl text-sm outline-none w-64" onChange={(e) => setSearch(e.target.value)} />
           <Search size={18} className="absolute right-3 top-3.5 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[30px] flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black">{user.full_name?.charAt(0) || 'U'}</div>
              <div>
                <h3 className="font-black text-lg">{user.full_name || 'بدون اسم'}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase ${user.role === 'super_admin' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => updateRole(user.id, 'staff')} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-xs font-black flex items-center gap-2">
                <UserCog size={16} /> تعيين موظف
              </button>
              <button onClick={() => updateRole(user.id, 'merchant')} className="bg-orange-600 hover:bg-orange-500 p-3 rounded-xl text-xs font-black">تاجر</button>
              <button onClick={() => updateRole(user.id, 'customer')} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl text-xs font-black">زبون</button>
              <button className="bg-rose-900 text-rose-300 p-3 rounded-xl hover:bg-rose-800 transition-colors"><Ban size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}