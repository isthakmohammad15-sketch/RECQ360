import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Layers,
  Compass,
  Radio,
  ExternalLink,
  ShieldCheck,
  Building,
  Home,
  Boxes,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = { lat: 17.7285, lng: 83.2885 };

const FLOOD_HOTSPOTS = [
  { id: 'hs-1', name: 'Low-Lying Storm Drainage Basin', lat: 17.7315, lng: 83.306, radius: 600, severity: 'High' },
  { id: 'hs-2', name: 'Underpass Storm Sump Vulnerability', lat: 17.7385, lng: 83.2295, radius: 700, severity: 'Critical' },
  { id: 'hs-3', name: 'Coastal Sea Surge & Erosion Belt', lat: 17.8898, lng: 83.436, radius: 800, severity: 'Extreme' },
  { id: 'hs-4', name: 'Industrial Culvert Stream Inundation', lat: 17.6892, lng: 83.2182, radius: 500, severity: 'High' },
];

// High-performance Tactical GIS Basemaps (100% Free, zero keys, zero watermarks)
const ESRI_DARK_BASE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const ESRI_DARK_REF =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const OSM_STREETS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Custom Crisp Tactical HTML Marker Icons
const createTacticalDivIcon = (color: string, label: string | number, size = 28) => {
  return L.divIcon({
    className: 'recq-tactical-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: ${size > 26 ? 11 : 10}px;
        box-shadow: 0 0 10px ${color}88, 0 3px 6px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export const MapView: React.FC = () => {
  const {
    zones,
    shelters,
    assets,
    navigateTo,
    activeCity,
    activeState,
    selectedStateId,
    selectedCityId,
    setSelectedState,
    setSelectedCity,
    availableStates,
    availableCitiesForState,
  } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<L.Layer[]>([]);
  const overlaysGroupRef = useRef<L.LayerGroup | null>(null);

  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [ready, setReady] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string>('');

  // Layer filter toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showAssets, setShowAssets] = useState<boolean>(true);
  const [showFloodHotspots, setShowFloodHotspots] = useState<boolean>(true);

  // Fallback to active city's own dataset if available, otherwise global context
  const currentZones = useMemo(() => {
    return (activeCity?.zones && activeCity.zones.length > 0) ? activeCity.zones : zones;
  }, [activeCity, zones]);

  const currentShelters = useMemo(() => {
    return (activeCity?.shelters && activeCity.shelters.length > 0) ? activeCity.shelters : shelters;
  }, [activeCity, shelters]);

  const currentAssets = useMemo(() => {
    return (activeCity?.assets && activeCity.assets.length > 0) ? activeCity.assets : assets;
  }, [activeCity, assets]);

  const currentHotspots = useMemo(() => {
    return (activeCity?.hotspots && activeCity.hotspots.length > 0) ? activeCity.hotspots : FLOOD_HOTSPOTS;
  }, [activeCity]);

  // Expose global navigation handler for popup buttons
  useEffect(() => {
    (window as any).__navZone = (zoneId: string) => navigateTo('zone-detail', { zoneId });
    return () => {
      delete (window as any).__navZone;
    };
  }, [navigateTo]);

  // 1. Initialize Tactical GIS Engine with Leaflet ONCE on mount
  useEffect(() => {
    if (!containerRef.current) return;
    if (leafletMapRef.current) return;

    try {
      const center = activeCity?.center || DEFAULT_CENTER;
      const zoom = activeCity?.zoom || 12;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Create dedicated overlay layer group
      const overlayGroup = L.layerGroup().addTo(map);
      overlaysGroupRef.current = overlayGroup;

      leafletMapRef.current = map;
      setReady(true);
      setMapError('');

      // Invalidate size once layout stabilizes
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 200);

      return () => {
        clearTimeout(timer);
        map.remove();
        leafletMapRef.current = null;
        overlaysGroupRef.current = null;
      };
    } catch (err: any) {
      console.error('[Tactical Map] Error initializing Leaflet:', err);
      setMapError(err.message || 'Failed to initialize Tactical GIS engine.');
    }
  }, []);

  // 2. Manage Basemap Tiles (Swaps layers cleanly WITHOUT destroying the map)
  useEffect(() => {
    if (!leafletMapRef.current || !ready) return;
    const map = leafletMapRef.current;

    // Remove old tile layers
    tileLayersRef.current.forEach((layer) => layer.remove());
    tileLayersRef.current = [];

    if (basemap === 'satellite') {
      const satLayer = L.tileLayer(ESRI_SATELLITE, {
        maxZoom: 18,
        attribution: 'Esri World Imagery',
      }).addTo(map);
      tileLayersRef.current = [satLayer];
    } else if (basemap === 'streets') {
      const osmLayer = L.tileLayer(OSM_STREETS, {
        maxZoom: 19,
        attribution: 'OpenStreetMap',
      }).addTo(map);
      tileLayersRef.current = [osmLayer];
    } else {
      // High-contrast Dark Canvas
      const darkBase = L.tileLayer(ESRI_DARK_BASE, {
        maxZoom: 16,
        attribution: 'Esri Canvas Dark',
      }).addTo(map);
      const darkRef = L.tileLayer(ESRI_DARK_REF, {
        maxZoom: 16,
      }).addTo(map);
      tileLayersRef.current = [darkBase, darkRef];
    }
  }, [basemap, ready]);

  // 3. Smoothly pan/fly whenever active city changes
  useEffect(() => {
    if (!ready || !leafletMapRef.current || !activeCity) return;
    const map = leafletMapRef.current;
    const center = activeCity.center || DEFAULT_CENTER;
    const zoom = activeCity.zoom || 12;

    map.flyTo([center.lat, center.lng], zoom, {
      duration: 0.9,
      easeLinearity: 0.3,
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCity, ready]);

  // Manual recenter
  const handleRecenter = () => {
    if (!leafletMapRef.current || !activeCity) return;
    const center = activeCity.center || DEFAULT_CENTER;
    const zoom = activeCity.zoom || 12;
    leafletMapRef.current.flyTo([center.lat, center.lng], zoom, { duration: 0.7 });
    setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 200);
  };

  // 4. Update overlay markers (Zones, Shelters, Assets, Flood Hotspots)
  useEffect(() => {
    if (!ready || !leafletMapRef.current || !overlaysGroupRef.current) return;
    const group = overlaysGroupRef.current;

    // Clear prior overlays smoothly
    group.clearLayers();

    // 1. ZONES
    if (showZones && currentZones.length > 0) {
      currentZones.forEach((z) => {
        if (!z.coordinates || z.coordinates.length < 2) return;
        const lat = Number(z.coordinates[0]);
        const lng = Number(z.coordinates[1]);
        if (isNaN(lat) || isNaN(lng)) return;

        const color = z.status === 'ready' ? '#2FBF71' : z.status === 'pending' ? '#F2B138' : '#E4572E';
        const icon = createTacticalDivIcon(color, z.number, 28);
        const marker = L.marker([lat, lng], { icon });

        marker.bindTooltip(`<b>Zone ${z.number} — ${z.name}</b><br/>Readiness: ${z.readinessScore}%`, {
          direction: 'top',
        });

        marker.bindPopup(`
          <div style="font-family:system-ui, -apple-system, sans-serif;font-size:12px;color:#0B1220;min-width:210px;padding:3px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#0B1220;">
              Zone ${z.number} — ${z.name}
            </div>
            <div style="margin-bottom:3px;">
              <span style="color:#64748b;">Readiness:</span> <b>${z.readinessScore}%</b> 
              <span style="text-transform:uppercase;color:${color};font-weight:700;">(${z.status})</span>
            </div>
            <div style="margin-bottom:3px;">
              <span style="color:#64748b;">Pending Tasks:</span> <b>${z.pendingTaskCount}</b>
            </div>
            <div style="margin-bottom:6px;">
              <span style="color:#64748b;">Duty Officer:</span> <b>${z.officerName}</b>
            </div>
            <button onclick="window.__navZone && window.__navZone('${z.id}')" style="
              background:#2E9CCA;
              color:#ffffff;
              border:none;
              border-radius:4px;
              padding:5px 10px;
              font-size:11px;
              font-weight:600;
              cursor:pointer;
              width:100%;
            ">
              Open Zone Detail →
            </button>
          </div>
        `);

        group.addLayer(marker);
      });
    }

    // 2. CYCLONE SHELTERS
    if (showShelters && currentShelters.length > 0) {
      currentShelters.forEach((s) => {
        if (!s.coordinates || s.coordinates.length < 2) return;
        const lat = Number(s.coordinates[0]);
        const lng = Number(s.coordinates[1]);
        if (isNaN(lat) || isNaN(lng)) return;

        const icon = createTacticalDivIcon('#2FBF71', 'S', 24);
        const marker = L.marker([lat, lng], { icon });

        marker.bindTooltip(`<b>Shelter: ${s.name}</b><br/>Capacity: ${s.capacity}`, { direction: 'top' });

        marker.bindPopup(`
          <div style="font-family:system-ui, -apple-system, sans-serif;font-size:12px;color:#0B1220;min-width:200px;padding:3px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:3px;">🏠 ${s.name}</div>
            <div style="color:#64748b;margin-bottom:3px;">${s.zoneName}</div>
            <div style="margin-bottom:3px;"><span style="color:#64748b;">Occupancy:</span> <b>${s.currentOccupancy} / ${s.capacity}</b></div>
            <div style="margin-bottom:3px;"><span style="color:#64748b;">Generator:</span> <b>${s.generatorBackup ? 'Available' : 'None'}</b></div>
            ${s.contactPhone ? `<div><span style="color:#64748b;">Phone:</span> <a href="tel:${s.contactPhone}" style="color:#2E9CCA;text-decoration:none;font-weight:600;">${s.contactPhone}</a></div>` : ''}
          </div>
        `);

        group.addLayer(marker);
      });
    }

    // 3. CRITICAL ASSETS
    if (showAssets && currentAssets.length > 0) {
      currentAssets.forEach((a) => {
        if (!a.coordinates || a.coordinates.length < 2) return;
        const lat = Number(a.coordinates[0]);
        const lng = Number(a.coordinates[1]);
        if (isNaN(lat) || isNaN(lng)) return;

        const color = a.status === 'ready' ? '#2E9CCA' : a.status === 'critical' ? '#E4572E' : '#F2B138';
        const icon = createTacticalDivIcon(color, 'A', 22);
        const marker = L.marker([lat, lng], { icon });

        marker.bindTooltip(`<b>${a.name}</b><br/>Status: ${a.status.toUpperCase()}`, { direction: 'top' });

        marker.bindPopup(`
          <div style="font-family:system-ui, -apple-system, sans-serif;font-size:12px;color:#0B1220;min-width:200px;padding:3px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:3px;">⚡ ${a.name}</div>
            <div style="margin-bottom:2px;"><span style="color:#64748b;">QR ID:</span> <code>${a.qrId}</code></div>
            <div style="margin-bottom:2px;"><span style="color:#64748b;">Zone:</span> ${a.zoneName}</div>
            <div style="margin-bottom:2px;"><span style="color:#64748b;">Status:</span> <b style="color:${color};text-transform:uppercase;">${a.status}</b></div>
            <div><span style="color:#64748b;">Location:</span> ${a.location}</div>
          </div>
        `);

        group.addLayer(marker);
      });
    }

    // 4. FLOOD HOTSPOTS
    if (showFloodHotspots && currentHotspots.length > 0) {
      currentHotspots.forEach((hs) => {
        const lat = Number(hs.lat);
        const lng = Number(hs.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const circle = L.circle([lat, lng], {
          radius: hs.radius || 600,
          color: '#E4572E',
          fillColor: '#E4572E',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '6, 6',
        });

        circle.bindPopup(`
          <div style="font-family:system-ui, -apple-system, sans-serif;font-size:12px;color:#0B1220;padding:3px;">
            <b style="color:#E4572E;font-size:12px;">⚠️ FLOOD HOTSPOT AREA</b><br/>
            <b>${hs.name}</b><br/>
            <span style="color:#64748b;">Severity Threat:</span> <b>${hs.severity}</b><br/>
            <span style="color:#64748b;">Buffer Radius:</span> ${hs.radius || 600} meters
          </div>
        `);

        group.addLayer(circle);
      });
    }
  }, [
    ready,
    currentZones,
    currentShelters,
    currentAssets,
    currentHotspots,
    showZones,
    showShelters,
    showAssets,
    showFloodHotspots,
  ]);

  return (
    <div className="p-4 md:p-6 space-y-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Tactical Map Header with Cascading State & City Selectors */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2E9CCA]" />
            <span>
              Interactive Tactical Map — {activeCity ? activeCity.name : 'Greater Visakhapatnam'} (
              {activeState?.name || 'Global Grid'})
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1.5 text-[#2FBF71]">
              <span className="w-2 h-2 rounded-full bg-[#2FBF71] animate-ping" />
              <b>Tactical GIS Engine (Zero-Latency Live Layer)</b>
            </span>
            <span>•</span>
            <span className="text-slate-300">{activeCity?.primaryHazard || 'Multi-Hazard Grid'}</span>
            <span>•</span>
            <span>
              {currentZones.length} zones, {currentShelters.length} shelters, {currentAssets.length} assets
            </span>
          </p>
        </div>

        {/* Tactical Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full xl:w-auto">
          {/* Cascading State & City Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B1220] border border-[#2E9CCA]/50 rounded-lg px-2.5 py-1.5 shadow-inner">
            <MapPin className="w-3.5 h-3.5 text-[#2E9CCA] shrink-0" />

            {/* State Dropdown */}
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs py-0.5 px-1 rounded focus:outline-none focus:bg-[#152238] cursor-pointer"
              title="Select State / Region"
            >
              {availableStates.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#0F1A2E] text-white">
                  {st.name}
                </option>
              ))}
            </select>

            <span className="text-slate-500 font-mono">/</span>

            {/* City Dropdown: ONLY contains cities belonging to selected State */}
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#2E9CCA]/15 text-[#2E9CCA] font-bold text-xs py-0.5 px-1.5 rounded border border-[#2E9CCA]/40 focus:outline-none focus:bg-[#2E9CCA] focus:text-[#0B1220] cursor-pointer"
              title={`Select City in ${activeState?.name || 'this state'}`}
            >
              {availableCitiesForState.map((ct) => (
                <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-white">
                  {ct.name}
                </option>
              ))}
            </select>
          </div>

          {/* Basemap Style Switcher */}
          <div className="flex items-center bg-[#0B1220] border border-white/10 rounded-lg px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2E9CCA] mr-1.5 shrink-0" />
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              title="Change Map Style"
            >
              <option value="dark" className="bg-[#0F1A2E] text-white">
                Dark Tactical
              </option>
              <option value="satellite" className="bg-[#0F1A2E] text-white">
                Satellite Imagery
              </option>
              <option value="streets" className="bg-[#0F1A2E] text-white">
                OpenStreetMap
              </option>
            </select>
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0B1220] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Recenter Map on Active City"
          >
            <Compass className="w-3.5 h-3.5 text-[#2E9CCA]" />
            <span>Recenter</span>
          </button>

          {/* Layer Filter Toggles */}
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showZones
                ? 'bg-[#2E9CCA]/20 border-[#2E9CCA] text-[#2E9CCA] font-bold shadow'
                : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Zones ({currentZones.length})
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showShelters
                ? 'bg-[#2FBF71]/20 border-[#2FBF71] text-[#2FBF71] font-bold shadow'
                : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Shelters ({currentShelters.length})
          </button>
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showAssets
                ? 'bg-[#F2B138]/20 border-[#F2B138] text-[#F2B138] font-bold shadow'
                : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Assets ({currentAssets.length})
          </button>
          <button
            onClick={() => setShowFloodHotspots(!showFloodHotspots)}
            className={`px-2.5 py-1.5 rounded border transition-all ${
              showFloodHotspots
                ? 'bg-[#E4572E]/20 border-[#E4572E] text-[#E4572E] font-bold shadow'
                : 'bg-[#0B1220] border-white/10 text-slate-400'
            }`}
          >
            Flood Hotspots
          </button>
        </div>
      </div>

      {/* Map Canvas Viewport */}
      <div className="flex-1 bg-[#0B1220] border border-white/10 rounded-lg overflow-hidden shadow-2xl relative min-h-[520px]">
        <div ref={containerRef} className="w-full h-full min-h-[520px]" style={{ minHeight: '520px' }} />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-400 bg-[#0B1220]/80">
            {mapError ? `Map status: ${mapError}` : 'Initialising live tactical GIS engine…'}
          </div>
        )}
      </div>
    </div>
  );
};
