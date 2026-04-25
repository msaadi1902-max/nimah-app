'use client'
import React, { useState, useCallback, useRef } from 'react'
// @ts-ignore
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

// مفتاح Mapbox السري الخاص بك
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxzYWFkaTE5MDIiLCJhIjoiY21vZGtwdmViMDUwZjJxczJ3Njhxb2E4ayJ9.72r3c1jyYHQAMl-OqFHPUg';

interface PickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

export default function LocationPicker({ onLocationSelect, initialPos }: PickerProps) {
  const defaultLat = initialPos ? initialPos[0] : 33.5138;
  const defaultLng = initialPos ? initialPos[1] : 36.2765;

  const [marker, setMarker] = useState<{lat: number, lng: number} | null>(
    initialPos ? { lat: initialPos[0], lng: initialPos[1] } : null
  );

  const mapRef = useRef<any>(null);

  const onMapClick = useCallback((e: any) => {
    const { lng, lat } = e.lngLat;
    setMarker({ lat, lng });
    onLocationSelect(lat, lng);
    
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], duration: 800, zoom: 15 });
    }
  }, [onLocationSelect]);

  return (
    <div className="relative w-full h-[300px] rounded-[30px] overflow-hidden border-2 border-slate-100 shadow-inner group bg-slate-50">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: defaultLng,
          latitude: defaultLat,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={onMapClick}
        cursor="crosshair"
      >
        <GeolocateControl position="bottom-right" />
        <NavigationControl position="bottom-right" showCompass={false} />

        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="relative transform hover:scale-110 transition-transform duration-300 -mt-2">
              <MapPin size={40} className="text-emerald-500 fill-emerald-100 drop-shadow-md" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 blur-[2px] rounded-full"></div>
            </div>
          </Marker>
        )}
      </Map>

      {/* رسالة التوجيه */}
      <div className="absolute top-4 left-4 z-[10] bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
        انقر لتثبيت موقع المتجر 📍
      </div>

      {/* علامة التأكيد */}
      <div className="absolute bottom-4 left-4 z-[10] bg-white border-2 border-emerald-500 text-emerald-600 px-4 py-2 rounded-xl font-bold shadow-2xl">
        Mapbox Active ✅
      </div>
    </div>
  )
}