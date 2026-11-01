import {
  BillingCycle,
  CompetitorProfile,
  FeatureDefinition,
  RadarChangeEvent,
  TierId,
} from '../types/intelligence';

export interface DisplayedPriceResult {
  formattedPrice: string;
  rawNumericPrice: number | null;
  cadenceLabel: string;
  annualSavingsPerUnit: number;
  formattedPreviousPrice?: string;
}

/**
 * Calculates displayed price for Monthly vs Annual Billing (Save 20%).
 */
export function calculateDisplayedPrice(
  monthlyPrice: number | null,
  billingCycle: BillingCycle,
  customLabel?: string,
  previousValueStr?: string
): DisplayedPriceResult {
  if (monthlyPrice === null) {
    return {
      formattedPrice: customLabel || 'Custom',
      rawNumericPrice: null,
      cadenceLabel: 'annual contract',
      annualSavingsPerUnit: 0,
      formattedPreviousPrice: previousValueStr,
    };
  }

  if (monthlyPrice === 0) {
    return {
      formattedPrice: '$0',
      rawNumericPrice: 0,
      cadenceLabel: '/mo forever',
      annualSavingsPerUnit: 0,
      formattedPreviousPrice: previousValueStr,
    };
  }

  const multiplier = billingCycle === 'annual' ? 0.8 : 1;
  const computed = Math.round(monthlyPrice * multiplier);
  const annualSavings =
    billingCycle === 'annual' ? Math.round((monthlyPrice - computed) * 12) : 0;

  let formattedPrev = previousValueStr;
  if (previousValueStr && billingCycle === 'annual') {
    const match = previousValueStr.match(/^\$(\d+)(\/mo)?$/);
    if (match) {
      const oldMonthly = parseInt(match[1], 10);
      const oldAnnualMonthly = Math.round(oldMonthly * 0.8);
      formattedPrev = `$${oldAnnualMonthly}${match[2] || '/mo'}`;
    }
  }

  return {
    formattedPrice: `$${computed}`,
    rawNumericPrice: computed,
    cadenceLabel: billingCycle === 'annual' ? '/mo billed annually' : '/mo billed monthly',
    annualSavingsPerUnit: annualSavings,
    formattedPreviousPrice: formattedPrev,
  };
}

export interface MatrixFilterOptions {
  category: string;
  tier: TierId | 'all';
  changedOnly: boolean;
  searchQuery: string;
}

/**
 * Filters the 12 core features based on category, tier, changed-this-week flag, and search query.
 */
