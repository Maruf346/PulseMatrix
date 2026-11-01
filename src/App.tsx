import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Dashboard shell & dual-theme state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pulsematrix_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pulsematrix_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDarkMode]);

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

  // Live Scan Drawer state & notification banner
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
      className="min-h-screen bg-[#F3F6FC] dark:bg-[#060913] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.10),transparent)] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150"
    >
      {/* Collapsible Left Sidebar + Workspace Top Bar Shell */}
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
        competitors={competitors}
        selectedCompetitorId={selectedBattlecardCompetitorId}
        onQuickJumpCompetitor={handleOpenBattlecardForCompetitor}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((p) => !p)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((p) => !p)}
      />

      {/* Main Content Viewport offset by Sidebar width on Desktop */}
      <div
        className={`flex-1 flex flex-col transition-[padding] duration-200 ${
          isSidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-64'
        }`}
      >
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5">
          {/* Live Scan Completion Notification Banner */}
          <AnimatePresence>
            {lastScannedBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3.5 bg-white dark:bg-slate-900 border border-emerald-300/90 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Live Gemini Scan Completed for {lastScannedBanner.competitorName}:
                    </span>{' '}
                    <span className="text-slate-600 dark:text-slate-300">
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
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
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
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl cursor-pointer"
                  >
                    Inspect {lastScannedBanner.competitorName} Battlecard
                  </button>
                  <button
                    type="button"
                    onClick={() => setLastScannedBanner(null)}
                    aria-label="Dismiss scan notification"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4-Card KPI Summary Ribbon */}
          <KpiRibbon
            kpi={kpiSummary}
            competitorNames={competitors.map((c) => c.name)}
            onNavigateTab={setActiveTab}
            onActivateChangedThisWeek={handleActivateChangedThisWeek}
          />

          {/* Smooth View Crossfade with Framer Motion */}
          <AnimatePresence mode="wait">
            {activeTab === 'matrix' && (
              <motion.div
                key="view-matrix"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
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
              </motion.div>
            )}

            {activeTab === 'battlecards' && (
              <motion.div
                key="view-battlecards"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                <BattlecardsView
                  ourProduct={ourProductForWorkspace}
                  competitors={competitors}
                  selectedCompetitorId={selectedBattlecardCompetitorId}
                  onSelectCompetitorId={setSelectedBattlecardCompetitorId}
                  billingCycle={billingCycle}
                  searchQuery={searchQuery}
                />
              </motion.div>
            )}

            {activeTab === 'radar' && (
              <motion.div
                key="view-radar"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                <ChangeRadarView
                  events={radarEvents}
                  ourProductName={ourProductForWorkspace.name}
                  searchQuery={searchQuery}
                  onOpenBattlecardForCompetitor={handleOpenBattlecardForCompetitor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Quiet Minimal Footer */}
        <footer className="border-t border-slate-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-3.5 px-4 sm:px-6 mt-10">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div>
              PulseMatrix · Competitive Pricing & Revenue Enablement Workspace
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Pricing Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('battlecards')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Battlecards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('radar')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Change Radar
              </button>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="hover:text-slate-900 dark:hover:text-white font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Run Live Scan
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Slide-Over Right Live AI Competitor Scan Drawer */}
      <LiveScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        ourProductName={ourProductForWorkspace.name}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
