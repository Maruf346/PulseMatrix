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
