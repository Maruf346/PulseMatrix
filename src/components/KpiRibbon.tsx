import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DashboardKpiSummary } from '../utils/pricingMath';
import { ActiveTab } from './TopHeader';

interface KpiRibbonProps {
  kpi: DashboardKpiSummary;
  competitorNames: string[];
  onNavigateTab: (tab: ActiveTab) => void;
  onActivateChangedThisWeek: () => void;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({
  kpi,
  competitorNames,
  onNavigateTab,
  onActivateChangedThisWeek,
}) => {
  return (
    <section
      aria-label="Competitive Intelligence KPI Summary"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {/* Card 1: Tracked Competitors */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500">Tracked Competitors</span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            1 Baseline + {kpi.competitorCount} Rivals
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {kpi.trackedEntitiesCount} Active
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 truncate">
          NexusCloud · {competitorNames.join(' · ')}
        </div>
      </div>

      {/* Card 2: Changes Detected (7d) */}
      <button
        type="button"
        onClick={onActivateChangedThisWeek}
        className="text-left bg-white/85 backdrop-blur-xl border border-slate-200/80 hover:border-amber-300/90 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
            Changes Detected (7d)
          </span>
          <span className="text-xs font-medium text-amber-700 flex items-center gap-1 whitespace-nowrap shrink-0">
            <span>Inspect shifts</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums whitespace-nowrap shrink-0">
            {kpi.changesDetected7d} Shifts
          </span>
          <span className="text-xs font-mono text-amber-700 tabular-nums truncate">
            3 Hikes · 2 Edits
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 truncate">
          Click to filter matrix by Changed This Week
        </div>
      </button>

      {/* Card 3: Price Competitiveness Score */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500">
            Price Competitiveness Score
          </span>
          <span className="text-xs font-mono text-indigo-700 font-medium tabular-nums">
            Pro & Team TCO
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {kpi.priceCompetitivenessScore}% Advantage
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          $19/seat Pro + $0.04/GB egress vs. $0.10–$0.18/GB rivals
        </div>
      </div>

      {/* Card 4: Battlecard Win-Rate Impact */}
      <button
        type="button"
        onClick={() => onNavigateTab('battlecards')}
        className="text-left bg-white/85 backdrop-blur-xl border border-slate-200/80 hover:border-indigo-300/90 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs font-medium text-slate-500">
            Battlecard Win-Rate Impact
          </span>
          <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <span>Open Battlecards</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
            {kpi.battlecardWinRateImpact}
          </span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            vs. last 30d ({kpi.averageWinRate}% avg win)
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Verified CRM competitive deal close lift
        </div>
      </button>
    </section>
  );
};
