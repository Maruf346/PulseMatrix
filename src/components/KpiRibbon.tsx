import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
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
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5"
    >
      {/* Card 1: Tracked Competitors */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="relative overflow-hidden bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.04)] flex flex-col justify-between"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Tracked Vendors
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-[10px] font-mono font-semibold tabular-nums whitespace-nowrap shrink-0">
            1 Ours + {kpi.competitorCount} Rivals
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
            {kpi.trackedEntitiesCount} Active
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
            Live Synced
          </span>
        </div>

        {/* Visual Vendor Pill Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-hidden">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-semibold shrink-0">
            NexusCloud
          </span>
          {competitorNames.slice(0, 3).map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium truncate"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Card 2: Changes Detected (7d) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.03 }}
        onClick={onActivateChangedThisWeek}
        className="relative overflow-hidden text-left bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 hover:border-amber-400 dark:hover:border-amber-500/70 rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.04)] transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800/70 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              7-Day Price Shifts
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-0.5 whitespace-nowrap shrink-0">
            <span>Filter</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 w-full">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
            {kpi.changesDetected7d} Shifts
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70 text-[10px] font-mono font-semibold tabular-nums whitespace-nowrap">
            3 Hikes · 2 Edits
          </span>
        </div>

        {/* Segmented Severity Visual Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 w-full">
          <div className="flex items-center gap-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-3/5 bg-rose-500 rounded-l-full" />
            <div className="h-full w-1/5 bg-amber-500" />
            <div className="h-full w-1/5 bg-emerald-500 rounded-r-full" />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>Click to isolate changed rows</span>
            <span className="font-mono">Last 7d</span>
          </div>
        </div>
      </motion.button>

      {/* Card 3: Price Competitiveness Score */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.06 }}
        className="relative overflow-hidden bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.04)] flex flex-col justify-between"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200/70 dark:border-cyan-800/70 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              TCO Advantage
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 text-[10px] font-mono font-semibold tabular-nums whitespace-nowrap shrink-0">
            Pro & Team
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
            {kpi.priceCompetitivenessScore}% Score
          </span>
          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold whitespace-nowrap">
            #1 Lowest TCO
          </span>
        </div>

        {/* Visual Gauge Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full"
              style={{ width: `${kpi.priceCompetitivenessScore}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>$19/seat + $0.04/GB</span>
            <span className="font-mono">vs $0.15/GB</span>
          </div>
        </div>
      </motion.div>

      {/* Card 4: Battlecard Win-Rate Impact */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.09 }}
        onClick={() => onNavigateTab('battlecards')}
        className="relative overflow-hidden text-left bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 hover:border-emerald-400 dark:hover:border-emerald-500/70 rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.04)] transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              CRM Win-Rate Lift
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 whitespace-nowrap shrink-0">
            <span>Battlecards</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 w-full">
          <span className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {kpi.battlecardWinRateImpact}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 text-[10px] font-mono font-semibold tabular-nums">
            {kpi.averageWinRate}% Avg Win
          </span>
        </div>

        {/* Mini Sparkline Bars */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 w-full flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Verified CRM deal close lift
          </span>
          <div className="flex items-end gap-1 h-3.5 shrink-0">
            {[42, 55, 62, 70, 84, 100].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-t-xs bg-emerald-500/85"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </motion.button>
    </section>
  );
};
