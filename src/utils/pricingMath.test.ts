import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDisplayedPrice,
  computeKpiSummary,
  filterFeatureRows,
  filterTierIds,
  formatBattlecardMarkdown,
  generateSalesAlertEmailDraft,
} from './pricingMath';
import {
  INITIAL_COMPETITORS,
  INITIAL_FEATURES,
  INITIAL_RADAR_EVENTS,
  OUR_PRODUCT,
} from '../data/seedData';

test('calculateDisplayedPrice applies 20% discount on annual billing and preserves $0 / Custom', () => {
  const monthly = calculateDisplayedPrice(25, 'monthly');
  assert.equal(monthly.formattedPrice, '$25');
  assert.equal(monthly.rawNumericPrice, 25);
  assert.equal(monthly.annualSavingsPerUnit, 0);

  const annual = calculateDisplayedPrice(25, 'annual', undefined, '$20/mo');
  assert.equal(annual.formattedPrice, '$20');
  assert.equal(annual.rawNumericPrice, 20);
  assert.equal(annual.annualSavingsPerUnit, 60);
  assert.equal(annual.formattedPreviousPrice, '$16/mo');

  const freeTier = calculateDisplayedPrice(0, 'annual');
  assert.equal(freeTier.formattedPrice, '$0');

  const enterprise = calculateDisplayedPrice(null, 'annual', 'Custom SLA');
  assert.equal(enterprise.formattedPrice, 'Custom SLA');
});

test('filterFeatureRows filters by category, changedOnly, and searchQuery', () => {
  const all = filterFeatureRows(INITIAL_FEATURES, INITIAL_COMPETITORS, {
    category: 'All Features',
    tier: 'all',
    changedOnly: false,
    searchQuery: '',
  });
  assert.equal(all.length, 12);

  const securityOnly = filterFeatureRows(INITIAL_FEATURES, INITIAL_COMPETITORS, {
    category: 'Security & Compliance',
    tier: 'all',
    changedOnly: false,
    searchQuery: '',
  });
  assert.ok(securityOnly.length > 0);
  assert.ok(securityOnly.every((f) => f.category === 'Security & Compliance'));

  const changedOnly = filterFeatureRows(INITIAL_FEATURES, INITIAL_COMPETITORS, {
    category: 'All Features',
    tier: 'all',
    changedOnly: true,
    searchQuery: '',
  });
  assert.ok(changedOnly.length >= 3);
});

test('filterTierIds respects tier selection and changedOnly toggle', () => {
  const allTiers = filterTierIds(
    ['starter', 'pro', 'team', 'enterprise'],
    OUR_PRODUCT,
    INITIAL_COMPETITORS,
    {
      tier: 'all',
      changedOnly: false,
      searchQuery: '',
    }
  );
  assert.equal(allTiers.length, 4);

  const changedTiers = filterTierIds(
    ['starter', 'pro', 'team', 'enterprise'],
    OUR_PRODUCT,
    INITIAL_COMPETITORS,
    {
      tier: 'all',
      changedOnly: true,
      searchQuery: '',
    }
  );
  assert.ok(changedTiers.includes('pro'));
  assert.ok(changedTiers.includes('team'));
});

test('computeKpiSummary calculates active entities, 7d changes, and competitiveness score', () => {
  const kpi = computeKpiSummary(
    OUR_PRODUCT,
    INITIAL_COMPETITORS,
    INITIAL_FEATURES,
    INITIAL_RADAR_EVENTS
  );
  assert.equal(kpi.trackedEntitiesCount, 4);
  assert.equal(kpi.competitorCount, 3);
  assert.equal(kpi.changesDetected7d, 5);
  assert.ok(kpi.priceCompetitivenessScore >= 80 && kpi.priceCompetitivenessScore <= 99);
});

test('formatBattlecardMarkdown and generateSalesAlertEmailDraft produce rich output', () => {
  const md = formatBattlecardMarkdown(OUR_PRODUCT, INITIAL_COMPETITORS[0], 'monthly');
  assert.ok(md.includes('NexusCloud vs. Vercel'));
  assert.ok(md.includes('Why We Win (Kill Points)'));

  const email = generateSalesAlertEmailDraft(INITIAL_RADAR_EVENTS[0], 'NexusCloud');
  assert.ok(email.subject.includes(INITIAL_RADAR_EVENTS[0].competitorName));
  assert.ok(email.body.includes(INITIAL_RADAR_EVENTS[0].beforeValue));
  assert.ok(email.body.includes(INITIAL_RADAR_EVENTS[0].afterValue));
});
