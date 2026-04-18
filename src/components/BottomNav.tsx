'use client'
import React, { useEffect, useState } from 'react'
import { Home, Search, Ticket, User, Store, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // جلب صلاحية المستخدم من الذاكرة المحلية لتسريع الواجهة
    const userRole = localStorage.getItem('user_role')
    setRole(userRole)
  }, [])

  // بناء المصفوفة بشكل ديناميكي لتشمل 5 أزرار بتوزيع متناسق
  const tabs = [
    { id: 'home', icon: Home, label: 'الرئيسية', path: '/' },
    { id: 'browse', icon: Search, label: 'تصفح', path: '/browse' },
    // الزر الجديد: المفضلة (في المنتصف لسهولة الوصول)
    { id: 'favorites', icon: Heart, label: 'المفضلة', path: '/favorites' },
    // الزر الرابع يتغير حسب دور المستخدم (تاجر أو زبون/أدمن)
    role === 'merchant'
      ? { id: 'merchant', icon: Store, label: 'أعمالي', path: '/merchant-dashboard' }
      : { id: 'tickets', icon: Ticket, label: 'تذاكري', path: '/tickets' },
    { id: 'profile', icon: User, label: 'حسابي', path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[40px] px-6 py-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto" dir="rtl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-14 ${
                isActive ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-emerald-400'
              }`}
            >
              {/* تأثير جميل للأيقونة عند التفعيل، مع لمسة خاصة للقلب */}
              <Icon 
                size={isActive ? 24 : 22} 
                className={`${isActive ? 'fill-emerald-100' : ''} ${isActive && tab.id === 'favorites' ? 'fill-rose-100 text-rose-500' : ''}`} 
              />
              <span className={`text-[10px] font-black ${isActive ? 'opacity-100' : 'opacity-70'} ${isActive && tab.id === 'favorites' ? 'text-rose-500' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}