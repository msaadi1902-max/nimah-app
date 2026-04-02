'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import BottomNav from '@/components/BottomNav'
import { 
  Utensils, Store, Smartphone, Shirt, ShoppingBag, 
  Heart, Star, Clock, MapPin, Zap, Gift, Tag, Sparkles 
} from 'lucide-react'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function HomePage() {
  const [items, setItems] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    async function getItems() {
      const { data } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setItems(data)
    }
    getItems()
  }, [])

  const handleBookNow = (item: any) => {
    if (item.quantity <= 0) {
      alert("نعتذر، نفذت الكمية!");
      return;
    }
    setSelectedItem(item);
  };

  const confirmBooking = async () => {
    if (!selectedItem) return;
    setIsBooking(true);
    const { error } = await supabase
      .from('meals')
      .update({ quantity: selectedItem.quantity - 1 })
      .eq('id', selectedItem.id);

    if (!error) {
      alert(`تم الحجز بنجاح! 🎉\nرقم طلبك: #NIM-${Math.floor(1000 + Math.random() * 9000)}\nاستلم طلبك قبل الساعة ${selectedItem.end_time}`);
      setItems(items.map(i => i.id === selectedItem.id ? {...i, quantity: i.quantity - 1} : i));
      setSelectedItem(null);
    }
    setIsBooking(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-right" dir="rtl">
      
      {/* هيدر احترافي */}
      <div className="p-8 bg-emerald-600 text-white rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic">نِعمة 🌿</h1>
          <p className="text-sm opacity-90 font-bold mt-1">وداعاً للهدر.. أهلاً بالتوفير</p>
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* شريط الفلاتر الذكي */}
      <div className="px-4 -mt-5 flex gap-3 overflow-x-auto no-scrollbar py-3">
        <button onClick={() => setActiveFilter('all')} className={`px-6 py-3 rounded-[20px] font-black text-sm shadow-md transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600'}`}>الكل</button>
        <button className="px-6 py-3 rounded-[20px] bg-white text-gray-600 font-black text-sm shadow-md flex items-center gap-2 whitespace-nowrap tracking-tighter">
          <Gift size={16} className="text-rose-500" /> صناديق نِعمة
        </button>
        <button className="px-6 py-3 rounded-[20px] bg-white text-gray-600 font-black text-sm shadow-md flex items-center gap-2 whitespace-nowrap tracking-tighter">
          <Tag size={16} className="text-blue-500" /> عروض تجارية
        </button>
      </div>

      {/* قائمة العروض */}
      <div className="p-4 space-y-10 mt-4">
        {items.map((item) => {
          // تمييز إذا كان المنتج "صندوق نِعمة" (Rescue Meal) أو "عرض عادي"
          const isBox = item.is_rescue_meal === true;

          return (
            <div key={item.id} className={`rounded-[45px] overflow-hidden shadow-xl border relative group transition-all ${isBox ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400' : 'bg-white border-gray-100'}`}>
              
              {/* صورة العرض أو أيقونة الصندوق */}
              <div className="h-56 relative overflow-hidden">
                {isBox ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-700/50 p-6 text-center">
                    <div className="bg-white/20 p-6 rounded-full mb-3 animate-pulse">
                        <Gift size={60} className="text-white" />
                    </div>
                    <h3 className="font-black text-xl">صندوق نِعمة للمفاجآت 🎁</h3>
                    <p className="text-[10px] opacity-80 font-bold">محتوى لذيذ وغير متوقع بانتظارك!</p>
                  </div>
                ) : (
                  <img src={item.image_url || 'https://via.placeholder.com/400x300?text=NiMah'} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                )}
                
                <div className="absolute top-6 left-6 flex gap-2">
                  <button className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white hover:text-rose-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                {isBox && (
                  <div className="absolute top-6 right-6 bg-amber-400 text-black px-4 py-1.5 rounded-2xl font-black text-[10px] shadow-lg flex items-center gap-1">
                     <Sparkles size={12} /> الأفضل قيمة
                  </div>
                )}
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {!isBox && <h3 className="font-black text-2xl text-gray-900 leading-tight mb-1">{item.name}</h3>}
                    <div className={`flex items-center gap-2 ${isBox ? 'text-emerald-100' : 'text-amber-500'}`}>
                      <Star size={16} fill="currentColor" />
                      <span className="font-black text-xs">4.9 (ممتاز) • {item.category}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`text-3xl font-black block ${isBox ? 'text-white' : 'text-emerald-600'}`}>€{item.price}</span>
                    <span className={`text-sm line-through block opacity-50 font-bold ${isBox ? 'text-white' : 'text-gray-400'}`}>€{item.original_price || (item.price * 2.5).toFixed(2)}</span>
                  </div>
                </div>

                <div className={`flex items-center gap-4 mb-8 text-xs font-bold ${isBox ? 'text-emerald-100' : 'text-gray-400'}`}>
                  <div className="flex items-center gap-1.5 bg-black/10 px-3 py-2 rounded-xl">
                    <Clock size={14} /> الاستلام: {item.end_time || 'إغلاق المحل'}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/10 px-3 py-2 rounded-xl">
                    <MapPin size={14} /> 1.2 كم
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleBookNow(item)}
                    className={`flex-1 py-5 rounded-[28px] font-black text-lg shadow-xl active:scale-95 transition-all ${isBox ? 'bg-white text-emerald-700 shadow-emerald-900/20' : 'bg-emerald-600 text-white shadow-emerald-100'}`}
                  >
                    حجز الآن 🛒
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* نافذة التأكيد */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[50px] p-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 text-right">تأكيد الحجز ✨</h2>
            <p className="text-gray-500 text-sm mb-8 text-right font-bold italic">هل تود حجز هذا العرض المميز؟</p>
            
            <div className="bg-emerald-50 p-8 rounded-[35px] mb-10 border border-emerald-100 shadow-inner">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-bold">السعر النهائي</span>
                  <span className="text-3xl font-black text-emerald-700">€{selectedItem.price}</span>
               </div>
               <div className="h-[1px] bg-emerald-100 w-full mb-4"></div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">وقت الاستلام الأقصى</span>
                  <span className="text-gray-700 font-black tracking-widest uppercase">{selectedItem.end_time || '22:00'}</span>
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={confirmBooking} disabled={isBooking} className="flex-[2] bg-emerald-600 text-white py-5 rounded-[25px] font-black shadow-lg">
                {isBooking ? 'جاري التأكيد...' : 'تأكيد وحجز'}
              </button>
              <button onClick={() => setSelectedItem(null)} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-[25px] font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="home" />
    </div>
  )
}