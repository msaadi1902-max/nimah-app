'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Heart, Share2, MapPin, Clock, Info, Star, ShieldCheck } from 'lucide-react'

export default function OfferDetailsPage() {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)

  // بيانات وهمية للعرض (لاحقاً سنجلبها من قاعدة البيانات حسب الـ id)
  const offer = {
    restaurantName: 'مخبز الأمل',
    title: 'صندوق مخبوزات مفاجئ',
    rating: 4.8,
    reviewsCount: '120+',
    distance: '850 م',
    address: 'دمشق، الميدان، شارع الجزماتية',
    pickupTime: 'اليوم: 08:00 م - 10:00 م',
    newPrice: '2.99',
    oldPrice: '10.00',
    leftCount: 3,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
    logo: 'https://ui-avatars.com/api/?name=أمل&background=10b981&color=fff',
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right pb-24" dir="rtl">
      
      {/* 1. قسم الصورة العلوية والأزرار العائمة */}
      <div className="relative h-72 w-full bg-gray-200">
        <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
        
        {/* تدرج لوني أسود خفيف من الأعلى لتوضيح الأزرار */}
        <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent"></div>

        {/* الأزرار العلوية */}
        <div className="absolute top-10 left-0 w-full px-4 flex justify-between items-center z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 shadow-sm active:scale-95 transition-transform">
            <ArrowRight size={20} />
          </button>
          
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 shadow-sm active:scale-95 transition-transform">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-900'} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. البطاقة البيضاء المتداخلة (تفاصيل العرض) */}
      <div className="bg-gray-50 relative -mt-8 rounded-t-[30px] z-20">
        
        {/* معلومات المطعم الأساسية */}
        <div className="bg-white px-6 pt-8 pb-6 rounded-b-[30px] shadow-sm mb-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{offer.title}</h1>
              <p className="text-emerald-700 font-bold text-sm flex items-center gap-2">
                <img src={offer.logo} alt="logo" className="w-6 h-6 rounded-full" />
                {offer.restaurantName}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-2xl flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-600">
                <Star size={16} className="fill-emerald-600" />
                <span className="font-black text-sm">{offer.rating}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">{offer.reviewsCount} تقييم</span>
            </div>
          </div>

          <div className="flex gap-4 border-t border-gray-100 pt-4 mt-2">
            <div className="flex-1 flex flex-col items-center p-3 bg-emerald-50 rounded-2xl">
              <Clock size={24} className="text-emerald-600 mb-2" />
              <span className="text-xs text-gray-500 font-bold mb-1">وقت الاستلام</span>
              <span className="text-xs font-black text-emerald-900 text-center">{offer.pickupTime}</span>
            </div>
            <div className="flex-1 flex flex-col items-center p-3 bg-blue-50 rounded-2xl">
              <MapPin size={24} className="text-blue-600 mb-2" />
              <span className="text-xs text-gray-500 font-bold mb-1">المسافة إليك</span>
              <span className="text-xs font-black text-blue-900">{offer.distance}</span>
            </div>
          </div>
        </div>

        {/* ماذا يوجد في الصندوق؟ */}
        <div className="bg-white p-6 mb-2 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Info size={20} className="text-emerald-600" /> ماذا تتوقع في الصندوق؟
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed font-bold">
            هذا الصندوق هو مفاجأة! ستنقذ طعاماً لذيذاً كان سيهدر في نهاية اليوم. قد يحتوي على تشكيلة من المعجنات الطازجة، الكرواسون، أو الخبز. لا يمكننا تحديد المحتوى بدقة، لكننا نضمن لك طعماً رائعاً وتوفيراً كبيراً! 🥐🥖
          </p>
        </div>

        {/* العنوان */}
        <div className="bg-white p-6 shadow-sm">
          <h3 className="font-black text-lg text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" /> عنوان الاستلام
          </h3>
          <p className="text-sm text-gray-600 font-bold mb-4">{offer.address}</p>
          {/* صورة خريطة وهمية */}
          <div className="w-full h-32 bg-gray-200 rounded-2xl overflow-hidden relative border border-gray-100">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. الشريط السفلي الثابت (للدفع/الحجز) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 flex items-center justify-between shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]" dir="rtl">
        <div>
          <p className="text-xs text-gray-500 font-bold line-through mb-0.5">{offer.oldPrice} €</p>
          <p className="text-2xl font-black text-emerald-800">{offer.newPrice} €</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">باقي {offer.leftCount} فقط</span>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-xl shadow-gray-200">
            احجز الآن
          </button>
        </div>
      </div>

    </div>
  )
}