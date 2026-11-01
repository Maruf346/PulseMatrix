import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Radar,
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

interface EmailModalState {
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
  const [emailModal, setEmailModal] = useState<EmailModalState | null>(null);
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
    setEmailModal({
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
        setEmailModal({
          event,
          subject: data.subject || initialDraft.subject,
          recipients: data.recipients || initialDraft.recipients,
          body: data.body || initialDraft.body,
          isLoading: false,
        });
        return;
      }
    } catch {
      // fallback to deterministic draft already loaded
    }

    setEmailModal((prev) => (prev ? { ...prev, isLoading: false } : null));
  };

  return (
    <div className="space-y-6">
      {/* Radar Filter Controls */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            30-Day Competitor Pricing & Packaging Diff Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every verified pricing change, bandwidth limit reduction, and feature repackaging across tracked competitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Competitor Filter */}
          <div
            role="group"
            aria-label="Filter Radar by Competitor"
            className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setSelectedCompetitor('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCompetitor === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
            className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl"
          >
            {(['all', 'High Sales Impact', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev === 'all' ? 'All Severities' : sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline List */}
      <div className="relative pl-4 sm:pl-6 border-l border-slate-200/90 space-y-5">
        {filteredEvents.map((ev) => {
          const isHigh = ev.severity === 'High Sales Impact';
          const isMed = ev.severity === 'Medium';

          return (
            <article
              key={ev.id}
              className="relative bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-4px_rgba(15,23,42,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-4"
            >
              {/* Metadata Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="font-bold text-slate-900">{ev.competitorName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{ev.detectedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{ev.daysAgo}d ago</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 capitalize">{ev.affectedTier} Tier</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isHigh
                        ? 'text-amber-700'
                        : isMed
                        ? 'text-indigo-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {ev.severity} · {ev.category}
                  </span>
                </div>
              </div>

              {/* Headline & Summary */}
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  {ev.headline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {ev.summary}
                </p>
              </div>

              {/* Visual Before -> After Diff Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl font-mono text-xs tabular-nums">
                <div>
                  <div className="text-[10px] text-slate-400">BEFORE (PREVIOUS STATE)</div>
                  <div className="line-through text-slate-500 mt-1">
                    {ev.beforeValue}
                  </div>
                </div>
                <div className="md:border-l md:border-slate-200/80 md:pl-4">
                  <div className="text-[10px] text-slate-400">AFTER (DETECTED LIVE)</div>
                  <div className="text-slate-900 font-bold mt-1">
                    {ev.afterValue}
                  </div>
                </div>
              </div>

              {/* Recommended Action & Footer Controls */}
              <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600">
                  <strong className="font-semibold text-slate-900">
                    RevOps Playbook:{' '}
                  </strong>
                  {ev.recommendedAction}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{ev.sourceTitle}</span>
                  </a>

                  {ev.competitorId !== 'nexuscloud' && (
                    <button
                      type="button"
                      onClick={() => onOpenBattlecardForCompetitor(ev.competitorId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>View Battlecard</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEmailGenerator(ev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Generate Sales Alert Email</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sales Alert Email Generator Modal */}
      {emailModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-email-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-indigo-600">
                  Revenue Enablement Alert Dispatch
                </div>
                <h3
                  id="sales-email-modal-title"
                  className="text-base font-bold text-slate-900 mt-0.5"
                >
                  Sales Team Alert: {emailModal.event.competitorName} Pricing Shift
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModal(null)}
                aria-label="Close Sales Alert Email Modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div>
                  <span className="text-slate-400 font-mono">TO: </span>
                  <span className="text-slate-700 font-mono">{emailModal.recipients}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono">SUBJECT: </span>
                  <span className="text-slate-900 font-semibold">{emailModal.subject}</span>
                </div>
              </div>

              <textarea
                aria-label="Sales Alert Email Body"
                rows={12}
                value={emailModal.body}
                onChange={(e) =>
                  setEmailModal((prev) =>
                    prev ? { ...prev, body: e.target.value } : null
                  )
                }
                className="w-full p-3.5 text-xs font-mono text-slate-800 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                {emailModal.isLoading
                  ? 'Refining talking points with Gemini...'
                  : 'Ready to paste into Slack #sales-alerts or Gmail'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const fullText = `Subject: ${emailModal.subject}\n\n${emailModal.body}`;
                    try {
                      await navigator.clipboard.writeText(fullText);
                    } catch {
                      // ignore
                    }
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Email to Clipboard</span>
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
                  onClick={() => setEmailModal(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
