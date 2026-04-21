'use client'
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, LocateFixed, CheckCircle2 } from 'lucide-react'

// أيقونة الدبوس الخاص بالتاجر
const pickerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-emerald.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface PickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPos?: [number, number];
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [pos, setPos] = useState<L.LatLng | null>(null);
  const map = useMap();

  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPos(e.latlng);
      map.flyTo(e.latlng, 16);
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    map.locate();
  }

  return (
    <>
      <button 
        type="button"
        onClick={handleLocate}
        className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-emerald-600 active:scale-90 transition-transform"
      >
        <LocateFixed size={20} />
      </button>
      {pos && <Marker position={pos} icon={pickerIcon} />}
    </>
  );
}

export default function LocationPicker({ onLocationSelect, initialPos }: PickerProps) {
  const defaultCenter: [number, number] = initialPos || [33.5138, 36.2765];

  return (
    <div className="relative w-full h-[300px] rounded-[30px] overflow-hidden border-2 border-slate-100 shadow-inner">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents onSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
        انقر لتثبيت موقع المتجر 📍
      </div>
    </div>
  )
}