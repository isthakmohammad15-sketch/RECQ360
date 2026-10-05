import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle,
  ShieldAlert,
  BarChart2,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { zones, departmentStats, overallReadiness, alerts } = useApp();

  const handleDownloadCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Zone Number,Zone Name,Readiness Score (%),Status,Pending Tasks,Shelters,Population at Risk\n';

    zones.forEach((z) => {
      csvContent += `${z.number},"${z.name}",${z.readinessScore},${z.status},${z.pendingTaskCount},${z.shelterCount},${z.populationAtRisk}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RECQ360_Readiness_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = () => handleDownloadCsv();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1A2E] border border-white/10 rounded-lg p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-[#2E9CCA]" />
            <span className="text-xs font-mono text-[#2E9CCA] uppercase">
              EXECUTIVE REPORT GENERATOR
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Commissioner Briefing & Export
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Formatted readiness dossiers for State Disaster Management Authority (APSDMA) & District Collector
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 rounded bg-[#2FBF71]/20 hover:bg-[#2FBF71]/30 border border-[#2FBF71]/40 text-[#2FBF71] font-mono text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded bg-[#2E9CCA]/20 hover:bg-[#2E9CCA]/30 border border-[#2E9CCA]/40 text-[#2E9CCA] font-mono text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded bg-[#152238] hover:bg-[#1f3152] border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Briefing Card Container */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-6 space-y-6 shadow-2xl">
        <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">
              GREATER VISAKHAPATNAM MUNICIPAL CORPORATION
            </span>
            <h2 className="font-display font-bold text-xl text-white">
              CYCLONE PREPAREDNESS EXECUTED SUMMARY
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Generated on: {new Date().toLocaleDateString('en-IN')} • Target Cyclone: Bay of Bengal Severe Storm
            </p>
          </div>

          <div className="px-4 py-2 rounded bg-[#0B1220] border border-white/10 text-right font-mono">
            <span className="text-slate-400 text-xs">City Preparedness:</span>
            <div className="text-2xl font-bold text-[#2E9CCA]">{overallReadiness}%</div>
          </div>
        </div>

        {/* Executive Recommendations List */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#E4572E]" />
            <span>Top Priority Dispatch Recommendations</span>
          </h3>

          <div className="space-y-2 font-sans text-xs">
            <div className="p-3 rounded bg-[#0B1220] border border-[#E4572E]/30 text-slate-200">
              <span className="font-mono text-[#E4572E] font-bold">1. ZONE 4 (Seethammadhara):</span> Replace failed 150 kVA generator battery at High School Relief Shelter & clear silt from de-watering pumps near HB Colony drain.
            </div>

            <div className="p-3 rounded bg-[#0B1220] border border-[#F2B138]/30 text-slate-200">
              <span className="font-mono text-[#F2B138] font-bold">2. ZONE 7 (Gopalapatnam):</span> Cool down thermal overloaded pump at NAD Underpass and stock 50 emergency food ration kits.
            </div>

            <div className="p-3 rounded bg-[#0B1220] border border-[#2FBF71]/30 text-slate-200">
              <span className="font-mono text-[#2FBF71] font-bold">3. COASTAL BHEEMILI:</span> Maintain 24/7 VHF radio bridge with District Magistrate regarding sea erosion coastal warnings.
            </div>
          </div>
        </div>

        {/* Department Readiness Bar Chart */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#2E9CCA]" />
            <span>Department Readiness Matrix</span>
          </h3>

          <div className="h-64 w-full bg-[#0B1220] p-4 rounded border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} fontFamily="Inter" />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1A2E',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#f8fafc',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completionRate" fill="#2E9CCA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table of Zones for dossier */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="font-display font-semibold text-sm text-white">Zone Preparedness Index Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase">
                  <th className="p-2">Zone</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {zones.map((z) => (
                  <tr key={z.id}>
                    <td className="p-2 text-[#2E9CCA] font-bold">Zone {z.number}</td>
                    <td className="p-2 text-white">{z.name}</td>
                    <td className="p-2 font-bold">{z.readinessScore}%</td>
                    <td className="p-2 uppercase">{z.status}</td>
                    <td className="p-2 text-slate-400">{z.officerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
