import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Filter,
  Info,
  RotateCcw,
  ShieldCheck,
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
  filterFeatureRows,
  filterTierIds,
} from '../utils/pricingMath';

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
      ? 'bg-amber-50/90 text-amber-800 border-amber-200/90 hover:bg-amber-100/80'
      : 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/80';

    return (
      <div className="mt-2 flex flex-col items-start gap-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono tabular-nums">
          <span className="line-through text-slate-400">
            {overrideOldPrice || diff.previousValue}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900">{diff.currentValue}</span>
        </div>
        <button
          type="button"
          onClick={() =>
            setInspectedDiff({
              competitorName,
              subjectLabel,
              diff,
              competitorId,
            })
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${colorClass}`}
        >
          {isHikeOrCut ? (
            <TrendingUp className="w-3 h-3 shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 shrink-0" />
          )}
          <span className="font-mono tabular-nums">{diff.dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="underline decoration-dotted">Why it changed</span>
          <Info className="w-3 h-3 shrink-0 opacity-75" />
        </button>
      </div>
    );
  };

  const hasNoResults = visibleTiers.length === 0 && visibleFeatures.length === 0;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Billing Cycle Segmented Control & Tier Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Billing Cycle Segmented Control */}
            <div
              role="group"
              aria-label="Billing Cycle Toggle"
              className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl"
            >
              <button
                type="button"
                onClick={() => onBillingCycleChange('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => onBillingCycleChange('annual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Billing (Save 20%)
              </button>
            </div>

            {/* Tier Filter Segmented Control */}
            <div
              role="group"
              aria-label="Tier Filter"
              className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl overflow-x-auto max-w-full"
            >
              {TIER_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTier(t.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTier === t.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: "Show Only Changed This Week" Toggle Switch */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <label
              htmlFor="toggle-changed-week"
              className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white transition-colors"
            >
              <input
                id="toggle-changed-week"
                type="checkbox"
                checked={changedOnly}
                onChange={(e) => onToggleChangedOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all relative peer-checked:bg-amber-600" />
              <span className="text-xs font-medium text-slate-800 whitespace-nowrap shrink-0">
                Show Only &ldquo;Changed This Week&rdquo;
              </span>
            </label>
          </div>
        </div>

        {/* Category Filter Row + Mobile Competitor Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Mobile/Tablet Quick Competitor Focus Bar */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0 mr-1">
              Compare vs:
            </span>
            <button
              type="button"
              onClick={() => setMobileCompetitorId('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                mobileCompetitorId === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              All ({competitors.length})
            </button>
            {competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setMobileCompetitorId(c.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                  mobileCompetitorId === c.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600'
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
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No pricing tiers or features match your active filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try clearing your search query, switching the category back to All Features, or turning off the &ldquo;Changed This Week&rdquo; filter.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Matrix Filters</span>
          </button>
        </div>
      ) : (
        /* Side-by-Side Comparison Matrix Table */
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80">
                  {/* Column 1: Sticky Feature/Tier Dimension Header */}
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-md py-4 px-5 w-64 min-w-[230px] border-r border-slate-200/80 align-top"
                  >
                    <div className="text-xs font-semibold text-slate-900 tracking-tight">
                      Dimension / Capability
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1">
                      Showing {billingCycle === 'annual' ? 'Annual (-20%)' : 'Monthly'} rates
                    </div>
                  </th>

                  {/* Column 2: Pinned Highlight Column — Our Product */}
                  <th
                    scope="col"
                    className="py-4 px-5 w-72 min-w-[250px] bg-indigo-50/35 border-r border-indigo-100/90 align-top"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold tracking-tight text-slate-900">
                        {ourProduct.name}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-700">
                        Our Product · Pinned
                      </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-600 mt-1 line-clamp-2">
                      {ourProduct.tagline}
                    </p>
                  </th>

                  {/* Competitor Columns */}
                  {displayedCompetitors.map((comp) => (
                    <th
                      key={comp.id}
                      scope="col"
                      className="py-4 px-5 w-72 min-w-[250px] border-r last:border-r-0 border-slate-200/70 align-top"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold tracking-tight text-slate-900">
                          {comp.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenBattlecardForCompetitor(comp.id)}
                          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Battlecard</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] font-normal text-slate-500 mt-1 line-clamp-1">
                        {comp.tagline}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono tabular-nums">
                        <span>Win rate: {comp.winRateAgainst}%</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700">{comp.winRateDelta}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/70 text-xs">
                {/* SECTION 1: 4 PRICING TIERS */}
                {visibleTiers.length > 0 && (
                  <tr className="bg-slate-100/70">
                    <td
                      colSpan={2 + displayedCompetitors.length}
                      className="py-2 px-5 text-[11px] font-semibold text-slate-600 tracking-tight"
                    >
                      Pricing Tiers & Packaging ({billingCycle === 'annual' ? 'Annual Billing · Save 20% Applied' : 'Standard Monthly Billing'})
                    </td>
                  </tr>
                )}

                {visibleTiers.map((tierId) => {
                  const ourTier = ourProduct.tiers[tierId];
                  const ourPriceObj = calculateDisplayedPrice(
                    ourTier.monthlyPrice,
                    billingCycle,
                    ourTier.customLabel,
                    ourTier.diff?.previousValue
                  );

                  return (
                    <tr
                      key={`tier-${tierId}`}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Sticky Left Column: Tier Name & Audience */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/95 py-4 px-5 border-r border-slate-200/80 align-top">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm capitalize">
                          {tierId} Tier
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ourTier.audience}
                        </div>
                      </td>

                      {/* Pinned Our Product Price Cell */}
                      <td className="py-4 px-5 bg-indigo-50/25 border-r border-indigo-100/90 align-top">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                            {ourPriceObj.formattedPrice}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {ourPriceObj.cadenceLabel}
                          </span>
                        </div>
                        {ourPriceObj.annualSavingsPerUnit > 0 && (
                          <div className="text-[11px] font-mono text-emerald-700 mt-0.5 tabular-nums">
                            Saves ${ourPriceObj.annualSavingsPerUnit}/yr per seat
                          </div>
                        )}
                        <div className="text-xs font-medium text-slate-800 mt-1">
                          {ourTier.tierName} · {ourTier.perSeatNote}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          {ourTier.includedSummary}
                        </div>

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
                            className="py-4 px-5 border-r last:border-r-0 border-slate-200/70 align-top"
                          >
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                                {cPriceObj.formattedPrice}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {cPriceObj.cadenceLabel}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-slate-700 mt-1">
                              {cTier.tierName} · {cTier.perSeatNote}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {cTier.includedSummary}
                            </div>

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
                  <tr className="bg-slate-100/70">
                    <td
                      colSpan={2 + displayedCompetitors.length}
                      className="py-2 px-5 text-[11px] font-semibold text-slate-600 tracking-tight"
                    >
                      Feature Parity, Infrastructure Limits & Security Benchmarks ({visibleFeatures.length} shown)
                    </td>
                  </tr>
                )}

                {visibleFeatures.map((feat) => {
                  return (
                    <tr
                      key={feat.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Sticky Left Column: Feature Name & Category */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/95 py-4 px-5 border-r border-slate-200/80 align-top">
                        <div className="font-semibold text-slate-900 text-xs">
                          {feat.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {feat.category}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {feat.description}
                        </p>
                      </td>

                      {/* Pinned Our Product Feature Value */}
                      <td className="py-4 px-5 bg-indigo-50/25 border-r border-indigo-100/90 align-top">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-slate-900 font-mono text-xs tabular-nums">
                              {feat.ourValue.value}
                            </div>
                            {feat.ourValue.detailNote && (
                              <div className="text-[11px] text-indigo-950/75 mt-1">
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
                            className="py-4 px-5 border-r last:border-r-0 border-slate-200/70 align-top"
                          >
                            <div className="font-medium text-slate-800 font-mono text-xs tabular-nums">
                              {cell.value}
                            </div>
                            {cell.detailNote && (
                              <div className="text-[11px] text-slate-500 mt-1">
                                {cell.detailNote}
                              </div>
                            )}
                            {cell.advantage === 'ours' && (
                              <div className="mt-1.5 text-[11px] font-medium text-indigo-700">
                                {ourProduct.name} Advantage
                              </div>
                            )}
                            {cell.advantage === 'theirs' && (
                              <div className="mt-1.5 text-[11px] font-medium text-amber-700">
                                Competitor Edge (See Landmine)
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

      {/* Diff Citation & Source Inspector Modal */}
      {inspectedDiff && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="diff-inspector-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-amber-700 tabular-nums">
                  {inspectedDiff.diff.dateLabel} · {inspectedDiff.diff.impactLevel}
                </div>
                <h3
                  id="diff-inspector-title"
                  className="text-base font-bold text-slate-900 mt-0.5"
                >
                  {inspectedDiff.competitorName} — {inspectedDiff.subjectLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedDiff(null)}
                aria-label="Close Diff Citation Inspector"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Before -> After Visual Diff Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 font-mono text-xs tabular-nums">
              <div>
                <div className="text-[10px] text-slate-400">PREVIOUS VALUE</div>
                <div className="line-through text-slate-500 mt-0.5 font-medium">
                  {inspectedDiff.diff.previousValue}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400">CURRENT LIVE VALUE</div>
                <div className="text-slate-900 font-bold mt-0.5">
                  {inspectedDiff.diff.currentValue}
                </div>
              </div>
            </div>

            {/* Why It Changed Explanation */}
            <div>
              <div className="text-xs font-semibold text-slate-900">
                Why This Changed & Revenue Impact
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {inspectedDiff.diff.reason}
              </p>
            </div>

            {/* Source Citation Link */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <a
                href={inspectedDiff.diff.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Source: {inspectedDiff.diff.sourceTitle}</span>
              </a>

              <div className="flex items-center gap-2">
                {inspectedDiff.competitorId && (
                  <button
                    type="button"
                    onClick={() => {
                      const cId = inspectedDiff.competitorId!;
                      setInspectedDiff(null);
                      onOpenBattlecardForCompetitor(cId);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Open Sales Battlecard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectedDiff(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
