import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Globe,
  Key,
  Layers,
  Satellite,
  ShieldAlert,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { getMapsBrowserKey } from '../lib/maps.functions';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

declare global {
  interface Window {
    google: any;
    __initRECQ360Map?: () => void;
    gm_authFailure?: () => void;
  }
}

const VIZAG_CENTER = { lat: 17.7285, lng: 83.2885 };

function isGoogleOAuthClientId(key: string): boolean {
  return typeof key === 'string' && key.includes('.apps.googleusercontent.com');
}

function isValidGoogleMapsKey(key: string): boolean {
  if (!key || isGoogleOAuthClientId(key)) return false;
  return key.startsWith('AIzaSy') || key.length >= 30;
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

// Esri and OpenStreetMap layers (100% Free, zero API key required, zero watermarks)
const ESRI_DARK_BASE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const ESRI_DARK_REF =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const OSM_STREETS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

async function loadGoogleMapsScript(customKey?: string): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.maps && !customKey) return window.google;

  let key: string = customKey || '';
  if (!key) {
    const res = await getMapsBrowserKey();
    key = res?.key ?? '';
  }

  // If the key is an OAuth client ID, do not pass it as a Maps API key to avoid crash
  if (isGoogleOAuthClientId(key)) {
    console.warn('[Google Maps] Detected OAuth Client ID instead of Maps API Key. Proceeding without key param.');
    key = '';
  }

  return new Promise((resolve, reject) => {
    // If existing script loaded, resolve
    if (window.google?.maps && !customKey) {
      return resolve(window.google);
    }

    const existing = document.getElementById('gmaps-sdk');
    if (existing) {
      existing.remove();
    }

    window.__initRECQ360Map = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps script finished but object is not available'));
      }
    };

    const script = document.createElement('script');
    script.id = 'gmaps-sdk';
    script.async = true;

    const url = new URL('https://maps.googleapis.com/maps/api/js');
    if (key && !isGoogleOAuthClientId(key)) {
      url.searchParams.set('key', key);
    }
    url.searchParams.set('loading', 'async');
    url.searchParams.set('callback', '__initRECQ360Map');
    url.searchParams.set('libraries', 'places,geometry');
    url.searchParams.set('v', 'weekly');

    script.src = url.toString();
    script.onerror = () => reject(new Error('Failed to load Google Maps script from Google servers.'));
    document.head.appendChild(script);

    // Timeout safety fallback
    setTimeout(() => {
      if (window.google?.maps) {
        resolve(window.google);
      }
    }, 4500);
  });
}

const makeSvgMarker = (color: string, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
    <circle cx="15" cy="15" r="13" fill="${color}" stroke="#ffffff" stroke-width="2.5" />
    <text x="15" y="19" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(30, 30),
    anchor: new window.google.maps.Point(15, 15),
  };
};

