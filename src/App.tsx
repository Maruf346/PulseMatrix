import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';
import {
  BillingCycle,
  CompetitorProfile,
  RadarChangeEvent,
  TierId,
  WorkspaceConfig,
} from './types/intelligence';
import {
  INITIAL_COMPETITORS,
  INITIAL_FEATURES,
  INITIAL_RADAR_EVENTS,
  OUR_PRODUCT,
  WORKSPACES,
} from './data/seedData';
import { computeKpiSummary } from './utils/pricingMath';
import { ActiveTab, TopHeader } from './components/TopHeader';
import { KpiRibbon } from './components/KpiRibbon';
import { PricingMatrixView } from './components/PricingMatrixView';
import { BattlecardsView } from './components/BattlecardsView';
import { ChangeRadarView } from './components/ChangeRadarView';
import { LiveScanModal } from './components/LiveScanModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceConfig>(
    WORKSPACES[0]
  );
  const [competitors, setCompetitors] =
    useState<CompetitorProfile[]>(INITIAL_COMPETITORS);
  const [radarEvents, setRadarEvents] =
    useState<RadarChangeEvent[]>(INITIAL_RADAR_EVENTS);

  // Matrix & global filter state
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedTier, setSelectedTier] = useState<TierId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] =
    useState<string>('All Features');
  const [changedOnly, setChangedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Battlecard selected competitor
  const [selectedBattlecardCompetitorId, setSelectedBattlecardCompetitorId] =
    useState<string>(INITIAL_COMPETITORS[0].id);

  // Live Scan Modal state & notification banner
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [lastScannedBanner, setLastScannedBanner] = useState<{
    competitorName: string;
    competitorId: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);

  const ourProductForWorkspace: CompetitorProfile = {
    ...OUR_PRODUCT,
    name: selectedWorkspace.ourProductName,
    url: selectedWorkspace.ourProductUrl,
  };

  const kpiSummary = computeKpiSummary(
    ourProductForWorkspace,
    competitors,
    INITIAL_FEATURES,
    radarEvents
  );

  const handleOpenBattlecardForCompetitor = (competitorId: string) => {
    setSelectedBattlecardCompetitorId(competitorId);
    setActiveTab('battlecards');
  };

  const handleActivateChangedThisWeek = () => {
    setActiveTab('matrix');
    setChangedOnly(true);
    setSelectedCategory('All Features');
    setSelectedTier('all');
  };

  const handleResetMatrixFilters = () => {
    setSelectedCategory('All Features');
    setSelectedTier('all');
    setChangedOnly(false);
    setSearchQuery('');
  };

  const handleScanComplete = (result: {
    competitor: CompetitorProfile;
    radarEvent: RadarChangeEvent;
    groundingSources: Array<{ title: string; uri: string }>;
  }) => {
    setCompetitors((prev) => {
      const existsIndex = prev.findIndex((c) => c.id === result.competitor.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = result.competitor;
        return updated;
      }
      return [...prev, result.competitor];
    });

    setRadarEvents((prev) => [result.radarEvent, ...prev]);
    setSelectedBattlecardCompetitorId(result.competitor.id);
    setLastScannedBanner({
      competitorName: result.competitor.name,
      competitorId: result.competitor.id,
      sources: result.groundingSources,
    });
  };

  return (
    <div
      id="top"
      className="min-h-screen bg-[#F8FAFC] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-slate-50 text-slate-900 flex flex-col"
    >
      {/* Sticky Glass Top Header */}
      <TopHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        workspaces={WORKSPACES}
        selectedWorkspace={selectedWorkspace}
        onSelectWorkspace={setSelectedWorkspace}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        changesCount7d={kpiSummary.changesDetected7d}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Live Scan Completion Notification Banner */}
        {lastScannedBanner && (
          <div className="mb-5 p-4 bg-white/95 backdrop-blur-xl border border-emerald-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-slate-900">
                  Live Gemini Scan Completed for {lastScannedBanner.competitorName}:
                </span>{' '}
                <span className="text-slate-600">
                  Added pricing tiers, 12 feature benchmarks, weekly diff alerts, and sales battlecard.
                </span>
                {lastScannedBanner.sources.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-2">
                    {lastScannedBanner.sources.slice(0, 2).map((s) => (
                      <a
                        key={s.uri}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-mono"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleOpenBattlecardForCompetitor(lastScannedBanner.competitorId)
                }
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Inspect {lastScannedBanner.competitorName} Battlecard
              </button>
              <button
                type="button"
                onClick={() => setLastScannedBanner(null)}
                aria-label="Dismiss scan notification"
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4-Card Glossy KPI Summary Ribbon */}
        <KpiRibbon
          kpi={kpiSummary}
          competitorNames={competitors.map((c) => c.name)}
          onNavigateTab={setActiveTab}
          onActivateChangedThisWeek={handleActivateChangedThisWeek}
        />

        {/* Core View Switcher Content */}
        {activeTab === 'matrix' && (
          <PricingMatrixView
            ourProduct={ourProductForWorkspace}
            competitors={competitors}
            features={INITIAL_FEATURES}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            changedOnly={changedOnly}
            onToggleChangedOnly={setChangedOnly}
            searchQuery={searchQuery}
            onResetFilters={handleResetMatrixFilters}
            onOpenBattlecardForCompetitor={handleOpenBattlecardForCompetitor}
          />
        )}

        {activeTab === 'battlecards' && (
          <BattlecardsView
            ourProduct={ourProductForWorkspace}
            competitors={competitors}
            selectedCompetitorId={selectedBattlecardCompetitorId}
            onSelectCompetitorId={setSelectedBattlecardCompetitorId}
            billingCycle={billingCycle}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'radar' && (
          <ChangeRadarView
            events={radarEvents}
            ourProductName={ourProductForWorkspace.name}
            searchQuery={searchQuery}
            onOpenBattlecardForCompetitor={handleOpenBattlecardForCompetitor}
          />
        )}
      </main>

      {/* Quiet Minimal Footer */}
      <footer className="border-t border-slate-200/70 bg-white/60 py-4 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            PulseMatrix · Competitive Pricing & Revenue Enablement Workspace
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Pricing Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('battlecards')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Battlecards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Change Radar
            </button>
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              className="hover:text-slate-900 font-medium text-slate-700 cursor-pointer"
            >
              Run Live Scan
            </button>
          </div>
        </div>
      </footer>

      {/* Live AI Competitor Scan Modal */}
      <LiveScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        ourProductName={ourProductForWorkspace.name}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
