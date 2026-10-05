import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { LandingView } from "./views/LandingView";
import { OverviewView } from "./views/OverviewView";
import { ZoneDetailView } from "./views/ZoneDetailView";
import { AssetManagementView } from "./views/AssetManagementView";
import { ShelterManagementView } from "./views/ShelterManagementView";
import { MapView } from "./views/MapView";
import { InspectionView } from "./views/InspectionView";
import { AlertsView } from "./views/AlertsView";
import { AiAssistantView } from "./views/AiAssistantView";
import { ReportsView } from "./views/ReportsView";
import { AdminView } from "./views/AdminView";
import { Toaster } from "./components/ui/sonner";

function CurrentView() {
  const { activeTab, perms } = useApp();

  // A role can only render the tabs its permissions allow.
  if (!perms.tabs.includes(activeTab)) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-white/10 bg-[#0F1A2E] p-6">
          <h2 className="font-display text-lg font-semibold text-white">Access restricted</h2>
          <p className="mt-2 text-xs text-slate-400">
            Your assigned role does not have access to this module. Contact the Commissioner if you
            need wider access.
          </p>
        </div>
      </div>
    );
  }

  switch (activeTab) {
    case "zone-detail":
      return <ZoneDetailView />;
    case "assets":
      return <AssetManagementView />;
    case "shelters":
      return <ShelterManagementView />;
    case "map":
      return <MapView />;
    case "inspections":
      return <InspectionView />;
    case "alerts":
      return <AlertsView />;
    case "ai":
      return <AiAssistantView />;
    case "reports":
      return <ReportsView />;
    case "admin":
      return <AdminView />;
    default:
      return <OverviewView />;
  }
}

function RECQ360() {
  const { activeTab } = useApp();

  if (activeTab === "landing") {
    return <LandingView />;
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white font-sans flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">
          <CurrentView />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RECQ360 />
      <Toaster richColors position="top-right" />
    </AppProvider>
  );
}
