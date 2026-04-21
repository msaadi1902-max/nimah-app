'use client'
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Store, MapPin } from 'lucide-react'

// إصلاح أيقونات Leaflet الافتراضية
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  items: any[]
}

// مكون فرعي لتحديث مركز الخريطة عند العثور على موقع المستخدم
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const map = useMap()

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 14, { duration: 1.5 })
    })
  }, [map])

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}>
      <Popup>
        <div className="text-center font-sans" dir="rtl">
          <p className="font-black text-emerald-600 mb-1">أنت هنا 📍</p>
          <p className="text-[10px] text-slate-500">نحن نبحث عن عروض بالقرب منك</p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapView({ items }: MapViewProps) {
  // إحداثيات دمشق (نقطة مركزية افتراضية)
  const defaultCenter: [number, number] = [33.5138, 36.2765]

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocationMarker />

      {/* رسم دبابيس الوجبات */}
      {items.map((item) => {
        // إذا كان التاجر لم يحدد موقعه، سنعطيه موقعاً عشوائياً قريباً من المركز (لغرض العرض)
        // في المستقبل يمكننا جعل التاجر يحفظ إحداثياته الحقيقية في قاعدة البيانات
        const lat = item.latitude || (defaultCenter[0] + (Math.random() - 0.5) * 0.05);
        const lng = item.longitude || (defaultCenter[1] + (Math.random() - 0.5) * 0.05);

        return (
          <Marker key={item.id} position={[lat, lng]} icon={defaultIcon}>
            <Popup className="custom-popup">
              <div className="font-sans text-right w-48" dir="rtl">
                <div className="w-full h-24 rounded-xl overflow-hidden mb-2 relative">
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
                  className="block w-full bg-slate-900 text-white text-center py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
                >
                  التفاصيل والشراء
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}