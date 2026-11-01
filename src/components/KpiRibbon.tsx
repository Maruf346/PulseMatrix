import React from 'react';
import { motion } from 'motion/react';
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
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-5"
    >
      {/* Card 1: Tracked Competitors */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-4 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            Tracked Competitors
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap shrink-0">
            1 Baseline + {kpi.competitorCount} Rivals
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums whitespace-nowrap shrink-0">
            {kpi.trackedEntitiesCount} Active
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          NexusCloud · {competitorNames.join(' · ')}
        </div>
      </motion.div>

      {/* Card 2: Changes Detected (7d) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.03 }}
        onClick={onActivateChangedThisWeek}
        className="text-left bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-xl p-4 transition-colors flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            Changes Detected (7d)
          </span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 whitespace-nowrap shrink-0">
            <span>Inspect shifts</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums whitespace-nowrap shrink-0">
            {kpi.changesDetected7d} Shifts
          </span>
          <span className="text-xs font-mono text-amber-700 dark:text-amber-400 tabular-nums truncate">
            3 Hikes · 2 Edits
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          Filter matrix to Changed This Week
        </div>
      </motion.button>

      {/* Card 3: Price Competitiveness Score */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.06 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-4 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            Price Competitiveness Score
          </span>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium tabular-nums whitespace-nowrap shrink-0">
            Pro & Team TCO
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums whitespace-nowrap shrink-0">
            {kpi.priceCompetitivenessScore}% Advantage
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          $19/seat Pro + $0.04/GB egress vs. $0.10–$0.18/GB rivals
        </div>
      </motion.div>

      {/* Card 4: Battlecard Win-Rate Impact */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.09 }}
        onClick={() => onNavigateTab('battlecards')}
        className="text-left bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 hover:border-indigo-400/80 dark:hover:border-indigo-500/60 rounded-xl p-4 transition-colors flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            Battlecard Win-Rate Impact
          </span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap shrink-0">
            <span>Open Battlecards</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono tabular-nums whitespace-nowrap shrink-0">
            {kpi.battlecardWinRateImpact}
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums truncate">
            ({kpi.averageWinRate}% avg win)
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          Verified CRM competitive deal close lift
        </div>
      </motion.button>
    </section>
  );
};
