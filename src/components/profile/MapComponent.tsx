"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, LocateFixed } from "lucide-react";
import toast from "react-hot-toast";

// Fix default icon issue with webpack/nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
}

function MapControls({ 
  position, 
  setPosition, 
  onLocationSelect 
}: { 
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) {
      map.flyTo(e.latlng, 15);
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    locationerror(e) {
      if (e.message.includes("Only secure origins are allowed") || typeof navigator !== "undefined" && !navigator.geolocation) {
         toast.error("مرورگر شما برای دسترسی به مکان در این آدرس (HTTP) محدودیت امنیتی دارد.");
      } else {
         toast.error("عدم دسترسی به مکان. لطفاً GPS را روشن کنید و دسترسی مرورگر را تایید کنید.");
      }
    }
  });

  const handleLocate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.geolocation) {
      toast.error("مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند یا محدودیت امنیتی دارد.");
      return;
    }
    map.locate();
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon));
        map.flyTo(newPos, 15);
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <>
      {position && <Marker position={position} />}
      <div className="absolute top-2 right-2 left-2 z-[400] flex gap-2 pointer-events-none">
        <div className="flex-1 flex pointer-events-auto shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
          <input 
            type="text" 
            placeholder="جستجوی محله، خیابان..." 
            className="w-full px-3 py-2 bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            type="button" 
            onClick={() => handleSearch()} 
            disabled={isSearching} 
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 flex items-center justify-center transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={handleLocate} 
          type="button"
          className="pointer-events-auto flex items-center justify-center bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-sm text-gray-700 dark:text-white p-2 rounded-xl shadow-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          title="مکان‌یابی من"
        >
          <LocateFixed className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </button>
      </div>
    </>
  );
}

export default function MapComponent({ onLocationSelect, defaultLocation }: MapComponentProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultLocation ? new L.LatLng(defaultLocation.lat, defaultLocation.lng) : null
  );

  const center = defaultLocation || { lat: 35.6892, lng: 51.3890 };

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      zoomControl={false}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapControls 
        position={position} 
        setPosition={setPosition} 
        onLocationSelect={onLocationSelect} 
      />
    </MapContainer>
  );
}
