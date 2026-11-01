import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  BillingCycle,
  CompetitorProfile,
  DiffChange,
  FeatureCategory,
  FeatureDefinition,
  TierId,
} from '../types/intelligence';
import {
  calculateDisplayedPrice,
  computeTeamTcoComparison,
  filterFeatureRows,
  filterTierIds,
} from '../utils/pricingMath';
import { PricingTrendChart } from './PricingTrendChart';

interface PricingMatrixViewProps {
  ourProduct: CompetitorProfile;
  competitors: CompetitorProfile[];
  features: FeatureDefinition[];
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  selectedTier: TierId | 'all';
  onSelectTier: (tier: TierId | 'all') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  changedOnly: boolean;
  onToggleChangedOnly: (val: boolean) => void;
  searchQuery: string;
  onResetFilters: () => void;
  onOpenBattlecardForCompetitor: (competitorId: string) => void;
}

interface InspectedDiffState {
  competitorName: string;
  subjectLabel: string;
  diff: DiffChange;
  competitorId?: string;
}

const CATEGORIES: Array<'All Features' | FeatureCategory> = [
  'All Features',
  'Core Infrastructure',
  'Security & Compliance',
  'AI & Usage Limits',
  'Support & SLA',
];

const TIER_OPTIONS: Array<{ id: TierId | 'all'; label: string }> = [
  { id: 'all', label: 'All Tiers' },
  { id: 'starter', label: 'Starter' },
  { id: 'pro', label: 'Pro' },
  { id: 'team', label: 'Team' },
  { id: 'enterprise', label: 'Enterprise' },
];

const VENDOR_BADGE_COLORS = [
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
];

