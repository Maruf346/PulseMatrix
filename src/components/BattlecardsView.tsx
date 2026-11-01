import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  MessageSquareQuote,
  Printer,
  Send,
  ShieldAlert,
  Target,
} from 'lucide-react';
import {
  BillingCycle,
  CompetitorProfile,
} from '../types/intelligence';
import {
  calculateDisplayedPrice,
  formatBattlecardMarkdown,
} from '../utils/pricingMath';

interface BattlecardsViewProps {
  ourProduct: CompetitorProfile;
  competitors: CompetitorProfile[];
  selectedCompetitorId: string;
  onSelectCompetitorId: (id: string) => void;
  billingCycle: BillingCycle;
  searchQuery: string;
}

interface GeneratedRebuttalResult {
  rebuttal: string;
  proofCitation: string;
  followUpQuestion: string;
}

export const BattlecardsView: React.FC<BattlecardsViewProps> = ({
  ourProduct,
  competitors,
  selectedCompetitorId,
  onSelectCompetitorId,
  billingCycle,
  searchQuery,
}) => {
  const activeCompetitor =
    competitors.find((c) => c.id === selectedCompetitorId) || competitors[0];

  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedRebuttal, setCopiedRebuttal] = useState(false);
  const [openObjectionId, setOpenObjectionId] = useState<string | null>(
    activeCompetitor?.battlecard.presetObjections[0]?.id || null
  );
  const [customObjection, setCustomObjection] = useState('');
  const [isGeneratingRebuttal, setIsGeneratingRebuttal] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [generatedRebuttal, setGeneratedRebuttal] =
    useState<GeneratedRebuttalResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!activeCompetitor) {
    return null;
  }

  const ourProPrice = calculateDisplayedPrice(
    ourProduct.tiers.pro.monthlyPrice,
    billingCycle
  ).formattedPrice;

  const compProPrice = calculateDisplayedPrice(
    activeCompetitor.tiers.pro.monthlyPrice,
    billingCycle
  ).formattedPrice;

  const handleCopyBattlecard = async () => {
    const md = formatBattlecardMarkdown(
      ourProduct,
      activeCompetitor,
      billingCycle
    );
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // Fallback if clipboard API is restricted
    }
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const handlePrintExport = () => {
    window.print();
  };

  const handleSimulateObjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customObjection.trim()) {
      setErrorMessage('Please enter a prospect objection or select a quick prompt below.');
      return;
    }

    setErrorMessage(null);
    setIsGeneratingRebuttal(true);
    setLoadingStepText('Cross-referencing live pricing & feature parity matrix...');

    const stepTimer = setTimeout(() => {
      setLoadingStepText('Synthesizing 3-sentence rebuttal & proof metrics with Gemini...');
    }, 450);

    try {
      const response = await fetch('/api/gemini/objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorName: activeCompetitor.name,
          objection: customObjection,
          billingCycle,
          competitorProPrice: compProPrice,
          ourProPrice,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate rebuttal');
      }
      setGeneratedRebuttal(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to generate objection rebuttal.'
      );
    } finally {
      clearTimeout(stepTimer);
      setIsGeneratingRebuttal(false);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredKillPoints = activeCompetitor.battlecard.killPoints.filter(
    (kp) =>
      !q ||
      kp.title.toLowerCase().includes(q) ||
      kp.talkingPoint.toLowerCase().includes(q) ||
      kp.proofMetric.toLowerCase().includes(q)
  );

  const filteredLandmines = activeCompetitor.battlecard.landmines.filter(
    (lm) =>
      !q ||
      lm.title.toLowerCase().includes(q) ||
      lm.honestGap.toLowerCase().includes(q) ||
      lm.pivotStrategy.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      {/* Competitor Selector & Export Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Competitor Selector Tabs with layoutId */}
        <div
          role="tablist"
          aria-label="Select Competitor Battlecard"
          className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-xl overflow-x-auto"
        >
          {competitors.map((comp) => {
            const isSelected = comp.id === activeCompetitor.id;
            return (
              <button
                key={comp.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectCompetitorId(comp.id);
                  setGeneratedRebuttal(null);
                  setOpenObjectionId(comp.battlecard.presetObjections[0]?.id || null);
                }}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer z-10 ${
                  isSelected
                    ? 'text-white dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="battlecard-competitor-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 bg-slate-900 dark:bg-white rounded-lg shadow-xs -z-10"
                  />
                )}
                <span>vs. {comp.name}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isSelected
                      ? 'text-emerald-300 dark:text-emerald-700'
                      : 'text-slate-400 dark:text-slate-400'
                  }`}
                >
                  {comp.winRateAgainst}% win
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: One-Click Copy / Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBattlecard}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedMarkdown ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  Copied for Slack / Notion!
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copy Battlecard for Slack/Notion</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Competitor Overview Banner */}
      <motion.div
        key={activeCompetitor.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {activeCompetitor.threatLevel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                CRM Win Rate: {activeCompetitor.winRateAgainst}% ({activeCompetitor.winRateDelta})
              </span>
              <span aria-hidden="true">·</span>
              <a
                href={activeCompetitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline decoration-dotted"
              >
                <span>{activeCompetitor.url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {ourProduct.name} vs. {activeCompetitor.name} — Field Sales Battlecard
            </h2>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-4 py-2.5 tabular-nums shrink-0">
            <div>
              <div className="text-[10px] text-slate-400">OUR PRO TIER</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {ourProPrice}/mo
              </div>
            </div>
            <div className="text-slate-300 dark:text-slate-600">vs</div>
            <div>
              <div className="text-[10px] text-slate-400">
                {activeCompetitor.name.toUpperCase()} PRO
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {compProPrice}/mo
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Executive Positioning Summary
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeCompetitor.battlecard.executiveSummary}
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Ideal Displacement Sweet Spot
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeCompetitor.battlecard.targetSweetSpot}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Two-Column Battlecard Layout: Kill Points vs Landmines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Column 1: Why We Win (Kill Points) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Why We Win (Kill Points)
              </h3>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {filteredKillPoints.length} Verified Proofs
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {filteredKillPoints.map((kp, index) => (
              <div key={kp.id} className="py-3.5 first:pt-2 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                    0{index + 1}. {kp.title}
                  </h4>
                  <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {kp.proofMetric}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {kp.talkingPoint}
                </p>
                <div className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  Matrix Proof Row:{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {kp.featureRef}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Where They Beat Us (Landmines to Avoid) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Where They Beat Us (Landmines to Avoid)
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              Honest Gaps & Pivots
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {filteredLandmines.map((lm, index) => (
              <div key={lm.id} className="py-3.5 first:pt-2 last:pb-0 space-y-2">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                  0{index + 1}. {lm.title}
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="font-semibold text-amber-800 dark:text-amber-300">
                    Honest Gap:{' '}
                  </strong>
                  {lm.honestGap}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/80 rounded-xl p-3 leading-relaxed">
                  <strong className="font-semibold text-indigo-600 dark:text-indigo-400">
                    How to Pivot the Conversation:{' '}
                  </strong>
                  {lm.pivotStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live AI Objection Handler Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Live AI Objection Handler Simulator (vs. {activeCompetitor.name})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Type any live prospect objection on a call and Gemini synthesizes a 3-sentence rebuttal using current matrix telemetry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setCustomObjection(
                  `${activeCompetitor.name} says their Enterprise SSO and compliance package is safer for our Series B security audit.`
                )
              }
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Try: &ldquo;SSO & Security Audit&rdquo;
            </button>
            <button
              type="button"
              onClick={() =>
                setCustomObjection(
                  `${activeCompetitor.name} Pro looks nearly the same price per seat—why should we spend engineering cycles migrating?`
                )
              }
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Try: &ldquo;Migration ROI & Seat Price&rdquo;
            </button>
          </div>
        </div>

        {/* Custom Objection Form */}
        <form onSubmit={handleSimulateObjection} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <label htmlFor="objection-input" className="sr-only">
              Prospect Objection
            </label>
            <input
              id="objection-input"
              type="text"
              value={customObjection}
              onChange={(e) => {
                setCustomObjection(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={`e.g. "${activeCompetitor.name} includes preview environments and our engineers already know their CLI..."`}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isGeneratingRebuttal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-60 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-300 dark:text-white" />
            <span>
              {isGeneratingRebuttal ? 'Synthesizing Rebuttal...' : 'Generate Rebuttal'}
            </span>
          </button>
        </form>

        {errorMessage && (
          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Loading Shimmer State */}
        {isGeneratingRebuttal && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl space-y-2 animate-pulse">
            <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              {loadingStepText}
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-11/12" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          </div>
        )}

        {/* Generated Live Rebuttal Result */}
        <AnimatePresence>
          {generatedRebuttal && !isGeneratingRebuttal && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 sm:p-5 bg-indigo-50/45 dark:bg-indigo-950/35 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  Gemini Grounded 3-Sentence Rebuttal
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedRebuttal.rebuttal);
                    } catch {
                      // ignore
                    }
                    setCopiedRebuttal(true);
                    setTimeout(() => setCopiedRebuttal(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {copiedRebuttal ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Talk Track</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                {generatedRebuttal.rebuttal}
              </p>

              <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-600 dark:text-slate-300">
                  <strong className="font-semibold text-slate-800 dark:text-white">
                    Matrix Proof:{' '}
                  </strong>
                  <span className="font-mono">{generatedRebuttal.proofCitation}</span>
                </div>
                <div className="text-indigo-800 dark:text-indigo-300 font-medium">
                  Follow-up Ask: {generatedRebuttal.followUpQuestion}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset Verified Field Objections Accordion */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Verified Field Objections for {activeCompetitor.name}
          </div>
          {activeCompetitor.battlecard.presetObjections.map((item) => {
            const isOpen = openObjectionId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenObjectionId(isOpen ? null : item.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                    &ldquo;{item.objection}&rdquo;
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/40 dark:bg-slate-800/30">
                    <p className="text-slate-800 dark:text-slate-200">{item.rebuttal}</p>
                    <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      Proof Citation: {item.proofCitation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
