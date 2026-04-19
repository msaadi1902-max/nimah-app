'use client'
import React, { useEffect, useState } from 'react'
import { Home, Search, Ticket, User, Store, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    setRole(userRole)
  }, [])

  const tabs = [
    { id: 'home', icon: Home, label: 'الرئيسية', path: '/' },
    { id: 'browse', icon: Search, label: 'تصفح', path: '/browse' },
    { id: 'favorites', icon: Heart, label: 'المفضلة', path: '/favorites' },
    role === 'merchant'
      ? { id: 'merchant', icon: Store, label: 'أعمالي', path: '/merchant-dashboard' }
      : { id: 'tickets', icon: Ticket, label: 'تذاكري', path: '/tickets' },
    { id: 'profile', icon: User, label: 'حسابي', path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] rounded-t-[40px] px-6 py-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto" dir="rtl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-14 group ${
                isActive ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              <div className={`relative p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-emerald-50' : 'group-hover:bg-gray-50'}`}>
                <Icon 
                  size={isActive ? 22 : 22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all ${isActive && tab.id === 'favorites' ? 'fill-rose-100 text-rose-500 bg-rose-50' : ''} ${isActive && tab.id !== 'favorites' ? 'fill-emerald-100' : ''}`} 
                />
              </div>
              <span className={`text-[9px] font-black tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'} ${isActive && tab.id === 'favorites' ? 'text-rose-500' : ''} transition-all duration-300`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}