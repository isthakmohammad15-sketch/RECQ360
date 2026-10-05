import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Globe } from 'lucide-react';
import { getMapsBrowserKey } from '../lib/maps.functions';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

declare global {
  interface Window {
    google: any;
    __initRECQ360Map?: () => void;
  }
}

const VIZAG_CENTER = { lat: 17.7285, lng: 83.2885 };

function isGoogleOAuthClientId(key: string): boolean {
  return typeof key === 'string' && key.includes('.apps.googleusercontent.com');
}

function isValidGoogleMapsKey(key: string): boolean {
  if (!key || isGoogleOAuthClientId(key)) return false;
  return key.startsWith('AIzaSy') || key.length >= 35;
}

const FLOOD_HOTSPOTS = [
  { id: 'hs-1', name: 'HB Colony Low-Lying Storm Drain', lat: 17.7315, lng: 83.306, radius: 600, severity: 'High' },
  { id: 'hs-2', name: 'NAD Junction Underpass Storm Sump', lat: 17.7385, lng: 83.2295, radius: 700, severity: 'Critical' },
  { id: 'hs-3', name: 'Bheemili Beach Road Sea Erosion Zone', lat: 17.8898, lng: 83.436, radius: 800, severity: 'Extreme' },
  { id: 'hs-4', name: 'Gajuwaka Industrial Culvert Stream', lat: 17.6892, lng: 83.2182, radius: 500, severity: 'High' },
];

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B1220' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1220' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7d93b2' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#152238' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#5c7ca5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08182b' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1e2f4a' }] },
];

