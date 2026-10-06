import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  ShieldCheck,
  ArrowRight,
  Activity,
  Map as MapIcon,
  Boxes,
  Home,
  Brain,
  ClipboardCheck,
  FileBarChart,
  Waves,
  X,
  Lock,
  Siren,
  Gauge,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoginView } from './LoginView';
import { INITIAL_ZONES, INITIAL_ALERTS, INITIAL_DEPARTMENT_STATS } from '../data/seedData';

/* --------------------------------- helpers -------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const statusTone: Record<string, string> = {
  ready: 'text-[#2FBF71] border-[#2FBF71]/40 bg-[#2FBF71]/10',
  pending: 'text-[#F2B138] border-[#F2B138]/40 bg-[#F2B138]/10',
  critical: 'text-[#E4572E] border-[#E4572E]/40 bg-[#E4572E]/10',
};

const barTone = (score: number) =>
  score < 60 ? 'bg-[#E4572E]' : score < 80 ? 'bg-[#F2B138]' : 'bg-[#2FBF71]';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
}

/* ------------------------------- sub-sections ------------------------------ */

const GlassNav: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#0B1220]/70 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2E9CCA] to-[#7C5CFC] flex items-center justify-center font-display font-bold text-white text-sm glow-cyan">
          RQ
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold tracking-wider text-white text-sm sm:text-base">
            RECQ360
          </div>
          <div className="font-mono text-[9px] tracking-widest text-[#2E9CCA] uppercase">
            Command Center
          </div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] uppercase tracking-widest text-slate-400">
        <a href="#preview" className="hover:text-[#2E9CCA] transition-colors">Live Preview</a>
        <a href="#capabilities" className="hover:text-[#2E9CCA] transition-colors">Capabilities</a>
        <a href="#security" className="hover:text-[#2E9CCA] transition-colors">Governance</a>
      </nav>

      <button
        onClick={onLogin}
        className="group inline-flex items-center gap-2 rounded-lg border border-[#2E9CCA]/40 bg-[#2E9CCA]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-[#2E9CCA] transition-all hover:bg-[#2E9CCA] hover:text-[#0B1220]"
      >
        <Lock className="w-3.5 h-3.5" />
        Officer Login
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  </header>
);

