import React, { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles, TrendingUp } from 'lucide-react';
import { BillingCycle, CompetitorProfile } from '../types/intelligence';
import { computeHistoricalPricingTrend } from '../utils/pricingMath';

interface PricingTrendChartProps {
  ourProduct: CompetitorProfile;
  competitors: CompetitorProfile[];
  billingCycle: BillingCycle;
  selectedTier?: 'all' | 'starter' | 'pro' | 'team' | 'enterprise';
}

const SERIES_PALETTE = [
  '#F59E0B', // Vibrant Amber (Vercel)
  '#F43F5E', // Coral Rose (Render)
  '#10B981', // Electric Emerald (Fly.io)
  '#06B6D4', // Cyan (Scanned Competitor 4)
  '#EC4899', // Fuchsia (Scanned Competitor 5)
];

export const PricingTrendChart: React.FC<PricingTrendChartProps> = ({
  ourProduct,
  competitors,
  billingCycle,
  selectedTier = 'all',
}) => {
  const [trendTier, setTrendTier] = useState<'starter' | 'pro' | 'team'>('pro');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set());

  const activeTier: 'starter' | 'pro' | 'team' =
    selectedTier === 'starter' || selectedTier === 'pro' || selectedTier === 'team'
      ? selectedTier
      : trendTier;

  const trendData = computeHistoricalPricingTrend(
    ourProduct,
    competitors,
    billingCycle,
    activeTier
  );

  const toggleSeries = (id: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const latestPoint = trendData[trendData.length - 1];
  const firstPoint = trendData[0];

  return (
    <section
      aria-label="6-Month Competitor Base Pricing Trend Chart"
      className="relative overflow-hidden bg-white dark:bg-[#0E1422] border border-slate-200/85 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-6px_rgba(15,23,42,0.05)] flex flex-col justify-between h-full"
    >
      {/* Subtle Top Gradient Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 dark:from-indigo-500/25 dark:to-violet-500/25 border border-indigo-200/80 dark:border-indigo-700/70 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                6-Month Base Price Trajectory
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-[10px] font-mono font-semibold whitespace-nowrap shrink-0">
                May 26 – Oct 26
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Per-seat base rate history ({billingCycle === 'annual' ? 'Annual -20% applied' : 'Monthly list price'}) comparing competitor price hikes against {ourProduct.name}.
            </p>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Pricing Trend Tier Selector"
            className="inline-flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl"
          >
            <button
              type="button"
              data-testid="trend-tier-starter"
              onClick={() => setTrendTier('starter')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTier === 'starter'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Starter
            </button>
            <button
              type="button"
              data-testid="trend-tier-pro"
              onClick={() => setTrendTier('pro')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTier === 'pro'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pro ($/seat)
            </button>
            <button
              type="button"
              data-testid="trend-tier-team"
              onClick={() => setTrendTier('team')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTier === 'team'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Team / Org ($/seat)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Series Toggle Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Our Product Legend Button */}
          <button
            type="button"
            onClick={() => toggleSeries(ourProduct.id)}
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              hiddenSeries.has(ourProduct.id)
                ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/60 text-slate-900 dark:text-white shadow-2xs'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-indigo-500/30"
              style={{ backgroundColor: '#6366F1' }}
            />
            <span className="font-semibold">{ourProduct.name} (Ours)</span>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-bold">
              ${latestPoint?.[ourProduct.id]}/mo
            </span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-semibold">
              0% hike
            </span>
          </button>

          {/* Competitor Series Legend Buttons */}
          {competitors.map((comp, index) => {
            const color = SERIES_PALETTE[index % SERIES_PALETTE.length];
            const isHidden = hiddenSeries.has(comp.id);
            const startVal = Number(firstPoint?.[comp.id] ?? 0);
            const endVal = Number(latestPoint?.[comp.id] ?? 0);
            const deltaPct =
              startVal > 0 ? Math.round(((endVal - startVal) / startVal) * 100) : 0;

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => toggleSeries(comp.id)}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isHidden
                    ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
                    : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{comp.name}</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-bold">
                  ${endVal}/mo
                </span>
                {deltaPct > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-semibold tabular-nums">
                    +{deltaPct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts 6-Month Composed Area + Line Chart */}
      <div className="h-60 w-full mt-0.5" data-testid="pricing-trend-chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 16, left: -4, bottom: 2 }}
          >
            <defs>
              <linearGradient id="nexusAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="renderAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94A3B8"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={46}
              tickFormatter={(val) => `$${val}`}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                // Deduplicate area + line entries by dataKey
                const seen = new Set<string>();
                const uniquePayload = payload.filter((entry) => {
                  const key = String(entry.dataKey);
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

                return (
                  <div className="bg-[#0B0F19]/95 text-white backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5">
                    <div className="font-mono font-semibold text-indigo-300 border-b border-slate-800 pb-1">
                      {label} · {activeTier.toUpperCase()} Base Rate ({billingCycle})
                    </div>
                    {uniquePayload.map((entry) => (
                      <div
                        key={String(entry.dataKey)}
                        className="flex items-center justify-between gap-5 font-mono tabular-nums"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="font-sans text-slate-200">
                            {entry.name}
                          </span>
                        </div>
                        <span className="font-bold text-white">
                          ${entry.value}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {/* Subtle Area Fill for Our Product */}
            {!hiddenSeries.has(ourProduct.id) && (
              <Area
                type="monotone"
                dataKey={ourProduct.id}
                name={`${ourProduct.name} (Ours)`}
                fill="url(#nexusAreaGrad)"
                stroke="none"
                isAnimationActive={false}
              />
            )}

            {/* Competitor Lines */}
            {competitors.map((comp, index) => {
              if (hiddenSeries.has(comp.id)) return null;
              const color = SERIES_PALETTE[index % SERIES_PALETTE.length];
              return (
                <Line
                  key={comp.id}
                  type="monotone"
                  dataKey={comp.id}
                  name={comp.name}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: color, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              );
            })}

            {/* Our Product Line Rendered On Top */}
            {!hiddenSeries.has(ourProduct.id) && (
              <Line
                type="monotone"
                dataKey={ourProduct.id}
                name={`${ourProduct.name} (Ours)`}
                stroke="#6366F1"
                strokeWidth={3.25}
                dot={{ r: 4.5, fill: '#6366F1', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6.5 }}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Insight Callout Footer */}
      {latestPoint?.annotation && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{String(latestPoint.annotation)}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            Verified Pricing History
          </span>
        </div>
      )}
    </section>
  );
};