export const PricingMatrixView: React.FC<PricingMatrixViewProps> = ({
  ourProduct,
  competitors,
  features,
  billingCycle,
  onBillingCycleChange,
  selectedTier,
  onSelectTier,
  selectedCategory,
  onSelectCategory,
  changedOnly,
  onToggleChangedOnly,
  searchQuery,
  onResetFilters,
  onOpenBattlecardForCompetitor,
}) => {
  const [inspectedDiff, setInspectedDiff] = useState<InspectedDiffState | null>(null);
  const [mobileCompetitorId, setMobileCompetitorId] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(['tier-pro', 'feat-bandwidth'])
  );
  const [expandAllDetails, setExpandAllDetails] = useState<boolean>(false);

  // Interactive Visual TCO Simulator state
  const [teamSize, setTeamSize] = useState<number>(12);
  const [bandwidthTb, setBandwidthTb] = useState<number>(2);

  const tcoBars = computeTeamTcoComparison(
    ourProduct,
    competitors,
    billingCycle,
    teamSize,
    bandwidthTb
  );

  const visibleTiers = filterTierIds(
    ['starter', 'pro', 'team', 'enterprise'],
    ourProduct,
    competitors,
    {
      tier: selectedTier,
      changedOnly,
      searchQuery,
    }
  );

  const visibleFeatures = filterFeatureRows(features, competitors, {
    category: selectedCategory,
    tier: selectedTier,
    changedOnly,
    searchQuery,
  });

  const displayedCompetitors =
    mobileCompetitorId === 'all'
      ? competitors
      : competitors.filter((c) => c.id === mobileCompetitorId);

  const toggleRowExpanded = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  const renderDiffTrigger = (
    diff: DiffChange,
    competitorName: string,
    subjectLabel: string,
    competitorId?: string,
    overrideOldPrice?: string
  ) => {
    const isHikeOrCut =
      diff.changeType === 'price_hike' || diff.changeType === 'limit_cut';

    const colorClass = isHikeOrCut
      ? 'bg-rose-50/90 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/80 hover:bg-rose-100/80 dark:hover:bg-rose-900/60'
      : 'bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60';

    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-mono tabular-nums line-through text-slate-400 dark:text-slate-500">
          {overrideOldPrice || diff.previousValue}
        </span>
        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setInspectedDiff({
              competitorName,
              subjectLabel,
              diff,
              competitorId,
            });
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${colorClass}`}
        >
          {isHikeOrCut ? (
            <TrendingUp className="w-3 h-3 shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 shrink-0" />
          )}
          <span className="font-mono tabular-nums">{diff.dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="underline decoration-dotted">Why it changed</span>
        </button>
      </div>
    );
  };

  const hasNoResults = visibleTiers.length === 0 && visibleFeatures.length === 0;

  return (
    <div className="space-y-5">
      {/* Side-by-Side Executive Visual Analytics Grid (Recharts Trend + Stacked TCO BarChart) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left 7 Columns: 6-Month Base Price Trajectory Chart */}
        <div className="xl:col-span-7">
          <PricingTrendChart
            ourProduct={ourProduct}
            competitors={competitors}
            billingCycle={billingCycle}
            selectedTier={selectedTier}
          />
        </div>

        {/* Right 5 Columns: Interactive Monthly TCO Stacked BarChart & Simulator */}
        <section
          aria-label="Interactive Monthly TCO Breakdown Chart"
          className="xl:col-span-5 relative overflow-hidden bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-6px_rgba(15,23,42,0.05)] flex flex-col justify-between"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500" />

          {/* Header & Simulator Selectors */}
          <div className="flex flex-col gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200/70 dark:border-cyan-800/70 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Monthly TCO Breakdown ({teamSize} Seats · {bandwidthTb} TB)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stacked Pro seats vs. egress overage & add-on tax ({billingCycle === 'annual' ? 'Annual -20%' : 'Monthly'}).
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Team Size & Bandwidth Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                {[5, 12, 25].map((seats) => (
                  <button
                    key={seats}
                    type="button"
                    onClick={() => setTeamSize(seats)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      teamSize === seats
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {seats} Seats
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                {[1, 2, 5].map((tb) => (
                  <button
                    key={tb}
                    type="button"
                    onClick={() => setBandwidthTb(tb)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      bandwidthTb === tb
                        ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tb} TB Egress
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stacked Recharts BarChart */}
          <div className="h-44 w-full mt-3" data-testid="tco-stacked-barchart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tcoBars}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94A3B8"
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = tcoBars.find((b) => b.name === label);
                    return (
                      <div className="bg-[#0B0F19]/95 text-white border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 font-mono tabular-nums">
                        <div className="font-sans font-bold text-white border-b border-slate-800 pb-1">
                          {label} · Total ${item?.totalMonthlyTco}/mo
                        </div>
                        <div className="flex justify-between gap-4 text-indigo-300">
                          <span>Base Seats ({teamSize}):</span>
                          <span>${item?.seatCost}/mo</span>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-300">
                          <span>Egress & Add-ons:</span>
                          <span>${item?.bandwidthOverageCost}/mo</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="seatCost"
                  name="Base Seat Cost"
                  stackId="tco"
                  fill="#6366F1"
                  radius={[0, 0, 4, 4]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="bandwidthOverageCost"
                  name="Egress & Add-on Tax"
                  stackId="tco"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compact TCO Savings Cards Strip */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tcoBars.map((bar) => (
              <div
                key={bar.id}
                className={`p-2 rounded-xl border text-xs ${
                  bar.isOurProduct
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                    {bar.name}
                  </span>
                </div>
                <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tabular-nums mt-0.5">
                  ${bar.totalMonthlyTco}/mo
                </div>
                <div className="mt-0.5 text-[10px] font-mono tabular-nums truncate">
                  {bar.isOurProduct ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      ★ Lowest TCO
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Save ${bar.annualSavingsVsThis.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Billing Cycle Segmented Control & Tier Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Billing Cycle Segmented Control with layoutId */}
            <div
              role="group"
              aria-label="Billing Cycle Toggle"
              className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl"
            >
              {(['monthly', 'annual'] as const).map((cycle) => {
                const active = billingCycle === cycle;
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => onBillingCycleChange(cycle)}
                    className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer z-10 ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="billing-cycle-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg shadow-xs -z-10"
                      />
                    )}
                    {cycle === 'monthly'
                      ? 'Monthly Billing'
                      : 'Annual Billing (Save 20%)'}
                  </button>
                );
              })}
            </div>

            {/* Tier Filter Segmented Control */}
            <div
              role="group"
              aria-label="Tier Filter"
              className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl overflow-x-auto max-w-full"
            >
              {TIER_OPTIONS.map((t) => {
                const active = selectedTier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTier(t.id)}
                    className={`relative px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer z-10 ${
                      active
                        ? 'text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="tier-filter-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-2xs -z-10"
                      />
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Density Toggle + "Show Only Changed This Week" Toggle Switch */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setExpandAllDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {expandAllDetails ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Compact Rows</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Expand All Notes</span>
                </>
              )}
            </button>

            <label
              htmlFor="toggle-changed-week"
              className={`inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-xl border transition-colors ${
                changedOnly
                  ? 'border-amber-400 bg-amber-50/90 dark:bg-amber-950/60 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                  : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <input
                id="toggle-changed-week"
                type="checkbox"
                checked={changedOnly}
                onChange={(e) => onToggleChangedOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all relative peer-checked:bg-amber-500" />
              <span className="text-xs font-semibold whitespace-nowrap shrink-0">
                Show Only &ldquo;Changed This Week&rdquo;
              </span>
            </label>
          </div>
        </div>

        {/* Category Filter Row + Mobile Competitor Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div
            role="group"
            aria-label="Feature Category Filter"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer z-10 ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="category-filter-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 bg-[#0B0F19] dark:bg-indigo-600 rounded-xl -z-10"
                    />
                  )}
                  {category}
                </button>
              );
            })}
          </div>

          {/* Mobile/Tablet Quick Competitor Focus Bar */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0 mr-1">
              Compare vs:
            </span>
            <button
              type="button"
              onClick={() => setMobileCompetitorId('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                mobileCompetitorId === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({competitors.length})
            </button>
            {competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setMobileCompetitorId(c.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                  mobileCompetitorId === c.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty Filter State */}
      {hasNoResults ? (
        <div className="bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-12 text-center">
          <Filter className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No pricing tiers or features match your active filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try clearing your search query, switching the category back to All Features, or turning off the &ldquo;Changed This Week&rdquo; filter.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Matrix Filters</span>
          </button>
        </div>
      ) : (
        /* High-Clarity Side-by-Side Comparison Matrix Table */
        <div className="bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-6px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0B0F19]">
                  {/* Column 1: Sticky Feature/Tier Dimension Header */}
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-slate-50 dark:bg-[#0B0F19] py-4 px-4 w-64 min-w-[230px] border-r border-slate-200/80 dark:border-slate-800 align-top"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Capability & Tier Matrix
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                      Click any row to inspect technical notes
                    </div>
                  </th>

                  {/* Column 2: Pinned Highlight Column — Our Product */}
                  <th
                    scope="col"
                    className="py-4 px-4 w-72 min-w-[245px] bg-gradient-to-b from-indigo-50/90 to-indigo-50/30 dark:from-indigo-950/60 dark:to-indigo-950/20 border-r border-indigo-200/80 dark:border-indigo-900/60 align-top"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-500/20" />
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {ourProduct.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                        Our Product
                      </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-600 dark:text-slate-300 mt-1 truncate">
                      {ourProduct.tagline}
                    </p>
                  </th>

                  {/* Competitor Columns */}
                  {displayedCompetitors.map((comp, idx) => {
                    const badgeColor =
                      VENDOR_BADGE_COLORS[idx % VENDOR_BADGE_COLORS.length];
                    return (
                      <th
                        key={comp.id}
                        scope="col"
                        className="py-4 px-4 w-72 min-w-[245px] border-r last:border-r-0 border-slate-200/70 dark:border-slate-800 align-top"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${badgeColor}`}
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {comp.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenBattlecardForCompetitor(comp.id)}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/70 dark:border-indigo-800/70 text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                          >
                            <span>Battlecard</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          <span>Win Rate: {comp.winRateAgainst}%</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {comp.winRateDelta}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-xs">
                {/* SECTION 1: 4 PRICING TIERS */}
                {visibleTiers.length > 0 && (
                  <tr className="bg-slate-100/90 dark:bg-slate-900/90">
                    <td
                      colSpan={2 + displayedCompetitors.length}
                      className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                    >
                      Pricing Tiers & Packaging ({billingCycle === 'annual' ? 'Annual Billing · Save 20% Applied' : 'Standard Monthly Billing'})
                    </td>
                  </tr>
                )}

                {visibleTiers.map((tierId) => {
                  const rowKey = `tier-${tierId}`;
                  const isExpanded = expandAllDetails || expandedRows.has(rowKey);
                  const ourTier = ourProduct.tiers[tierId];
                  const ourPriceObj = calculateDisplayedPrice(
                    ourTier.monthlyPrice,
                    billingCycle,
                    ourTier.customLabel,
                    ourTier.diff?.previousValue
                  );

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => toggleRowExpanded(rowKey)}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      {/* Sticky Left Column: Tier Name & Audience */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-[#0E1422] group-hover:bg-slate-50 dark:group-hover:bg-slate-900 py-3.5 px-4 border-r border-slate-200/80 dark:border-slate-800 align-top">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 dark:text-white text-xs capitalize">
                            {tierId} Tier
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                          {ourTier.audience}
                        </div>
                      </td>

                      {/* Pinned Our Product Price Cell */}
                      <td className="py-3.5 px-4 bg-indigo-50/35 dark:bg-indigo-950/25 border-r border-indigo-100/90 dark:border-indigo-900/50 align-top">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 font-mono tabular-nums">
                            {ourPriceObj.formattedPrice}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {ourPriceObj.cadenceLabel}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {ourTier.tierName} · {ourTier.perSeatNote}
                        </div>

                        {isExpanded && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/50">
                            {ourTier.includedSummary}
                            {ourPriceObj.annualSavingsPerUnit > 0 && (
                              <span className="block font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                                Annual discount saves ${ourPriceObj.annualSavingsPerUnit}/yr per seat
                              </span>
                            )}
                          </div>
                        )}

                        {ourTier.diff &&
                          renderDiffTrigger(
                            ourTier.diff,
                            ourProduct.name,
                            `${ourTier.tierName} (${tierId.toUpperCase()})`,
                            undefined,
                            ourPriceObj.formattedPreviousPrice
                          )}
                      </td>

                      {/* Competitor Tier Cells */}
                      {displayedCompetitors.map((comp) => {
                        const cTier = comp.tiers[tierId];
                        const cPriceObj = calculateDisplayedPrice(
                          cTier.monthlyPrice,
                          billingCycle,
                          cTier.customLabel,
                          cTier.diff?.previousValue
                        );

                        return (
                          <td
                            key={`${comp.id}-${tierId}`}
                            className="py-3.5 px-4 border-r last:border-r-0 border-slate-200/70 dark:border-slate-800 align-top"
                          >
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                                {cPriceObj.formattedPrice}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                {cPriceObj.cadenceLabel}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                              {cTier.tierName} · {cTier.perSeatNote}
                            </div>

                            {isExpanded && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                {cTier.includedSummary}
                              </div>
                            )}

                            {cTier.diff &&
                              renderDiffTrigger(
                                cTier.diff,
                                comp.name,
                                `${cTier.tierName} (${tierId.toUpperCase()} Tier)`,
                                comp.id,
                                cPriceObj.formattedPreviousPrice
                              )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* SECTION 2: 12 CORE FEATURES & CAPABILITIES */}
                {visibleFeatures.length > 0 && (
                  <tr className="bg-slate-100/90 dark:bg-slate-900/90">
                    <td
                      colSpan={2 + displayedCompetitors.length}
                      className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                    >
                      Feature Parity, Infrastructure Limits & Security Benchmarks ({visibleFeatures.length} shown)
                    </td>
                  </tr>
                )}

                {visibleFeatures.map((feat) => {
                  const isExpanded = expandAllDetails || expandedRows.has(feat.id);

                  return (
                    <tr
                      key={feat.id}
                      onClick={() => toggleRowExpanded(feat.id)}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      {/* Sticky Left Column: Feature Name & Category */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-[#0E1422] group-hover:bg-slate-50 dark:group-hover:bg-slate-900 py-3.5 px-4 border-r border-slate-200/80 dark:border-slate-800 align-top">
                        <div className="flex items-start gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {feat.name}
                            </div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                              {feat.category}
                            </span>
                            {isExpanded && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                {feat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Pinned Our Product Feature Value */}
                      <td className="py-3.5 px-4 bg-indigo-50/35 dark:bg-indigo-950/25 border-r border-indigo-100/90 dark:border-indigo-900/50 align-top">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white font-mono text-xs tabular-nums">
                              {feat.ourValue.value}
                            </div>
                            {isExpanded && feat.ourValue.detailNote && (
                              <div className="text-[11px] text-indigo-950/80 dark:text-indigo-200/80 mt-1">
                                {feat.ourValue.detailNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Competitor Feature Cells */}
                      {displayedCompetitors.map((comp) => {
                        const cell = comp.features[feat.id] || {
                          value: 'Not Included / Add-on',
                          advantage: 'ours' as const,
                        };

                        return (
                          <td
                            key={`${comp.id}-${feat.id}`}
                            className="py-3.5 px-4 border-r last:border-r-0 border-slate-200/70 dark:border-slate-800 align-top"
                          >
                            <div className="font-medium text-slate-800 dark:text-slate-200 font-mono text-xs tabular-nums">
                              {cell.value}
                            </div>
                            {cell.advantage === 'ours' && (
                              <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 text-[10px] font-semibold">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{ourProduct.name} Advantage</span>
                              </span>
                            )}
                            {cell.advantage === 'theirs' && (
                              <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 text-[10px] font-semibold">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                <span>Competitor Edge (See Landmine)</span>
                              </span>
                            )}

                            {isExpanded && cell.detailNote && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                {cell.detailNote}
                              </div>
                            )}

                            {cell.diff &&
                              renderDiffTrigger(
                                cell.diff,
                                comp.name,
                                feat.name,
                                comp.id
                              )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-Over Right Diff Citation & Source Inspector Drawer */}
      <AnimatePresence>
        {inspectedDiff && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="diff-inspector-title"
            className="fixed inset-0 z-50 flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setInspectedDiff(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#0E1422] h-full border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      {inspectedDiff.diff.dateLabel} · {inspectedDiff.diff.impactLevel}
                    </div>
                    <h3
                      id="diff-inspector-title"
                      className="text-base font-bold text-slate-900 dark:text-white mt-1"
                    >
                      {inspectedDiff.competitorName} — {inspectedDiff.subjectLabel}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedDiff(null)}
                    aria-label="Close Diff Citation Inspector"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Before -> After Visual Diff Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 font-mono text-xs tabular-nums">
                  <div>
                    <div className="text-[10px] text-slate-400">PREVIOUS VALUE</div>
                    <div className="line-through text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {inspectedDiff.diff.previousValue}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">CURRENT LIVE VALUE</div>
                    <div className="text-slate-900 dark:text-white font-bold mt-1">
                      {inspectedDiff.diff.currentValue}
                    </div>
                  </div>
                </div>

                {/* Why It Changed Explanation */}
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Why This Changed & Revenue Impact
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {inspectedDiff.diff.reason}
                  </p>
                </div>

                {/* Grounded Citation Card */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400">
                    VERIFIED GROUNDING SOURCE
                  </div>
                  <a
                    href={inspectedDiff.diff.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>{inspectedDiff.diff.sourceTitle}</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                {inspectedDiff.competitorId && (
                  <button
                    type="button"
                    onClick={() => {
                      const cId = inspectedDiff.competitorId!;
                      setInspectedDiff(null);
                      onOpenBattlecardForCompetitor(cId);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer"
                  >
                    Open Sales Battlecard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectedDiff(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
