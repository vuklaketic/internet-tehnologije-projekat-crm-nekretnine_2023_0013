'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  address: string;
  city: string;
  initialLat?: string | null;
  initialLng?: string | null;
  title: string;
}

export default function PropertyMap({
  address,
  city,
  initialLat,
  initialLng,
  title,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );
  const [loading, setLoading] = useState(!coords);

  // Geokodiranje adrese preko Nominatim OpenStreetMap API-ja ako koordinate nisu unete
  useEffect(() => {
    if (coords) return;

    let isMounted = true;
    async function geocode() {
      try {
        setLoading(true);
        const query = encodeURIComponent(`${address}, ${city}, Serbia`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          {
            headers: {
              'User-Agent': 'CRM-Nekretnine-FON-Student-Project/1.0',
            },
          }
        );
        const data = await res.json();
        if (isMounted && data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else if (isMounted) {
          // Fallback na centar Beograda
          setCoords({ lat: 44.8125, lng: 20.4612 });
        }
      } catch (err) {
        console.error('Nominatim Geocoding error:', err);
        if (isMounted) setCoords({ lat: 44.8125, lng: 20.4612 });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    geocode();
    return () => {
      isMounted = false;
    };
  }, [address, city, coords]);

  // Inicijalizacija Leaflet mape
  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    // Dinamički import Leaflet-a na klijentu
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current!).setView([coords.lat, coords.lng], 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Ikona markera
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${title}</b><br/>${address}, ${city}`)
        .openPopup();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, address, city, title]);

  if (loading) {
    return (
      <div className="w-full h-80 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-r-transparent mr-2"></div>
        Geokodiranje adrese i učitavanje mape...
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
