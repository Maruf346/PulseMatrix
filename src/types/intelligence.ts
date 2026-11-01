export type TierId = 'starter' | 'pro' | 'team' | 'enterprise';

export type FeatureCategory =
  | 'Core Infrastructure'
  | 'Security & Compliance'
  | 'AI & Usage Limits'
  | 'Support & SLA';

export type BillingCycle = 'monthly' | 'annual';

export type ChangeType = 'price_hike' | 'price_drop' | 'new_feature' | 'limit_cut';

export type ImpactLevel = 'High Sales Impact' | 'Medium' | 'Low';

export interface DiffChange {
  daysAgo: number;
  dateLabel: string;
  previousValue: string;
  currentValue: string;
  changeType: ChangeType;
  reason: string;
  sourceUrl: string;
  sourceTitle: string;
  impactLevel: ImpactLevel;
}

export interface TierPricing {
  tierId: TierId;
  tierName: string;
  audience: string;
  monthlyPrice: number | null;
  customLabel?: string;
  perSeatNote: string;
  includedSummary: string;
  diff?: DiffChange;
}

export interface FeatureValue {
  value: string;
  advantage: 'ours' | 'theirs' | 'neutral';
  detailNote?: string;
  diff?: DiffChange;
}

export interface FeatureDefinition {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  tierApplicability: TierId[];
  ourValue: FeatureValue;
}

export interface KillPoint {
  id: string;
  title: string;
  proofMetric: string;
  talkingPoint: string;
  featureRef: string;
}

export interface LandminePoint {
  id: string;
  title: string;
  honestGap: string;
  pivotStrategy: string;
}

export interface PresetObjection {
  id: string;
  objection: string;
  rebuttal: string;
  proofCitation: string;
}

export interface CompetitorBattlecard {
  executiveSummary: string;
  targetSweetSpot: string;
  killPoints: KillPoint[];
  landmines: LandminePoint[];
  presetObjections: PresetObjection[];
}

export interface CompetitorProfile {
  id: string;
  name: string;
  url: string;
  tagline: string;
  lastScanned: string;
  threatLevel: 'Primary Threat' | 'Emerging Challenger' | 'Legacy Incumbent';
  winRateAgainst: number;
  winRateDelta: string;
  tiers: Record<TierId, TierPricing>;
  features: Record<string, FeatureValue>;
  battlecard: CompetitorBattlecard;
}

export interface RadarChangeEvent {
  id: string;
  competitorId: string;
  competitorName: string;
  detectedDate: string;
  daysAgo: number;
  headline: string;
  summary: string;
  severity: ImpactLevel;
  category: 'Pricing Shift' | 'Limit Reduction' | 'Feature Launch' | 'Packaging Change';
  beforeValue: string;
  afterValue: string;
  affectedTier: TierId;
  sourceUrl: string;
  sourceTitle: string;
  recommendedAction: string;
}

export interface WorkspaceConfig {
  id: string;
  name: string;
  ourProductName: string;
  ourProductUrl: string;
  segment: string;
  lastSyncedLabel: string;
}
