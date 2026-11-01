import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Mail,
  X,
} from 'lucide-react';
import {
  ImpactLevel,
  RadarChangeEvent,
} from '../types/intelligence';
import { generateSalesAlertEmailDraft } from '../utils/pricingMath';

interface ChangeRadarViewProps {
  events: RadarChangeEvent[];
  ourProductName: string;
  searchQuery: string;
  onOpenBattlecardForCompetitor: (competitorId: string) => void;
}

interface EmailDrawerState {
  event: RadarChangeEvent;
  subject: string;
  recipients: string;
  body: string;
  isLoading: boolean;
}

export const ChangeRadarView: React.FC<ChangeRadarViewProps> = ({
  events,
  ourProductName,
  searchQuery,
  onOpenBattlecardForCompetitor,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | ImpactLevel>('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const [emailDrawer, setEmailDrawer] = useState<EmailDrawerState | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const uniqueCompetitors = Array.from(
    new Set(events.map((e) => e.competitorName))
  );

  const q = searchQuery.trim().toLowerCase();
  const filteredEvents = events.filter((ev) => {
    if (selectedSeverity !== 'all' && ev.severity !== selectedSeverity) {
      return false;
    }
    if (selectedCompetitor !== 'all' && ev.competitorName !== selectedCompetitor) {
      return false;
    }
    if (q) {
      const match =
        ev.headline.toLowerCase().includes(q) ||
        ev.summary.toLowerCase().includes(q) ||
        ev.competitorName.toLowerCase().includes(q) ||
        ev.beforeValue.toLowerCase().includes(q) ||
        ev.afterValue.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenEmailGenerator = async (event: RadarChangeEvent) => {
    const initialDraft = generateSalesAlertEmailDraft(event, ourProductName);
    setEmailDrawer({
      event,
      ...initialDraft,
      isLoading: true,
    });

    try {
      const res = await fetch('/api/gemini/sales-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, ourProductName }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailDrawer({
          event,
          subject: data.subject || initialDraft.subject,
          recipients: data.recipients || initialDraft.recipients,
          body: data.body || initialDraft.body,
          isLoading: false,
        });
        return;
      }
    } catch {
      // fallback to deterministic draft
    }

    setEmailDrawer((prev) => (prev ? { ...prev, isLoading: false } : null));
  };

  return (
    <div className="space-y-5">
      {/* Radar Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            30-Day Competitor Pricing & Packaging Diff Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every verified pricing change, bandwidth limit reduction, and feature repackaging across tracked competitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Competitor Filter */}
          <div
            role="group"
            aria-label="Filter Radar by Competitor"
            className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-xl overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setSelectedCompetitor('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCompetitor === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Entities
            </button>
            {uniqueCompetitors.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedCompetitor(name)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCompetitor === name
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div
            role="group"
            aria-label="Filter Radar by Impact Severity"
            className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 rounded-xl"
          >
            {(['all', 'High Sales Impact', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline List */}
      <div className="relative pl-4 sm:pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4">
        {filteredEvents.map((ev, index) => {
          const isHigh = ev.severity === 'High Sales Impact';
          const isMed = ev.severity === 'Medium';

          return (
            <motion.article
              key={ev.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: Math.min(index * 0.03, 0.15) }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 space-y-3.5"
            >
              {/* Metadata Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {ev.competitorName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{ev.detectedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{ev.daysAgo}d ago</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 dark:text-slate-300 capitalize">
                    {ev.affectedTier} Tier
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isHigh
                        ? 'text-amber-700 dark:text-amber-400'
                        : isMed
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {ev.severity} · {ev.category}
                  </span>
                </div>
              </div>

              {/* Headline & Summary */}
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {ev.headline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {ev.summary}
                </p>
              </div>

              {/* Visual Before -> After Diff Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl font-mono text-xs tabular-nums">
                <div>
                  <div className="text-[10px] text-slate-400">BEFORE (PREVIOUS STATE)</div>
                  <div className="line-through text-slate-500 dark:text-slate-400 mt-1">
                    {ev.beforeValue}
                  </div>
                </div>
                <div className="md:border-l md:border-slate-200/80 dark:md:border-slate-700 md:pl-4">
                  <div className="text-[10px] text-slate-400">AFTER (DETECTED LIVE)</div>
                  <div className="text-slate-900 dark:text-white font-bold mt-1">
                    {ev.afterValue}
                  </div>
                </div>
              </div>

              {/* Recommended Action & Footer Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 dark:text-slate-300">
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    RevOps Playbook:{' '}
                  </strong>
                  {ev.recommendedAction}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{ev.sourceTitle}</span>
                  </a>

                  {ev.competitorId !== 'nexuscloud' && (
                    <button
                      type="button"
                      onClick={() => onOpenBattlecardForCompetitor(ev.competitorId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>View Battlecard</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEmailGenerator(ev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-300 dark:text-white" />
                    <span>Generate Sales Alert Email</span>
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Slide-Over Right Sales Alert Email Generator Drawer */}
      <AnimatePresence>
        {emailDrawer && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-email-drawer-title"
            className="fixed inset-0 z-50 flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setEmailDrawer(null)}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      Revenue Enablement Alert Dispatch
                    </div>
                    <h3
                      id="sales-email-drawer-title"
                      className="text-base font-bold text-slate-900 dark:text-white mt-0.5"
                    >
                      Sales Team Alert: {emailDrawer.event.competitorName} Pricing Shift
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailDrawer(null)}
                    aria-label="Close Sales Alert Email Drawer"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-mono">TO: </span>
                      <span className="text-slate-700 dark:text-slate-200 font-mono">
                        {emailDrawer.recipients}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">SUBJECT: </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {emailDrawer.subject}
                      </span>
                    </div>
                  </div>

                  <textarea
                    aria-label="Sales Alert Email Body"
                    rows={14}
                    value={emailDrawer.body}
                    onChange={(e) =>
                      setEmailDrawer((prev) =>
                        prev ? { ...prev, body: e.target.value } : null
                      )
                    }
                    className="w-full p-3.5 text-xs font-mono text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">
                  {emailDrawer.isLoading
                    ? 'Refining talking points with Gemini...'
                    : 'Ready for Slack #sales-alerts or Gmail'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const fullText = `Subject: ${emailDrawer.subject}\n\n${emailDrawer.body}`;
                      try {
                        await navigator.clipboard.writeText(fullText);
                      } catch {
                        // ignore
                      }
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Email Draft</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email Draft</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailDrawer(null)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
