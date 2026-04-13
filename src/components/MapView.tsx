'use client'
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function MapView({ items }: { items: any[] }) {
  // دمشق كمركز افتراضي في حال عدم وجود منتجات
  const defaultPosition: [number, number] = [33.5138, 36.2765]

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [])

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
        />
        {items.map((item) => (
          <Marker 
            key={item.id} 
            // استخدام الإحداثيات الحقيقية من الداتا
            position={[item.lat || defaultPosition[0], item.lng || defaultPosition[1]]} 
            icon={customIcon}
          >
            <Popup>
              <div className="text-right font-sans min-w-[140px]" dir="rtl">
                <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-2 shadow-sm" />
                <h3 className="font-black text-sm text-gray-900 leading-tight mb-1">{item.name}</h3>
                <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-50">
                  <span className="font-black text-emerald-600 text-base">{item.discounted_price} €</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-1 rounded-lg">{item.category}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">📍 الموقع دقيق</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}