async function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.maps) return window.google;

  let key: string =
    import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] ||
    import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'] ||
    '';
  if (!key) {
    try {
      const res = await getMapsBrowserKey();
      key = res?.key ?? '';
    } catch {
      key = '';
    }
  }

  if (!isValidGoogleMapsKey(key)) {
    return Promise.reject(
      new Error(
        isGoogleOAuthClientId(key)
          ? 'Provided key is a Google OAuth Client ID, using tactical Leaflet engine.'
          : 'No Google Maps key found, using tactical Leaflet engine.',
      ),
    );
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('gmaps-sdk');
    const channel = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? '';

    window.__initRECQ360Map = () => resolve(window.google);

    if (existing) return;

    const script = document.createElement('script');
    script.id = 'gmaps-sdk';
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initRECQ360Map&channel=${channel}`;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

const pin = (color: string, label: string) => ({
  path: 'M 0,0 m -11,0 a 11,11 0 1,0 22,0 a 11,11 0 1,0 -22,0',
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 1,
  labelOrigin: { x: 0, y: 0 },
  label,
});

export const MapView: React.FC = () => {
  const { zones, shelters, assets, navigateTo } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const infoRef = useRef<any>(null);

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<L.Layer[]>([]);

  const [engine, setEngine] = useState<'google' | 'leaflet'>('google');
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const [showZones, setShowZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showFloodHotspots, setShowFloodHotspots] = useState(true);

  // Boot the SDK + map instance once.
  useEffect(() => {
    let cancelled = false;

    const initLeaflet = () => {
      if (cancelled || !containerRef.current) return;
      try {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
        const map = L.map(containerRef.current, {
          center: [VIZAG_CENTER.lat, VIZAG_CENTER.lng],
          zoom: 11,
          zoomControl: true,
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(map);
        leafletMapRef.current = map;
        setEngine('leaflet');
        setReady(true);
      } catch (err: any) {
        setMapError(err.message || 'Failed to initialise tactical basemap');
      }
    };

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: VIZAG_CENTER,
          zoom: 11,
          styles: DARK_STYLE,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
        });
        infoRef.current = new google.maps.InfoWindow();
        setEngine('google');
        setReady(true);
      })
      .catch((err) => {
        console.info('[Tactical Map] Google Maps key not active, using tactical Leaflet basemap:', err.message);
        initLeaflet();
      });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Re-draw overlays whenever data or layer toggles change.
  useEffect(() => {
    if (!ready) return;

    if (engine === 'google' && mapRef.current && window.google) {
      const google = window.google;
      const map = mapRef.current;

      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      const open = (marker: any, html: string) => {
        infoRef.current.setContent(`<div style="font-family:monospace;font-size:12px;color:#0B1220">${html}</div>`);
        infoRef.current.open({ anchor: marker, map });
      };

      if (showZones) {
        zones.forEach((z) => {
          const color = z.status === 'ready' ? '#2FBF71' : z.status === 'pending' ? '#F2B138' : '#E4572E';
          const marker = new google.maps.Marker({
            map,
            position: { lat: z.coordinates[0], lng: z.coordinates[1] },
            icon: pin(color, String(z.number)),
            label: { text: String(z.number), color: '#fff', fontSize: '10px', fontWeight: 'bold' },
            title: z.name,
          });
          marker.addListener('click', () => {
            open(
              marker,
              `<b>Zone ${z.number} — ${z.name}</b><br/>Readiness: ${z.readinessScore}%<br/>Pending tasks: ${z.pendingTaskCount}<br/>Officer: ${z.officerName}`,
            );
          });
          marker.addListener('dblclick', () => navigateTo('zone-detail', { zoneId: z.id }));
          overlaysRef.current.push(marker);
        });
      }

      if (showShelters) {
        shelters.forEach((s) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: s.coordinates[0], lng: s.coordinates[1] },
            icon: pin('#2FBF71', 'S'),
            label: { text: 'S', color: '#fff', fontSize: '10px', fontWeight: 'bold' },
            title: s.name,
          });
          marker.addListener('click', () =>
            open(
              marker,
              `<b>${s.name}</b><br/>${s.zoneName}<br/>Occupancy: ${s.currentOccupancy}/${s.capacity}<br/>Status: ${s.status}`,
            ),
          );
          overlaysRef.current.push(marker);
        });
      }

      if (showAssets) {
        assets.forEach((a) => {
          const color = a.status === 'ready' ? '#2E9CCA' : a.status === 'critical' ? '#E4572E' : '#F2B138';
          const marker = new google.maps.Marker({
            map,
            position: { lat: a.coordinates[0], lng: a.coordinates[1] },
            icon: pin(color, 'A'),
            label: { text: 'A', color: '#fff', fontSize: '10px', fontWeight: 'bold' },
            title: a.name,
          });
          marker.addListener('click', () =>
            open(marker, `<b>${a.name}</b><br/>${a.qrId} • ${a.zoneName}<br/>Status: ${a.status}<br/>${a.location}`),
          );
          overlaysRef.current.push(marker);
        });
      }

      if (showFloodHotspots) {
        FLOOD_HOTSPOTS.forEach((hs) => {
          const circle = new google.maps.Circle({
            map,
            center: { lat: hs.lat, lng: hs.lng },
            radius: hs.radius,
            strokeColor: '#E4572E',
            strokeOpacity: 0.9,
            strokeWeight: 1.5,
            fillColor: '#E4572E',
            fillOpacity: 0.22,
          });
          circle.addListener('click', () => {
            infoRef.current.setContent(
              `<div style="font-family:monospace;font-size:12px;color:#0B1220"><b>⚠️ FLOOD HOTSPOT</b><br/>${hs.name}<br/>Severity: ${hs.severity}</div>`,
            );
            infoRef.current.setPosition({ lat: hs.lat, lng: hs.lng });
            infoRef.current.open(map);
          });
          overlaysRef.current.push(circle);
        });
      }
    } else if (engine === 'leaflet' && leafletMapRef.current) {
      const map = leafletMapRef.current;
      leafletLayersRef.current.forEach((l) => l.remove());
      leafletLayersRef.current = [];

      if (showZones) {
        zones.forEach((z) => {
          const color = z.status === 'ready' ? '#2FBF71' : z.status === 'pending' ? '#F2B138' : '#E4572E';
          const marker = L.circleMarker([z.coordinates[0], z.coordinates[1]], {
            radius: 12,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          });
          marker.bindTooltip(`<b>Zone ${z.number} — ${z.name}</b><br/>Readiness: ${z.readinessScore}%`, {
            direction: 'top',
          });
          marker.bindPopup(
            `<div style="font-family:monospace;font-size:12px;color:#0B1220"><b>Zone ${z.number} — ${z.name}</b><br/>Readiness: ${z.readinessScore}%<br/>Pending tasks: ${z.pendingTaskCount}<br/>Officer: ${z.officerName}</div>`,
          );
          marker.addTo(map);
          leafletLayersRef.current.push(marker);
        });
      }

      if (showShelters) {
        shelters.forEach((s) => {
          const marker = L.circleMarker([s.coordinates[0], s.coordinates[1]], {
            radius: 9,
            fillColor: '#2FBF71',
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9,
          });
          marker.bindTooltip(`<b>Shelter: ${s.name}</b><br/>Capacity: ${s.capacity}`, { direction: 'top' });
          marker.bindPopup(
            `<div style="font-family:monospace;font-size:12px;color:#0B1220"><b>${s.name}</b><br/>${s.zoneName}<br/>Occupancy: ${s.currentOccupancy}/${s.capacity}<br/>Status: ${s.status}</div>`,
          );
          marker.addTo(map);
          leafletLayersRef.current.push(marker);
        });
      }

      if (showAssets) {
        assets.forEach((a) => {
          const color = a.status === 'ready' ? '#2E9CCA' : a.status === 'critical' ? '#E4572E' : '#F2B138';
          const marker = L.circleMarker([a.coordinates[0], a.coordinates[1]], {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9,
          });
          marker.bindTooltip(`<b>${a.name}</b><br/>${a.status}`, { direction: 'top' });
          marker.bindPopup(
            `<div style="font-family:monospace;font-size:12px;color:#0B1220"><b>${a.name}</b><br/>${a.qrId} • ${a.zoneName}<br/>Status: ${a.status}<br/>${a.location}</div>`,
          );
          marker.addTo(map);
          leafletLayersRef.current.push(marker);
        });
      }

      if (showFloodHotspots) {
        FLOOD_HOTSPOTS.forEach((hs) => {
          const circle = L.circle([hs.lat, hs.lng], {
            radius: hs.radius,
            color: '#E4572E',
            fillColor: '#E4572E',
            fillOpacity: 0.25,
            weight: 2,
            dashArray: '4, 4',
          });
          circle.bindPopup(
            `<div style="font-family:monospace;font-size:12px;color:#0B1220"><b>⚠️ FLOOD HOTSPOT</b><br/>${hs.name}<br/>Severity: ${hs.severity}</div>`,
          );
          circle.addTo(map);
          leafletLayersRef.current.push(circle);
        });
      }
    }
  }, [ready, engine, zones, shelters, assets, showZones, showShelters, showAssets, showFloodHotspots, navigateTo]);

  return (
    <div className="p-4 md:p-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2E9CCA]" />
            <span>Interactive Tactical Map — Greater Visakhapatnam</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <Globe className="w-3.5 h-3.5 text-[#2E9CCA]" />
            <span>{engine === 'google' ? 'Google Maps Tactical Engine' : 'Tactical Basemap (Leaflet / Dark Matter)'}</span>
            <span>• {zones.length} zones, cyclone shelters, critical assets & coastal hotspots</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded border transition-all ${showZones ? 'bg-[#2E9CCA]/20 border-[#2E9CCA] text-[#2E9CCA]' : 'bg-[#0B1220] border-white/10 text-slate-400'}`}
          >
            Zones ({zones.length})
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1.5 rounded border transition-all ${showShelters ? 'bg-[#2FBF71]/20 border-[#2FBF71] text-[#2FBF71]' : 'bg-[#0B1220] border-white/10 text-slate-400'}`}
          >
            Shelters ({shelters.length})
          </button>
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-3 py-1.5 rounded border transition-all ${showAssets ? 'bg-[#F2B138]/20 border-[#F2B138] text-[#F2B138]' : 'bg-[#0B1220] border-white/10 text-slate-400'}`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setShowFloodHotspots(!showFloodHotspots)}
            className={`px-3 py-1.5 rounded border transition-all ${showFloodHotspots ? 'bg-[#E4572E]/20 border-[#E4572E] text-[#E4572E]' : 'bg-[#0B1220] border-white/10 text-slate-400'}`}
          >
            Flood Hotspots
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0B1220] border border-white/10 rounded-lg overflow-hidden shadow-2xl relative">
        <div ref={containerRef} className="w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-400 bg-[#0B1220]/80">
            {mapError ? `Map status: ${mapError}` : 'Initialising tactical basemap…'}
          </div>
        )}
      </div>
    </div>
  );
};

