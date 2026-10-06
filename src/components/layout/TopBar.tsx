import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { roleLabel, type AppRole } from '../../lib/roles';
import {
  ShieldAlert,
  Clock,
  Radio,
  UserCheck,
  ChevronDown,
  Bell,
  Sparkles,
  MapPin,
  Globe,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    appRole,
    perms,
    alerts,
    navigateTo,
    triggerSimulatedAlert,
    signOut,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    selectedCountryId,
    selectedStateId,
    selectedCityId,
    activeCity,
    activeState,
    activeCountry,
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
    availableCountries,
    availableStates,
    availableCitiesForState,
    allCities,
  } = useApp();
  const [timeString, setTimeString] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('en-IN', { hour12: false });
      setTimeString(`${day}-${month}-${year} ${time} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCriticalAlerts = alerts.filter((a) => !a.resolved && a.severity === 'critical');

  return (
    <header className="sticky top-0 z-40 bg-[#0F1A2E]/95 backdrop-blur border-b border-white/10 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-lg">
      {/* Left branding & live warning info */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded bg-[#E4572E]/20 border border-[#E4572E]/40 text-[#E4572E]">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E4572E] animate-ping" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-sm tracking-wide text-white leading-tight">
              RECQ360
            </h1>
            <p className="text-[11px] font-mono text-slate-400">
              {activeCity ? `${activeCity.name} Disaster Grid` : 'Global Disaster Grid'}
            </p>
          </div>
        </div>

        {/* Global Cascading Location Selector: Country -> State -> City */}
        <div className="flex items-center gap-1.5 bg-[#0B1220] border border-[#2E9CCA]/40 rounded-lg px-2 py-1 text-xs font-mono shadow-inner max-w-full overflow-x-auto">
          {/* Country Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#2E9CCA] shrink-0" />
            <select
              value={selectedCountryId}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs py-0.5 px-1 rounded focus:outline-none focus:bg-[#152238] cursor-pointer"
              title="Choose Country (All Countries gives global access)"
            >
              <option value="all" className="bg-[#0F1A2E] text-[#2E9CCA] font-bold">
                🌐 All Countries
              </option>
              {availableCountries
                .filter((c) => c !== 'all')
                .map((country) => (
                  <option key={country} value={country} className="bg-[#0F1A2E] text-white">
                    {country}
                  </option>
                ))}
            </select>
          </div>

          <span className="text-slate-500 font-mono">/</span>

          {/* State Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#F2B138] shrink-0" />
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs py-0.5 px-1 rounded focus:outline-none focus:bg-[#152238] cursor-pointer"
              title="Choose State / Region"
            >
              <option value="all" className="bg-[#0F1A2E] text-[#F2B138] font-bold">
                🗺️ All States
              </option>
              {availableStates.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#0F1A2E] text-white">
                  {st.name} {selectedCountryId === 'all' ? `(${st.country})` : ''}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-mono">/</span>

          {/* City Selector: Can select ANY city without being locked by Overview */}
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#2E9CCA]/15 text-[#2E9CCA] font-bold text-xs py-0.5 px-1.5 rounded border border-[#2E9CCA]/30 focus:outline-none focus:bg-[#2E9CCA] focus:text-[#0B1220] cursor-pointer max-w-[170px] truncate"
            title={`Active City: ${activeCity?.name} (${activeCity?.state}, ${activeCity?.country})`}
          >
            {selectedStateId !== 'all' ? (
              <>
                <optgroup label={`${activeState?.name} Cities`}>
                  {availableCitiesForState.map((ct) => (
                    <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-white">
                      {ct.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌐 All Other Global Cities">
                  {allCities
                    .filter((ct) => !availableCitiesForState.some((c) => c.id === ct.id))
                    .map((ct) => (
                      <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-slate-300">
                        {ct.name} ({ct.state}, {ct.country})
                      </option>
                    ))}
                </optgroup>
              </>
            ) : selectedCountryId !== 'all' ? (
              <>
                <optgroup label={`${selectedCountryId} Cities`}>
                  {availableCitiesForState.map((ct) => (
                    <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-white">
                      {ct.name} ({ct.state})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌐 All Other Global Cities">
                  {allCities
                    .filter((ct) => !availableCitiesForState.some((c) => c.id === ct.id))
                    .map((ct) => (
                      <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-slate-300">
                        {ct.name} ({ct.state}, {ct.country})
                      </option>
                    ))}
                </optgroup>
              </>
            ) : (
              allCities.map((ct) => (
                <option key={ct.id} value={ct.id} className="bg-[#0F1A2E] text-white">
                  {ct.name} — {ct.state} ({ct.country})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Dynamic Threat / Advisory Badge + Timing beside it */}
        {activeCity && (
          <div className="hidden lg:flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono ${
                activeCity.advisorySeverity === 'critical'
                  ? 'border-[#E4572E]/40 bg-[#E4572E]/10 text-[#E4572E] glow-red'
                  : activeCity.advisorySeverity === 'warning'
                  ? 'border-[#F2B138]/40 bg-[#F2B138]/10 text-[#F2B138]'
                  : 'border-[#2E9CCA]/40 bg-[#2E9CCA]/10 text-[#2E9CCA]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{activeCity.currentAdvisory}</span>
            </div>

            {/* Live Timing directly beside the Advisory */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1220] border border-white/10 text-slate-300 font-mono text-xs shadow-inner">
              <Clock className="w-3.5 h-3.5 text-[#2E9CCA]" />
              <span>{timeString}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Live Grid Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#2FBF71]/10 border border-[#2FBF71]/30 text-[#2FBF71] font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#2FBF71] animate-ping" />
          <span>GRID ONLINE</span>
        </div>

        {/* Live notification inbox */}
        <div className="relative">
          <button
            onClick={() => {
              setShowInbox((v) => !v);
              setShowUserDropdown(false);
            }}
            className="relative p-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E4572E] text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showInbox && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0F1A2E] border border-white/15 rounded-md shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">
                  Notifications {unreadCount > 0 && `• ${unreadCount} new`}
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[10px] font-mono text-[#2E9CCA] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="px-3 py-6 text-center text-xs font-mono text-slate-500">
                    No notifications yet
                  </div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (n.linkTab) navigateTo(n.linkTab);
                      setShowInbox(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-[#152238] transition-colors ${
                      n.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#2E9CCA]" />}
                      <span className="text-xs font-medium text-white">{n.title}</span>
                    </div>
                    {n.body && <div className="text-[11px] text-slate-400 mt-0.5">{n.body}</div>}
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active critical alerts shortcut */}
        <button
          onClick={() => navigateTo('alerts')}
          className="relative p-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-300 transition-colors"
          title="View Active Alerts"
        >
          <ShieldAlert className="w-4 h-4 text-slate-300" />
          {activeCriticalAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E4572E] text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
              {activeCriticalAlerts.length}
            </span>
          )}
        </button>

        {/* Field Advisory Broadcast Button */}
        {perms.raiseAlerts && (
        <button
          onClick={triggerSimulatedAlert}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#E4572E]/15 hover:bg-[#E4572E]/25 border border-[#E4572E]/40 text-[#E4572E] text-xs font-mono transition-colors"
          title="Dispatch Live Coastal Telemetry Advisory"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Broadcast Advisory</span>
        </button>
        )}

        {/* Quick AI shortcut button */}
        {perms.tabs.includes('ai') && (
        <button
          onClick={() => navigateTo('ai')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 border border-[#7C5CFC]/40 text-[#7C5CFC] text-xs font-mono font-medium transition-colors glow-violet"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Tactical</span>
        </button>
        )}

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-slate-200 transition-colors"
          >
            {currentUser.avatar?.startsWith('http') ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-cyan-500/50"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-[#2E9CCA]/20 border border-cyan-500/50 text-[10px] font-mono text-[#2E9CCA] flex items-center justify-center">
                {currentUser.avatar}
              </span>
            )}
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-white line-clamp-1 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-mono text-[#2E9CCA] uppercase">
                {roleLabel((appRole ?? 'viewer') as AppRole)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0F1A2E] border border-white/15 rounded-md shadow-2xl z-50 py-1.5">
              <div className="px-3 py-2 border-b border-white/10 space-y-1">
                <div className="text-xs font-medium text-white">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-slate-400 break-all">{currentUser.email}</div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2E9CCA]/15 border border-[#2E9CCA]/30 text-[10px] font-mono text-[#2E9CCA]">
                  <UserCheck className="w-3 h-3" />
                  <span>{roleLabel((appRole ?? 'viewer') as AppRole)}</span>
                </div>
                {currentUser.zoneId && (
                  <div className="text-[10px] font-mono text-slate-400">Zone: {currentUser.zoneId}</div>
                )}
                {currentUser.department && (
                  <div className="text-[10px] font-mono text-slate-400">Dept: {currentUser.department}</div>
                )}
              </div>
              <div className="px-3 py-2 text-[10px] font-mono text-slate-500 leading-relaxed border-b border-white/10">
                Roles are assigned centrally by the Commissioner and cannot be changed here.
              </div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  void signOut();
                }}
                className="w-full text-left px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
