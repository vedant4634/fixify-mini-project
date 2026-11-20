import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix standard Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom styled Fixify pin
const fixifyIcon = L.divIcon({
  className: 'custom-fixify-pin',
  html: `<div style="
    background: #142B4A;
    color: #FFFFFF;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #E9A04B;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: #E9A04B;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function MapPicker({
  lat = 19.0760,
  lng = 72.8777,
  onLocationSelect,
  readOnly = false,
  popupText = 'Service Location',
  height = '280px',
  zoom = 13,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already exists on container
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: zoom,
      scrollWheelZoom: !readOnly,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: fixifyIcon,
      draggable: !readOnly,
    }).addTo(map);

    if (popupText) {
      marker.bindPopup(`<b>${popupText}</b><br><span style="font-size:11px;color:#788391">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span>`);
    }

    if (!readOnly) {
      // Map click handler
      map.on('click', (e) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        if (onLocationSelect) {
          onLocationSelect(newLat, newLng);
        }
      });

      // Marker drag handler
      marker.on('dragend', (e) => {
        const { lat: newLat, lng: newLng } = e.target.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(newLat, newLng);
        }
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size after short delay to handle tabs/hidden containers
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, readOnly, popupText, zoom]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border-subtle shadow-xs">
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-vanilla-dark" />
      {!readOnly && (
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-medium text-primary-navy shadow-xs border border-border-subtle">
          Click map to pin address
        </div>
      )}
    </div>
  );
}
