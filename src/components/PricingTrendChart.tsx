import React, { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { BillingCycle, CompetitorProfile } from '../types/intelligence';
import { computeHistoricalPricingTrend } from '../utils/pricingMath';

interface PricingTrendChartProps {
  ourProduct: CompetitorProfile;
  competitors: CompetitorProfile[];
  billingCycle: BillingCycle;
}

const SERIES_PALETTE = [
  '#F59E0B', // Amber (Vercel)
  '#EF4444', // Rose/Red (Render)
  '#10B981', // Emerald (Fly.io)
  '#06B6D4', // Cyan (Scanned Competitor 4)
  '#EC4899', // Pink (Scanned Competitor 5)
];

export const PricingTrendChart: React.FC<PricingTrendChartProps> = ({
  ourProduct,
  competitors,
  billingCycle,
}) => {
  const [trendTier, setTrendTier] = useState<'pro' | 'team'>('pro');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set());

  const trendData = computeHistoricalPricingTrend(
    ourProduct,
    competitors,
    billingCycle,
    trendTier
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
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-4 sm:p-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              6-Month Base Pricing Trajectory (May 2026 – Oct 2026)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical per-seat base rate comparison ({billingCycle === 'annual' ? 'Annual -20% applied' : 'Monthly list price'}) showing competitor price hikes vs. {ourProduct.name} price stability.
            </p>
          </div>
        </div>

        {/* Tier Selector & Interactive Legend */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Pricing Trend Tier Selector"
            className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setTrendTier('pro')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                trendTier === 'pro'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pro Tier ($/seat)
            </button>
            <button
              type="button"
              onClick={() => setTrendTier('team')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                trendTier === 'team'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Team / Org Tier ($/seat)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Series Toggle Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Our Product Legend Button */}
          <button
            type="button"
            onClick={() => toggleSeries(ourProduct.id)}
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium transition-opacity cursor-pointer ${
              hiddenSeries.has(ourProduct.id)
                ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
                : 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: '#4F46E5' }}
            />
            <span className="font-semibold">{ourProduct.name} (Ours)</span>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold">
              ${latestPoint?.[ourProduct.id]}/mo
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
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium transition-opacity cursor-pointer ${
                  isHidden
                    ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{comp.name}</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
                  ${endVal}/mo
                </span>
                {deltaPct > 0 && (
                  <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 tabular-nums">
                    +{deltaPct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {latestPoint?.annotation && (
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {String(latestPoint.annotation)}
          </div>
        )}
      </div>

      {/* Recharts 6-Month Line Chart */}
      <div className="h-64 w-full mt-1" data-testid="pricing-trend-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 18, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94A3B8"
              strokeOpacity={0.22}
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
              width={48}
              tickFormatter={(val) => `$${val}`}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
                    <div className="font-mono font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                      {label} · {trendTier.toUpperCase()} Base Rate ({billingCycle})
                    </div>
                    {payload.map((entry) => (
                      <div
                        key={String(entry.dataKey)}
                        className="flex items-center justify-between gap-5 font-mono tabular-nums"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="font-sans text-slate-700 dark:text-slate-200">
                            {entry.name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ${entry.value}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />

            {/* Our Product Line (Highlighted Solid Indigo) */}
            {!hiddenSeries.has(ourProduct.id) && (
              <Line
                type="monotone"
                dataKey={ourProduct.id}
                name={`${ourProduct.name} (Ours)`}
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6 }}
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
                  strokeWidth={2.25}
                  dot={{ r: 3.5, fill: color, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5.5 }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