const Hero: React.FC<{ onLogin: () => void; readiness: number }> = ({ onLogin, readiness }) => {
  const clock = useClock();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* animated cyclone field */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#152238_1px,transparent_1px)] [background-size:26px_26px] opacity-40" />
        <motion.div
          aria-hidden
          className="absolute -top-40 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-[#2E9CCA]/10"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(46,156,202,0.16), transparent 35%, rgba(124,92,252,0.14) 60%, transparent 85%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#7C5CFC]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#2E9CCA]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="max-w-3xl"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#2FBF71]/30 bg-[#2FBF71]/10 px-3 py-1 font-mono text-[10px] text-[#2FBF71]">
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE • DISASTER RESPONSE GRID • {clock} IST
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            Cyclone readiness for
            <span className="block bg-gradient-to-r from-[#2E9CCA] via-[#61d0f5] to-[#7C5CFC] bg-clip-text text-transparent">
              Greater Visakhapatnam.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            A single operational picture across 10 municipal zones — shelters, heavy assets, field
            inspections and AI tactical guidance — so the Commissioner and every Zone Officer act on
            the same live truth before landfall.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onLogin}
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2E9CCA] to-[#7C5CFC] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-[0_0_28px_rgba(46,156,202,0.5)]"
            >
              Enter Command Center
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-colors hover:border-[#2E9CCA]/50 hover:text-white"
            >
              <Activity className="h-4 w-4 text-[#2E9CCA]" />
              See the live dashboard
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Municipal Zones', value: '10' },
              { label: 'City Readiness', value: `${readiness}%` },
              { label: 'Tracked Assets', value: 'QR-Tagged' },
              { label: 'Sync Latency', value: '<1s' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 backdrop-blur-xl"
              >
                <div className="font-display text-xl font-bold text-white">{s.value}</div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const PreviewSidebar: React.FC = () => {
  const items = [
    { icon: Gauge, label: 'Overview' },
    { icon: MapIcon, label: 'Live Map' },
    { icon: Boxes, label: 'Assets' },
    { icon: Home, label: 'Shelters' },
    { icon: ClipboardCheck, label: 'Inspections' },
    { icon: Siren, label: 'Alerts' },
    { icon: Brain, label: 'RECA AI' },
    { icon: FileBarChart, label: 'Reports' },
  ];
  return (
    <div className="hidden w-14 shrink-0 flex-col gap-1 border-r border-white/10 bg-[#0B1220]/60 py-3 sm:flex">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`group relative mx-2 flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
            i === 0 ? 'bg-[#2E9CCA]/15 text-[#2E9CCA]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <it.icon className="h-4 w-4 shrink-0" />
          <span className="pointer-events-none absolute left-11 z-20 whitespace-nowrap rounded-md border border-white/10 bg-[#0F1A2E] px-2 py-1 font-mono text-[10px] text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const DashboardPreview: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { zones: liveZones, alerts: liveAlerts, departmentStats: liveDepts } = useApp();

  const zones = liveZones.length ? liveZones : INITIAL_ZONES;
  const alerts = (liveAlerts.length ? liveAlerts : INITIAL_ALERTS).filter((a) => !a.resolved).slice(0, 4);
  const depts = (liveDepts.length ? liveDepts : INITIAL_DEPARTMENT_STATS).slice(0, 5);

  const readiness = Math.round(zones.reduce((a, z) => a + z.readinessScore, 0) / (zones.length || 1));
  const critical = zones.filter((z) => z.status === 'critical').length;
  const ready = zones.filter((z) => z.status === 'ready').length;
  const pending = zones.filter((z) => z.status === 'pending').length;

  const kpis = [
    { label: 'City Readiness', value: `${readiness}%`, tone: 'text-[#2E9CCA]', icon: Gauge },
    { label: 'Zones Ready', value: `${ready}/${zones.length}`, tone: 'text-[#2FBF71]', icon: ShieldCheck },
    { label: 'Action Pending', value: String(pending), tone: 'text-[#F2B138]', icon: ClipboardCheck },
    { label: 'Critical Zones', value: String(critical), tone: 'text-[#E4572E]', icon: Siren },
  ];

  return (
    <section id="preview" className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#2E9CCA]">
              Read-only preview
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              The Emergency Operations picture
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Explore the interface below. Sign in with your official Google account to interact,
              override statuses and dispatch alerts.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400 backdrop-blur-xl">
            <Lock className="h-3 w-3" /> Interaction locked
          </div>
        </div>

        {/* device frame */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F1A2E]/70 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#0B1220]/70 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E4572E]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F2B138]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2FBF71]/70" />
            <div className="ml-3 truncate font-mono text-[10px] text-slate-500">
              recq360 / command / commissioner-overview
            </div>
          </div>

          <div className="flex">
            <PreviewSidebar />

            <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                        {k.label}
                      </span>
                      <k.icon className={`h-3.5 w-3.5 ${k.tone}`} />
                    </div>
                    <div className={`mt-2 font-display text-2xl font-bold ${k.tone}`}>{k.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                {/* map panel */}
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#08182b] lg:col-span-3">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(46,156,202,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(46,156,202,0.07)_1px,transparent_1px)] [background-size:34px_34px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(124,92,252,0.18),transparent_60%)]" />
                  {[
                    { top: '28%', left: '35%', tone: 'bg-[#E4572E]' },
                    { top: '55%', left: '58%', tone: 'bg-[#F2B138]' },
                    { top: '42%', left: '72%', tone: 'bg-[#2FBF71]' },
                    { top: '68%', left: '28%', tone: 'bg-[#2E9CCA]' },
                  ].map((p, i) => (
                    <span key={i} className="absolute" style={{ top: p.top, left: p.left }}>
                      <motion.span
                        className={`block h-2.5 w-2.5 rounded-full ${p.tone}`}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
                      />
                    </span>
                  ))}
                  <div className="relative flex h-full min-h-[240px] flex-col justify-between p-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#2E9CCA]">
                      <Waves className="h-3.5 w-3.5" /> Coastal threat map • Bay of Bengal
                    </div>
                    <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                      {['Zones', 'Shelters', 'Assets', 'Flood hotspots'].map((l) => (
                        <span key={l} className="rounded border border-white/10 bg-[#0B1220]/70 px-2 py-1">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* alerts */}
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-xl lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      Active alerts
                    </span>
                    <Siren className="h-3.5 w-3.5 text-[#E4572E]" />
                  </div>
                  <div className="space-y-2">
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-md border border-white/10 bg-[#0B1220]/60 p-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate text-[12px] font-semibold text-white">{a.title}</div>
                          <span
                            className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase ${
                              a.severity === 'critical'
                                ? statusTone['critical']
                                : a.severity === 'warning'
                                  ? statusTone['pending']
                                  : statusTone['ready']
                            }`}
                          >
                            {a.severity}
                          </span>
                        </div>
                        <div className="mt-1 truncate font-mono text-[10px] text-slate-500">
                          {a.zoneName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* zone readiness + departments */}
              <div className="grid gap-4 lg:grid-cols-5">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-xl lg:col-span-3">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    Zone readiness index
                  </div>
                  <div className="space-y-2.5">
                    {zones.slice(0, 6).map((z, i) => (
                      <div key={z.id} className="flex items-center gap-3">
                        <div className="w-32 shrink-0 truncate font-mono text-[10px] text-slate-300">
                          {z.name}
                        </div>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className={`h-full rounded-full ${barTone(z.readinessScore)}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${z.readinessScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, delay: i * 0.05 }}
                          />
                        </div>
                        <div className="w-9 shrink-0 text-right font-mono text-[10px] text-white">
                          {z.readinessScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-xl lg:col-span-2">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    Department progress
                  </div>
                  <div className="space-y-2">
                    {depts.map((d) => (
                      <div key={d.department} className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] text-slate-300">{d.department}</span>
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${
                            d.completionRate < 60
                              ? statusTone['critical']
                              : d.completionRate < 80
                                ? statusTone['pending']
                                : statusTone['ready']
                          }`}
                        >
                          {d.completionRate}%

                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* interaction lock */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-28 items-end justify-center bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent pb-5 sm:flex">
            <button
              onClick={onLogin}
              className="pointer-events-auto group inline-flex items-center gap-2 rounded-lg border border-[#2E9CCA]/40 bg-[#0B1220]/90 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-[#2E9CCA] backdrop-blur-xl transition-all hover:bg-[#2E9CCA] hover:text-[#0B1220]"
            >
              <Lock className="h-3.5 w-3.5" />
              Sign in to interact
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const CAPABILITIES = [
  {
    icon: Brain,
    title: 'RECA — Tactical AI Assistant',
    body: 'Ask RECA plain-language questions about zone gaps, get prioritised pre-landfall actions and drafted advisories.',
  },
  {
    icon: MapIcon,
    title: 'Live Threat Map',
    body: 'Google Maps overlays for zones, shelters, heavy assets and known flood hotspots across the city coastline.',
  },
  {
    icon: Boxes,
    title: 'QR Asset Readiness',
    body: 'Pumps, generators, boats, JCBs and ambulances tracked with inspection history and instant status overrides.',
  },
  {
    icon: Home,
    title: 'Shelter Capacity',
    body: 'Occupancy, supplies and accessibility per relief centre, updated by field officers in real time.',
  },
  {
    icon: ClipboardCheck,
    title: 'Field Inspections',
    body: 'Geo-tagged, photo-backed checklist submissions that roll straight into the zone readiness index.',
  },
  {
    icon: FileBarChart,
    title: 'Commissioner Reports',
    body: 'One-click readiness briefs with department breakdowns and a tamper-evident audit trail.',
  },
];

const Capabilities: React.FC = () => (
  <section id="capabilities" className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6">
    <div className="mb-8">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#2E9CCA]">Capabilities</div>
      <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
        Built for the hours that matter
      </h2>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CAPABILITIES.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: (i % 3) * 0.08 }}
          className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#2E9CCA]/40 hover:shadow-[0_0_30px_-8px_rgba(46,156,202,0.45)]"
        >
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2E9CCA]/30 bg-[#2E9CCA]/10 text-[#2E9CCA]">
            <c.icon className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base font-semibold text-white">{c.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{c.body}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

const Governance: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <section id="security" className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0F1A2E] via-[#152238] to-[#0F1A2E] p-6 backdrop-blur-2xl sm:p-10"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#2E9CCA]/10 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#2E9CCA]">
            Governance & access
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
            Role-based, audited, official-account only
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Access is granted through official Google accounts and scoped by role — from
            Commissioner-level city oversight down to read-only observers. Every override, alert
            action and inspection is written to a tamper-evident audit trail.
          </p>
          <button
            onClick={onLogin}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2E9CCA] to-[#7C5CFC] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_28px_rgba(46,156,202,0.5)]"
          >
            <ShieldCheck className="h-4 w-4" />
            Sign in with Google
          </button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            ['Commissioner', 'City-wide oversight & overrides'],
            ['Zone Officer', 'Zone readiness & escalation'],
            ['Department Officer', 'Assets, shelters, checklists'],
            ['Field Inspector', 'Geo-tagged submissions'],
            ['Admin', 'Roles, templates, audit'],
            ['Viewer', 'Read-only situational access'],
          ].map(([role, desc]) => (
            <div
              key={role}
              className="rounded-lg border border-white/10 bg-[#0B1220]/60 p-3"
            >
              <div className="font-mono text-[11px] uppercase tracking-widest text-[#2E9CCA]">
                {role}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-[#0B1220]/80">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        RECQ360 Disaster Management Command Center
      </div>
      <div className="font-mono text-[10px] text-slate-600">
        RECQ360 — operational readiness platform
      </div>
    </div>
  </footer>
);

/* --------------------------------- screen --------------------------------- */

export const LandingView: React.FC = () => {
  const { zones, navigateTo } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  const readiness = useMemo(() => {
    const src = zones.length ? zones : INITIAL_ZONES;
    return Math.round(src.reduce((a, z) => a + z.readinessScore, 0) / (src.length || 1));
  }, [zones]);

  useEffect(() => {
    document.body.style.overflow = showLogin ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogin]);

  const open = () => {
    navigateTo('login');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] font-sans text-white selection:bg-[#2E9CCA] selection:text-white">
      <GlassNav onLogin={open} />
      <main>
        <Hero onLogin={open} readiness={readiness} />
        <DashboardPreview onLogin={open} />
        <Capabilities />
        <Governance onLogin={open} />
      </main>
      <Footer />

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#0B1220]/85 backdrop-blur-md"
          >
            <button
              onClick={() => setShowLogin(false)}
              aria-label="Close sign in"
              className="fixed right-4 top-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 backdrop-blur-xl transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22 }}
            >
              <LoginView />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
