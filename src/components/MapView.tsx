'use client'
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Store, LocateFixed } from 'lucide-react'

// 🔵 أيقونة المتاجر (زرقاء)
const merchantIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 🔴 أيقونة موقع المستخدم / الدبوس (حمراء للتمييز)
const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  items: any[]
  onPinDrop?: (lat: number, lng: number) => void
}

// 🧭 وحدة التحكم بالخريطة (تحديد الموقع وإسقاط الدبوس)
function MapController({ onPinDrop }: { onPinDrop?: (lat: number, lng: number) => void }) {
  const map = useMap()
  const [userPos, setUserPos] = useState<L.LatLng | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // 1. التفاعل مع النقر (إسقاط دبوس)
  useMapEvents({
    click(e) {
      setUserPos(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
      if (onPinDrop) onPinDrop(e.latlng.lat, e.latlng.lng)
    }
  })

  // 2. مستشعر الـ GPS 
  useEffect(() => {
    map.on('locationfound', (e) => {
      setUserPos(e.latlng)
      map.flyTo(e.latlng, 15, { animate: true, duration: 1.5 })
      setIsLocating(false)
      if (onPinDrop) onPinDrop(e.latlng.lat, e.latlng.lng)
    })
    map.on('locationerror', (e) => {
      alert('تعذر الوصول لبيانات الـ GPS. يرجى تفعيل الموقع (Location) في هاتفك.')
      setIsLocating(false)
    })
  }, [map, onPinDrop])

  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLocating(true)
    map.locate() // تشغيل رادار الهاتف
  }

  return (
    <>
      {/* 🎯 زر تحديد الموقع (GPS) العائم */}
      <div className="absolute bottom-6 left-4 z-[1000]">
        <button 
          onClick={handleLocateMe}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-2 transition-all active:scale-90 ${isLocating ? 'bg-emerald-600 border-emerald-400 animate-pulse' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
          title="تحديد موقعي"
        >
          <LocateFixed size={24} className={isLocating ? 'text-white' : 'text-emerald-400'} />
        </button>
      </div>

      {/* 📍 رسم الدبوس الأحمر للمستخدم */}
      {userPos && (
        <Marker position={userPos} icon={userIcon}>
          <Popup className="custom-popup">
            <div className="font-sans text-center font-black text-rose-600 text-xs" dir="rtl">
              📍 نقطة البحث المحددة
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

export default function MapView({ items, onPinDrop }: MapViewProps) {
  // إحداثيات افتراضية مركزية (دمشق)
  const defaultCenter: [number, number] = [33.5138, 36.2765]

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* تفعيل وحدة الـ GPS وإسقاط الدبابيس */}
        <MapController onPinDrop={onPinDrop} />

        {/* 🏪 رسم دبابيس المتاجر (الوجبات) */}
        {items.map((item) => {
          // لتوزيع المتاجر مؤقتاً في حال لم يملك التاجر إحداثيات (يمكن استبدالها لاحقاً بإحداثيات حقيقية من قاعدة البيانات)
          const lat = item.latitude || (defaultCenter[0] + (Math.random() - 0.5) * 0.05);
          const lng = item.longitude || (defaultCenter[1] + (Math.random() - 0.5) * 0.05);

          return (
            <Marker key={item.id} position={[lat, lng]} icon={merchantIcon}>
              <Popup className="custom-popup">
                <div className="font-sans text-right w-48" dir="rtl">
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-2 relative shadow-inner">
                    <img src={item.image_url} className="w-full h-full object-cover" alt="Meal" />
                    <div className="absolute bottom-1 right-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-sm">
                      {item.discounted_price} {item.currency}
                    </div>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight mb-1">{item.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-2">
                    <Store size={10} className="text-emerald-500"/> {item.profiles?.shop_name || 'متجر'}
                  </p>
                  <a 
                    href={`/meal/${item.id}`} 
                    className="block w-full bg-slate-900 text-white text-center py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-colors shadow-md"
                  >
                    شراء الوجبة
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}