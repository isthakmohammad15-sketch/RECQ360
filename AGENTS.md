# RECQ360 Disaster Management Command Center

This project is a high-performance **Vite + React** application configured for deployment on **Vercel**.

## Architecture
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Radix UI + Lucide Icons
- **Backend / Real-time**: Supabase (PostgreSQL with real-time replication)
- **Deployment**: Vercel (Preset: Vite) with static CDN hosting from `/dist` and serverless functions in `/api`
- **Mapping**: Leaflet tactical dark basemap (offline-first fallback) + Google Maps JavaScript API
- **AI Support**: Google Gemini (`gemini-flash-latest`) multi-tier operational decision support