export const MapView: React.FC = () => {
  const { zones, shelters, assets, navigateTo, activeCity, activeState } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const infoRef = useRef<any>(null);

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletTileLayersRef = useRef<L.Layer[]>([]);
  const leafletOverlaysRef = useRef<L.Layer[]>([]);

  const [engine, setEngine] = useState<'google' | 'leaflet'>('google');
  const [googleTheme, setGoogleTheme] = useState<'dark' | 'natural'>('natural');
  const [leafletLayer, setLeafletLayer] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const [gmapsAuthError, setGmapsAuthError] = useState<boolean>(false);

  // Layer filters
  const [showZones, setShowZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showFloodHotspots, setShowFloodHotspots] = useState(true);

  // Key configuration modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('recq360_google_maps_key') || '' : '';
  });
  const [keyNotice, setKeyNotice] = useState('');

  // Handle Google Maps authentication failures cleanly
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn('[Google Maps] gm_authFailure fired — check key restrictions or billing.');
      setGmapsAuthError(true);
    };
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  // Initialize Leaflet Tactical Basemap (Zero-Key, No Watermarks)
  const initLeaflet = useCallback(() => {
    if (!containerRef.current) return;
    try {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      containerRef.current.innerHTML = '';

      const mapCenter = activeCity?.center || VIZAG_CENTER;
      const mapZoom = activeCity?.zoom || 12;

      const map = L.map(containerRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: mapZoom,
        zoomControl: true,
      });

      // Clear any prior tile layers
      leafletTileLayersRef.current = [];

      if (leafletLayer === 'satellite') {
        const sat = L.tileLayer(ESRI_SATELLITE, {
          maxZoom: 18,
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        }).addTo(map);
        leafletTileLayersRef.current = [sat];
      } else if (leafletLayer === 'streets') {
        const osm = L.tileLayer(OSM_STREETS, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        leafletTileLayersRef.current = [osm];
      } else {
        // Esri Dark Canvas
        const base = L.tileLayer(ESRI_DARK_BASE, {
          maxZoom: 16,
          attribution: '&copy; Esri, HERE, Garmin',
        }).addTo(map);
        const ref = L.tileLayer(ESRI_DARK_REF, {
          maxZoom: 16,
          attribution: '',
        }).addTo(map);
        leafletTileLayersRef.current = [base, ref];
      }

      leafletMapRef.current = map;
      setEngine('leaflet');
      setReady(true);
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err: any) {
      setMapError(err.message || 'Failed to initialize tactical map engine');
    }
  }, [leafletLayer]);

  // Initialize Google Maps Engine
  const initGoogleMaps = useCallback((customKey?: string) => {
    if (!containerRef.current) return;
    setReady(false);
    setMapError('');

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    containerRef.current.innerHTML = '';

    loadGoogleMapsScript(customKey)
      .then((google) => {
        if (!containerRef.current) return;
        const mapCenter = activeCity?.center || VIZAG_CENTER;
        const mapZoom = activeCity?.zoom || 12;

        const gMap = new google.maps.Map(containerRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          styles: googleTheme === 'dark' ? DARK_STYLE : [],
          disableDefaultUI: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          },
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        infoRef.current = new google.maps.InfoWindow();
        mapRef.current = gMap;
        setEngine('google');
        setReady(true);
      })
      .catch((err) => {
        console.warn('[Tactical Map] Google Maps script notice:', err.message);
        setMapError(err.message);
        initLeaflet();
      });
  }, [googleTheme, initLeaflet]);

  // Initial Boot
  useEffect(() => {
    initGoogleMaps();
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [initGoogleMaps]);

  // Dynamic re-centering whenever active city changes
  useEffect(() => {
    if (!ready || !activeCity) return;
    const center = activeCity.center;
    const zoom = activeCity.zoom || 12;

    if (engine === 'google' && mapRef.current) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(zoom);
    } else if (engine === 'leaflet' && leafletMapRef.current) {
      leafletMapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [activeCity, engine, ready]);

  // Handle switching between Dark style and Natural Google Maps style
  useEffect(() => {
    if (engine === 'google' && mapRef.current) {
      mapRef.current.setOptions({
        styles: googleTheme === 'dark' ? DARK_STYLE : [],
      });
    }
  }, [googleTheme, engine]);

  // Re-draw overlays whenever data or layer toggles change
  useEffect(() => {
    if (!ready) return;

    if (engine === 'google' && mapRef.current && window.google) {
      const google = window.google;
      const map = mapRef.current;

      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      const open = (marker: any, html: string) => {
        infoRef.current.setContent(
          `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;padding:4px;max-width:260px;">${html}</div>`,
        );
        infoRef.current.open({ anchor: marker, map });
      };

      if (showZones) {
        zones.forEach((z) => {
          const color = z.status === 'ready' ? '#2FBF71' : z.status === 'pending' ? '#F2B138' : '#E4572E';
          const marker = new google.maps.Marker({
            map,
            position: { lat: z.coordinates[0], lng: z.coordinates[1] },
            icon: makeSvgMarker(color, String(z.number)),
            title: `Zone ${z.number} — ${z.name}`,
          });

          marker.addListener('click', () => {
            open(
              marker,
              `<div style="font-weight:700;font-size:13px;margin-bottom:4px;">Zone ${z.number} — ${z.name}</div>
               <div style="margin-bottom:3px;"><span style="color:#64748b;">Readiness:</span> <b>${z.readinessScore}%</b> (${z.status.toUpperCase()})</div>
               <div style="margin-bottom:3px;"><span style="color:#64748b;">Pending Tasks:</span> <b>${z.pendingTaskCount}</b></div>
               <div style="margin-bottom:6px;"><span style="color:#64748b;">Duty Officer:</span> ${z.officerName}</div>
               <button onclick="window.__navZone && window.__navZone('${z.id}')" style="background:#2E9CCA;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;">
                 Open Zone Detail
               </button>`,
            );
          });

          (window as any).__navZone = (zoneId: string) => navigateTo('zone-detail', { zoneId });
          overlaysRef.current.push(marker);
        });
      }

      if (showShelters) {
        shelters.forEach((s) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: s.coordinates[0], lng: s.coordinates[1] },
            icon: makeSvgMarker('#2FBF71', 'S'),
            title: `Shelter: ${s.name}`,
          });
          marker.addListener('click', () =>
            open(
              marker,
              `<div style="font-weight:700;font-size:13px;margin-bottom:4px;">🏠 ${s.name}</div>
               <div style="color:#64748b;margin-bottom:3px;">${s.zoneName}</div>
               <div style="margin-bottom:3px;"><span style="color:#64748b;">Capacity / Occupancy:</span> <b>${s.currentOccupancy} / ${s.capacity}</b></div>
               <div style="margin-bottom:3px;"><span style="color:#64748b;">Generator Backup:</span> <b>${s.generatorBackup ? 'Available' : 'None'}</b></div>
               ${s.contactPhone ? `<div><span style="color:#64748b;">Contact:</span> <a href="tel:${s.contactPhone}" style="color:#2E9CCA;text-decoration:none;">${s.contactPhone}</a></div>` : ''}`,
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
            icon: makeSvgMarker(color, 'A'),
            title: `Asset: ${a.name}`,
          });
          marker.addListener('click', () =>
            open(
              marker,
              `<div style="font-weight:700;font-size:13px;margin-bottom:4px;">⚡ ${a.name}</div>
               <div style="margin-bottom:2px;"><span style="color:#64748b;">QR ID:</span> <code>${a.qrId}</code></div>
               <div style="margin-bottom:2px;"><span style="color:#64748b;">Zone:</span> ${a.zoneName}</div>
               <div style="margin-bottom:2px;"><span style="color:#64748b;">Status:</span> <b>${a.status.toUpperCase()}</b></div>
               <div><span style="color:#64748b;">Location:</span> ${a.location}</div>`,
            ),
          );
          overlaysRef.current.push(marker);
        });
      }

      const activeHotspots = activeCity?.hotspots && activeCity.hotspots.length > 0 ? activeCity.hotspots : FLOOD_HOTSPOTS;
      if (showFloodHotspots) {
        activeHotspots.forEach((hs) => {
          const circle = new google.maps.Circle({
            map,
            center: { lat: hs.lat, lng: hs.lng },
            radius: hs.radius,
            strokeColor: '#E4572E',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: '#E4572E',
            fillOpacity: 0.2,
          });
          circle.addListener('click', () => {
            infoRef.current.setContent(
              `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;padding:4px;">
                 <b style="color:#E4572E;">⚠️ FLOOD HOTSPOT AREA</b><br/>
                 <b>${hs.name}</b><br/>
                 <span style="color:#64748b;">Severity Threat:</span> <b>${hs.severity}</b><br/>
                 <span style="color:#64748b;">Zone Radius:</span> ${hs.radius} meters
               </div>`,
            );
            infoRef.current.setPosition({ lat: hs.lat, lng: hs.lng });
            infoRef.current.open(map);
          });
          overlaysRef.current.push(circle);
        });
      }
    } else if (engine === 'leaflet' && leafletMapRef.current) {
      const map = leafletMapRef.current;
      leafletOverlaysRef.current.forEach((l) => l.remove());
      leafletOverlaysRef.current = [];

      if (showZones) {
        zones.forEach((z) => {
          const color = z.status === 'ready' ? '#2FBF71' : z.status === 'pending' ? '#F2B138' : '#E4572E';
          const marker = L.circleMarker([z.coordinates[0], z.coordinates[1]], {
            radius: 13,
            fillColor: color,
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.95,
          });
          marker.bindTooltip(`<b>Zone ${z.number} — ${z.name}</b><br/>Readiness: ${z.readinessScore}%`, {
            direction: 'top',
          });
          marker.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;">
              <b>Zone ${z.number} — ${z.name}</b><br/>
              Readiness: <b>${z.readinessScore}%</b><br/>
              Pending tasks: ${z.pendingTaskCount}<br/>
              Duty Officer: ${z.officerName}
            </div>`,
          );
          marker.addTo(map);
          leafletOverlaysRef.current.push(marker);
        });
      }

      if (showShelters) {
        shelters.forEach((s) => {
          const marker = L.circleMarker([s.coordinates[0], s.coordinates[1]], {
            radius: 10,
            fillColor: '#2FBF71',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.95,
          });
          marker.bindTooltip(`<b>Shelter: ${s.name}</b><br/>Capacity: ${s.capacity}`, { direction: 'top' });
          marker.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;">
              <b>🏠 ${s.name}</b><br/>
              ${s.zoneName}<br/>
              Occupancy: <b>${s.currentOccupancy}/${s.capacity}</b><br/>
              Status: ${s.status}
            </div>`,
          );
          marker.addTo(map);
          leafletOverlaysRef.current.push(marker);
        });
      }

      if (showAssets) {
        assets.forEach((a) => {
          const color = a.status === 'ready' ? '#2E9CCA' : a.status === 'critical' ? '#E4572E' : '#F2B138';
          const marker = L.circleMarker([a.coordinates[0], a.coordinates[1]], {
            radius: 9,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.95,
          });
          marker.bindTooltip(`<b>${a.name}</b><br/>${a.status}`, { direction: 'top' });
          marker.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;">
              <b>⚡ ${a.name}</b><br/>
              ${a.qrId} • ${a.zoneName}<br/>
              Status: <b>${a.status}</b><br/>
              Location: ${a.location}
            </div>`,
          );
          marker.addTo(map);
          leafletOverlaysRef.current.push(marker);
        });
      }

      const activeHotspots = activeCity?.hotspots && activeCity.hotspots.length > 0 ? activeCity.hotspots : FLOOD_HOTSPOTS;
      if (showFloodHotspots) {
        activeHotspots.forEach((hs) => {
          const circle = L.circle([hs.lat, hs.lng], {
            radius: hs.radius,
            color: '#E4572E',
            fillColor: '#E4572E',
            fillOpacity: 0.25,
            weight: 2,
            dashArray: '5, 5',
          });
          circle.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px;color:#0B1220;">
              <b style="color:#E4572E;">⚠️ FLOOD HOTSPOT</b><br/>
              <b>${hs.name}</b><br/>
              Severity: ${hs.severity}<br/>
              Radius: ${hs.radius}m
            </div>`,
          );
          circle.addTo(map);
          leafletOverlaysRef.current.push(circle);
        });
      }
    }
  }, [ready, engine, zones, shelters, assets, showZones, showShelters, showAssets, showFloodHotspots, navigateTo]);

  // Handle saving new Google Maps API Key
  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (isGoogleOAuthClientId(trimmed)) {
      setKeyNotice('Warning: This is a Google OAuth Client ID (used for login), not a Google Maps API Key. A Maps API key begins with "AIzaSy...".');
      return;
    }
    if (trimmed) {
      localStorage.setItem('recq360_google_maps_key', trimmed);
      setKeyNotice('API Key saved successfully! Reloading Google Maps...');
    } else {
      localStorage.removeItem('recq360_google_maps_key');
      setKeyNotice('Saved key cleared.');
    }
    setTimeout(() => {
      setShowKeyModal(false);
      setKeyNotice('');
      initGoogleMaps(trimmed);
    }, 700);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Top Header & Tactical Controls */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2E9CCA]" />
            <span>Interactive Tactical Map — {activeCity ? activeCity.name : 'Greater Visakhapatnam'} ({activeState?.name || 'Global Grid'})</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${engine === 'google' ? 'bg-[#2FBF71] animate-ping' : 'bg-[#2E9CCA]'}`} />
              <b className={engine === 'google' ? 'text-[#2FBF71]' : 'text-[#2E9CCA]'}>
                {engine === 'google' ? 'Google Maps Live Engine' : 'Tactical GIS Basemap (Esri High-Contrast Dark)'}
              </b>
            </span>
            <span>•</span>
            <span className="text-slate-300">{activeCity?.primaryHazard || 'Multi-Hazard Grid'}</span>
            <span>•</span>
            <span>{zones.length} zones, {shelters.length} cyclone shelters, {assets.length} critical assets</span>
          </p>
        </div>

        {/* Engine Switcher, Layer Controls, and Key Setting */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Engine Selector */}
          <div className="flex items-center bg-[#0B1220] border border-white/10 rounded p-0.5">
            <button
              onClick={() => {
                if (engine !== 'google') {
                  initGoogleMaps();
                }
              }}
              className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                engine === 'google' ? 'bg-[#2E9CCA] text-[#0B1220] font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Google Maps
            </button>
            <button
              onClick={() => {
                if (engine !== 'leaflet') {
                  initLeaflet();
                }
              }}
              className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                engine === 'leaflet' ? 'bg-[#2E9CCA] text-[#0B1220] font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Tactical GIS
            </button>
          </div>

          {/* Engine Sub-Style Toggles */}
          {engine === 'google' ? (
            <button
              onClick={() => setGoogleTheme((prev) => (prev === 'dark' ? 'natural' : 'dark'))}
              className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0B1220] text-slate-300 hover:text-white transition-all flex items-center gap-1"
              title="Toggle Google Maps styling between Dark Tactical and Natural Roads"
            >
              <Compass className="w-3.5 h-3.5 text-[#2E9CCA]" />
              <span>{googleTheme === 'dark' ? 'Dark Tactical' : 'Standard Google'}</span>
            </button>
          ) : (
            <select
              value={leafletLayer}
              onChange={(e) => setLeafletLayer(e.target.value as any)}
              className="px-2.5 py-1 rounded border border-white/10 bg-[#0B1220] text-slate-300 text-xs focus:outline-none"
            >
              <option value="dark">Esri Dark Canvas</option>
              <option value="satellite">Esri Satellite</option>
              <option value="streets">OpenStreetMap</option>
            </select>
          )}

          {/* Layer Filter Toggles */}
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showZones ? 'bg-[#2E9CCA]/20 border-[#2E9CCA] text-[#2E9CCA]' : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Zones ({zones.length})
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showShelters ? 'bg-[#2FBF71]/20 border-[#2FBF71] text-[#2FBF71]' : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Shelters ({shelters.length})
          </button>
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showAssets ? 'bg-[#F2B138]/20 border-[#F2B138] text-[#F2B138]' : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setShowFloodHotspots(!showFloodHotspots)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showFloodHotspots ? 'bg-[#E4572E]/20 border-[#E4572E] text-[#E4572E]' : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Flood Hotspots
          </button>

          {/* Key Settings Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-2.5 py-1.5 rounded border border-[#2E9CCA]/40 bg-[#2E9CCA]/10 text-[#2E9CCA] hover:bg-[#2E9CCA]/20 transition-all flex items-center gap-1.5"
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Map Key</span>
          </button>
        </div>
      </div>

      {/* Auth Notice Alert if Google Maps encounters key restriction */}
      {gmapsAuthError && engine === 'google' && (
        <div className="bg-[#E4572E]/15 border border-[#E4572E]/50 rounded-lg p-3 text-xs flex items-center justify-between gap-4 text-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E4572E] shrink-0" />
            <span>
              Google Maps Authentication Notice: Google requires a valid Maps JavaScript API Key (starts with <code>AIzaSy...</code>) for unrestricted satellite & street map tiles.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-2.5 py-1 bg-[#E4572E] text-white rounded font-semibold hover:bg-[#E4572E]/80 transition-all"
            >
              Add Maps Key
            </button>
            <button
              onClick={initLeaflet}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-all"
            >
              Use Tactical GIS
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas Viewport */}
      <div className="flex-1 bg-[#0B1220] border border-white/10 rounded-lg overflow-hidden shadow-2xl relative min-h-[520px]">
        <div ref={containerRef} className="w-full h-full min-h-[520px]" style={{ minHeight: '520px' }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-400 bg-[#0B1220]/80">
            {mapError ? `Map status: ${mapError}` : 'Initialising live map engine…'}
          </div>
        )}
      </div>

      {/* Google Maps Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0F1A2E] border border-white/15 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2E9CCA]/10 border border-[#2E9CCA]/30 flex items-center justify-center text-[#2E9CCA]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Google Maps API Configuration</h3>
                  <p className="text-xs text-slate-400 font-mono">Live Google Maps JavaScript API</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setKeyNotice('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p>
                Enter your Google Maps JavaScript API key below. The key is securely saved in your browser&apos;s local storage and used immediately for Google Maps rendering.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Google Maps API Key (Starts with <code className="text-[#2E9CCA]">AIzaSy...</code>):
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSyB..."
                  className="w-full bg-[#0B1220] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2E9CCA]"
                />
              </div>

              {keyNotice && (
                <div className="p-2.5 rounded bg-[#F2B138]/10 border border-[#F2B138]/30 text-[#F2B138] text-[11px]">
                  {keyNotice}
                </div>
              )}

              <div className="bg-[#152238] border border-white/10 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#2E9CCA]" />
                  <span>Important Difference:</span>
                </div>
                <p>
                  • <b>Google OAuth Client ID</b> (e.g. <code>182659964355-...apps.googleusercontent.com</code>) is used for <b>User Sign-In</b>, not maps.
                </p>
                <p>
                  • <b>Google Maps API Key</b> begins with <code>AIzaSy...</code> and is created under <b>Google Cloud Console &gt; APIs &amp; Services &gt; Credentials &gt; API Key</b> with the <b>&quot;Maps JavaScript API&quot;</b> enabled.
                </p>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#2E9CCA] hover:underline pt-1"
                >
                  <span>Open Google Cloud Maps Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setInputKey('');
                  localStorage.removeItem('recq360_google_maps_key');
                  setKeyNotice('Key cleared. Click Save to apply.');
                }}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-2 bg-gradient-to-r from-[#2E9CCA] to-[#7C5CFC] hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save &amp; Reload Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
