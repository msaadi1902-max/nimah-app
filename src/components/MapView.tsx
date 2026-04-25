'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
// @ts-ignore لتخطي أي أخطاء من TypeScript مؤقتاً
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Store, LocateFixed, MapPin } from 'lucide-react'

// مفتاح Mapbox السري الخاص بك
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxzYWFkaTE5MDIiLCJhIjoiY21vZGtwdmViMDUwZjJxczJ3Njhxb2E4ayJ9.72r3c1jyYHQAMl-OqFHPUg';

interface MapViewProps {
  items: any[]
  onPinDrop?: (lat: number, lng: number) => void
}

export default function MapView({ items, onPinDrop }: MapViewProps) {
  const defaultCenter = { lat: 33.5138, lng: 36.2765 } // دمشق
  
  const mapRef = useRef<any>(null)
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null)
  const [mappedItems, setMappedItems] = useState<any[]>([])

  // تجهيز المتاجر وتوزيعها
  useEffect(() => {
    const withCoords = items.map(item => ({
      ...item,
      _lat: item.latitude || (defaultCenter.lat + (Math.random() - 0.5) * 0.05),
      _lng: item.longitude || (defaultCenter.lng + (Math.random() - 0.5) * 0.05)
    }))
    setMappedItems(withCoords)
  }, [items])

  // 1. التفاعل مع النقر (إسقاط دبوس الزبون)
  const onMapClick = useCallback((e: any) => {
    const { lat, lng } = e.lngLat
    setUserPos({ lat, lng })
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1200 })
    if (onPinDrop) onPinDrop(lat, lng)
    setSelectedMerchant(null) // إغلاق أي نافذة متجر مفتوحة
  }, [onPinDrop])

  // 2. مستشعر الـ GPS (زر تحديد الموقع)
  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserPos({ lat: latitude, lng: longitude })
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 })
          setIsLocating(false)
          if (onPinDrop) onPinDrop(latitude, longitude)
        },
        (error) => {
          alert('تعذر الوصول لبيانات الـ GPS. يرجى تفعيل الموقع (Location) في هاتفك.')
          setIsLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('متصفحك لا يدعم تحديد الموقع.')
      setIsLocating(false)
    }
  }

  return (
    <div className="relative w-full h-full bg-slate-50">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: defaultCenter.lng,
          latitude: defaultCenter.lat,
          zoom: 13
        }}
        // الخريطة الفاتحة السريعة
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={onMapClick}
        cursor="crosshair"
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* 📍 رسم الدبوس الأحمر للمستخدم */}
        {userPos && (
          <Marker longitude={userPos.lng} latitude={userPos.lat} anchor="bottom">
            <div className="relative transform hover:scale-110 transition-transform duration-300 -mt-2 flex flex-col items-center">
              <div className="bg-white px-3 py-1 rounded-full shadow-lg mb-1 text-[10px] font-black text-rose-600 border border-rose-100 animate-bounce">
                📍 نقطة البحث المحددة
              </div>
              <MapPin size={45} className="text-rose-600 fill-rose-100 drop-shadow-xl" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/30 blur-[2px] rounded-full"></div>
            </div>
          </Marker>
        )}

        {/* 🏪 رسم دبابيس المتاجر */}
        {mappedItems.map((item) => (
          <Marker 
            key={item.id} 
            longitude={item._lng} 
            latitude={item._lat} 
            anchor="bottom"
            onClick={(e: any) => {
              e.originalEvent.stopPropagation()
              setSelectedMerchant(item)
              mapRef.current?.flyTo({ center: [item._lng, item._lat], zoom: 16, duration: 800 })
            }}
          >
            <div className="relative transform hover:scale-125 transition-transform duration-300 cursor-pointer -mt-2">
               <div className="w-10 h-10 bg-slate-900 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                 <Store size={20} className="text-emerald-400" />
               </div>
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-black/40 blur-[2px] rounded-full"></div>
            </div>
          </Marker>
        ))}

        {/* 🖼️ النافذة المنبثقة لمعلومات المتجر (Popup) */}
        {selectedMerchant && (
          <Popup
            longitude={selectedMerchant._lng}
            latitude={selectedMerchant._lat}
            anchor="bottom"
            offset={45}
            closeOnClick={false}
            onClose={() => setSelectedMerchant(null)}
            className="rounded-2xl overflow-hidden shadow-2xl z-50"
            maxWidth="240px"
          >
            <div className="font-sans text-right w-[200px] p-1" dir="rtl">
              <div className="w-full h-28 rounded-xl overflow-hidden mb-2 relative shadow-inner">
                <img src={selectedMerchant.image_url} className="w-full h-full object-cover" alt="Meal" />
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-black shadow-sm">
                  {selectedMerchant.discounted_price} {selectedMerchant.currency}
                </div>
              </div>
              <h3 className="font-black text-sm text-slate-900 leading-tight mb-1 truncate">{selectedMerchant.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-3">
                <Store size={12} className="text-emerald-500"/> {selectedMerchant.profiles?.shop_name || 'متجر'}
              </p>
              <a 
                href={`/meal/${selectedMerchant.id}`} 
                className="block w-full bg-slate-900 text-white text-center py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-colors shadow-md"
              >
                شراء الوجبة
              </a>
            </div>
          </Popup>
        )}
      </Map>

      {/* 🎯 زر تحديد الموقع (GPS) العائم */}
      <div className="absolute bottom-6 left-4 z-[10]">
        <button 
          onClick={handleLocateMe}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-2 transition-all active:scale-90 ${isLocating ? 'bg-emerald-600 border-emerald-400 animate-pulse' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
          title="تحديد موقعي"
        >
          <LocateFixed size={24} className={isLocating ? 'text-white' : 'text-emerald-400'} />
        </button>
      </div>
    </div>
  )
}