export function filterFeatureRows(
  features: FeatureDefinition[],
  competitors: CompetitorProfile[],
  options: MatrixFilterOptions
): FeatureDefinition[] {
  const query = options.searchQuery.trim().toLowerCase();

  return features.filter((feat) => {
    if (options.category !== 'All Features' && feat.category !== options.category) {
      return false;
    }

    if (options.tier !== 'all' && !feat.tierApplicability.includes(options.tier)) {
      return false;
    }

    if (options.changedOnly) {
      const ourChanged = Boolean(feat.ourValue.diff && feat.ourValue.diff.daysAgo <= 7);
      const compChanged = competitors.some((comp) => {
        const cell = comp.features[feat.id];
        return Boolean(cell?.diff && cell.diff.daysAgo <= 7);
      });
      if (!ourChanged && !compChanged) {
        return false;
      }
    }

    if (query.length > 0) {
      const inFeatureMeta =
        feat.name.toLowerCase().includes(query) ||
        feat.category.toLowerCase().includes(query) ||
        feat.description.toLowerCase().includes(query) ||
        feat.ourValue.value.toLowerCase().includes(query);

      const inCompValues = competitors.some((comp) => {
        const cell = comp.features[feat.id];
        return (
          cell &&
          (cell.value.toLowerCase().includes(query) ||
            (cell.detailNote && cell.detailNote.toLowerCase().includes(query)) ||
            (cell.diff && cell.diff.reason.toLowerCase().includes(query)))
        );
      });

      if (!inFeatureMeta && !inCompValues) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Filters the 4 pricing tiers based on tier selection, changed-this-week toggle, and search query.
 */
export function filterTierIds(
  allTiers: TierId[],
  ourProduct: CompetitorProfile,
  competitors: CompetitorProfile[],
  options: Omit<MatrixFilterOptions, 'category'>
): TierId[] {
  const query = options.searchQuery.trim().toLowerCase();

  return allTiers.filter((tierId) => {
    if (options.tier !== 'all' && tierId !== options.tier) {
      return false;
    }

    const ourTier = ourProduct.tiers[tierId];
    if (options.changedOnly) {
      const ourDiff = Boolean(ourTier?.diff && ourTier.diff.daysAgo <= 7);
      const compDiff = competitors.some((comp) => {
        const t = comp.tiers[tierId];
        return Boolean(t?.diff && t.diff.daysAgo <= 7);
      });
      if (!ourDiff && !compDiff) {
        return false;
      }
    }

    if (query.length > 0) {
      const inOurTier =
        ourTier.tierName.toLowerCase().includes(query) ||
        ourTier.audience.toLowerCase().includes(query) ||
        ourTier.includedSummary.toLowerCase().includes(query);

      const inCompTier = competitors.some((comp) => {
        const t = comp.tiers[tierId];
        return (
          t &&
          (t.tierName.toLowerCase().includes(query) ||
            t.perSeatNote.toLowerCase().includes(query) ||
            t.includedSummary.toLowerCase().includes(query) ||
            (t.diff && t.diff.reason.toLowerCase().includes(query)))
        );
      });

      if (!inOurTier && !inCompTier) {
        return false;
      }
    }

    return true;
  });
}

export interface DashboardKpiSummary {
  trackedEntitiesCount: number;
  competitorCount: number;
  changesDetected7d: number;
  priceCompetitivenessScore: number;
  battlecardWinRateImpact: string;
  averageWinRate: number;
}

/**
 * Computes real-time KPI metrics from our product, tracked competitors, and radar events.
 */
export function computeKpiSummary(
  ourProduct: CompetitorProfile,
  competitors: CompetitorProfile[],
  features: FeatureDefinition[],
  radarEvents: RadarChangeEvent[]
): DashboardKpiSummary {
  // Total active tracked products in matrix (our product + competitors)
  const trackedEntitiesCount = competitors.length + 1;
  const competitorCount = competitors.length;

  // Count distinct 7d shifts from radar events + inline diffs
  const recentRadarCount = radarEvents.filter((e) => e.daysAgo <= 7).length;

  // Compute our advantage score across all competitor feature cells + Pro/Team pricing advantage
  let totalComparisons = 0;
  let favorablePoints = 0;

  for (const comp of competitors) {
    // Compare Pro & Team monthly pricing
    const ourPro = ourProduct.tiers.pro.monthlyPrice ?? 0;
    const compPro = comp.tiers.pro.monthlyPrice ?? 0;
    if (compPro > 0) {
      totalComparisons += 2;
      if (ourPro <= compPro) favorablePoints += 2;
    }

    const ourTeam = ourProduct.tiers.team.monthlyPrice ?? 0;
    const compTeam = comp.tiers.team.monthlyPrice ?? 0;
    if (compTeam > 0) {
      totalComparisons += 2;
      if (ourTeam <= compTeam) favorablePoints += 2;
    }

    for (const feat of features) {
      const cell = comp.features[feat.id];
      if (cell) {
        totalComparisons += 1;
        if (cell.advantage === 'ours') {
          favorablePoints += 1;
        } else if (cell.advantage === 'neutral') {
          favorablePoints += 0.8;
        }
      }
    }
  }

  const rawScore =
    totalComparisons > 0 ? Math.round((favorablePoints / totalComparisons) * 100) : 92;
  const priceCompetitivenessScore = Math.min(99, Math.max(70, rawScore));

  const avgWinRate =
    competitors.length > 0
      ? Math.round(
          competitors.reduce((acc, c) => acc + c.winRateAgainst, 0) / competitors.length
        )
      : 68;

  return {
    trackedEntitiesCount,
    competitorCount,
    changesDetected7d: recentRadarCount,
    priceCompetitivenessScore,
    battlecardWinRateImpact: '+18.4%',
    averageWinRate: avgWinRate,
  };
}

/**
 * Formats a battlecard into clean Markdown for Slack / Notion one-click copy.
 */
export function formatBattlecardMarkdown(
  ourProduct: CompetitorProfile,
  competitor: CompetitorProfile,
  billingCycle: BillingCycle
): string {
  const ourProPrice = calculateDisplayedPrice(
    ourProduct.tiers.pro.monthlyPrice,
    billingCycle
  ).formattedPrice;
  const compProPrice = calculateDisplayedPrice(
    competitor.tiers.pro.monthlyPrice,
    billingCycle
  ).formattedPrice;

  const killLines = competitor.battlecard.killPoints
    .map(
      (kp, idx) =>
        `${idx + 1}. **${kp.title}** (\`${kp.proofMetric}\`)\n   - ${kp.talkingPoint}`
    )
    .join('\n');

  const landmineLines = competitor.battlecard.landmines
    .map(
      (lm, idx) =>
        `${idx + 1}. **${lm.title}**\n   - *Gap:* ${lm.honestGap}\n   - *Pivot:* ${lm.pivotStrategy}`
    )
    .join('\n');

  return `# Sales Battlecard: ${ourProduct.name} vs. ${competitor.name}
**Threat Level:** ${competitor.threatLevel} · **Win Rate:** ${competitor.winRateAgainst}% (${competitor.winRateDelta} vs last 30d)
**Pro Tier Benchmark (${billingCycle}):** ${ourProduct.name} ${ourProPrice}/mo vs. ${competitor.name} ${compProPrice}/mo

## Executive Summary
${competitor.battlecard.executiveSummary}

## Why We Win (Kill Points)
${killLines}

## Landmines to Avoid (Where They Beat Us)
${landmineLines}
`;
}

/**
 * Generates a structured Sales Alert Email draft for a detected competitor change event.
 */
export function generateSalesAlertEmailDraft(
  event: RadarChangeEvent,
  ourProductName: string
): {
  subject: string;
  recipients: string;
  body: string;
} {
  return {
    subject: `[COMPETITIVE ALERT · ${event.severity.toUpperCase()}] ${event.competitorName}: ${event.headline}`,
    recipients: 'ae-enterprise@nexuscloud.dev, sdr-outbound@nexuscloud.dev, revops@nexuscloud.dev',
    body: `Team,

PulseMatrix detected a verified ${event.category.toLowerCase()} on ${event.competitorName}'s ${event.affectedTier.toUpperCase()} tier (${event.detectedDate}).

WHAT CHANGED:
• Previous State: ${event.beforeValue}
• Current State:  ${event.afterValue}
• Verified Source: ${event.sourceTitle} (${event.sourceUrl})

CONTEXT & REVENUE IMPACT:
${event.summary}

IMMEDIATE ACTION FOR ACTIVE OPPORTUNITIES:
${event.recommendedAction}

SUGGESTED PROSPECT TALKING POINT:
"We noticed ${event.competitorName} recently shifted from ${event.beforeValue} to ${event.afterValue} on their ${event.affectedTier} plan. With ${ourProductName}, we lock in predictable unit economics with zero surprise overage multipliers—happy to walk your FinOps team through a side-by-side TCO model."

— Sent via PulseMatrix Competitive Intelligence`,
  };
}

export interface TeamTcoBarItem {
  id: string;
  name: string;
  isOurProduct: boolean;
  seatCost: number;
  bandwidthOverageCost: number;
  addonsCost: number;
  totalMonthlyTco: number;
  percentOfMax: number;
  annualSavingsVsThis: number;
}

/**
 * Computes interactive side-by-side Monthly TCO for a given team size (seats) and outbound bandwidth (TB)
 * on Pro/Team tiers, accounting for billingCycle (Monthly vs Annual -20%).
 */
export function computeTeamTcoComparison(
  ourProduct: CompetitorProfile,
  competitors: CompetitorProfile[],
  billingCycle: BillingCycle,
  teamSize: number = 12,
  monthlyBandwidthTb: number = 2
): TeamTcoBarItem[] {
  const entities = [ourProduct, ...competitors];
  const discount = billingCycle === 'annual' ? 0.8 : 1;

  const rawItems = entities.map((entity) => {
    const isOurs = entity.id === ourProduct.id;
    const baseSeatPrice = Math.round((entity.tiers.pro.monthlyPrice ?? 20) * discount);
    const seatCost = baseSeatPrice * teamSize;

    // Parse included bandwidth & per-GB overage from entity id / features
    let includedGb = 500;
    let overagePerGb = 0.10;
    let addonsCost = 0;

    if (isOurs) {
      includedGb = 1000;
      overagePerGb = 0.04;
      addonsCost = 0; // Unlimited builds + 30d logs included
    } else if (entity.id === 'vercel') {
      includedGb = 1000;
      overagePerGb = 0.15;
      addonsCost = teamSize >= 8 ? 100 : 60; // Log drains ($60) + extra build slot ($40)
    } else if (entity.id === 'render') {
      includedGb = 500;
      overagePerGb = 0.10;
      addonsCost = teamSize >= 8 ? 85 : 45; // Unbundled HA Postgres + build minutes pack
    } else if (entity.id === 'flyio') {
      includedGb = 0;
      overagePerGb = 0.06;
      addonsCost = 95; // Base Launch/Scale fee + dedicated IPs + managed DB overhead
    } else {
      includedGb = 500;
      overagePerGb = 0.08;
      addonsCost = 65;
    }

    const totalGb = monthlyBandwidthTb * 1000;
    const extraGb = Math.max(0, totalGb - includedGb);
    const bandwidthOverageCost = Math.round(extraGb * overagePerGb);
    const totalMonthlyTco = seatCost + bandwidthOverageCost + addonsCost;

    return {
      id: entity.id,
      name: entity.name,
      isOurProduct: isOurs,
      seatCost,
      bandwidthOverageCost,
      addonsCost,
      totalMonthlyTco,
    };
  });

  const maxTco = Math.max(...rawItems.map((i) => i.totalMonthlyTco), 1);
  const ourTco = rawItems[0]?.totalMonthlyTco ?? 0;

  return rawItems.map((item) => ({
    ...item,
    percentOfMax: Math.max(12, Math.round((item.totalMonthlyTco / maxTco) * 100)),
    annualSavingsVsThis: item.isOurProduct
      ? 0
      : Math.max(0, (item.totalMonthlyTco - ourTco) * 12),
  }));
}

export interface HistoricalPricingPoint {
  month: string;
  annotation?: string;
  [entityId: string]: string | number | undefined;
}

/**
 * Generates a 6-month historical base pricing trend (May 2026 – Oct 2026)
 * pulling directly from each entity's `pricingHistory` array for the selected base tier
 * ('starter' | 'pro' | 'team') and dynamically scaled by billingCycle (Monthly vs Annual -20%).
 */
export function computeHistoricalPricingTrend(
  ourProduct: CompetitorProfile,
  competitors: CompetitorProfile[],
  billingCycle: BillingCycle,
  trendTier: 'starter' | 'pro' | 'team' = 'pro'
): HistoricalPricingPoint[] {
  const defaultMonths = ['May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'];
  const months =
    ourProduct.pricingHistory && ourProduct.pricingHistory.length === 6
      ? ourProduct.pricingHistory.map((h) => h.month)
      : defaultMonths;

  const discount = billingCycle === 'annual' ? 0.8 : 1;
  const entities = [ourProduct, ...competitors];

  return months.map((month, idx) => {
    const point: HistoricalPricingPoint = { month };

    for (const entity of entities) {
      const historyEntry =
        entity.pricingHistory?.find((h) => h.month === month) ??
        entity.pricingHistory?.[idx];

      let historicalMonthly: number;

      if (historyEntry && typeof historyEntry[trendTier] === 'number') {
        historicalMonthly = historyEntry[trendTier];
      } else {
        // Fallback for dynamically scanned competitors without full 6-month pricingHistory
        const tierObj = entity.tiers[trendTier];
        const currentMonthly = tierObj.monthlyPrice ?? 20;
        const prevMatch = tierObj.diff?.previousValue?.match(/\$(\d+)/);
        const oldVal = prevMatch
          ? parseInt(prevMatch[1], 10)
          : Math.max(0, currentMonthly - (trendTier === 'starter' ? 0 : 5));
        historicalMonthly = idx < 4 ? oldVal : currentMonthly;
      }

      point[entity.id] = Math.round(historicalMonthly * discount);
    }

    if (idx === months.length - 1) {
      point.annotation =
        trendTier === 'pro'
          ? 'Oct 26: Render hiked Pro +31% ($19→$25); NexusCloud held $19 & doubled egress to 1 TB'
          : trendTier === 'team'
            ? 'Oct 26: Vercel effective Team spend rose +30% ($50→$65); Render Org rose +34% ($29→$39)'
            : 'Oct 26: Starter hobby tier remains $0/mo on NexusCloud, Vercel & Render vs $5/mo minimum on Fly.io';
    }

    return point;
  });
}


