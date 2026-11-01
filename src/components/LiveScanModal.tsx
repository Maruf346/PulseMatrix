import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
  Loader2,
  Radar,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CompetitorProfile,
  RadarChangeEvent,
} from '../types/intelligence';
import { SCAN_PRESETS } from '../data/seedData';

interface LiveScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  ourProductName: string;
  onScanComplete: (result: {
    competitor: CompetitorProfile;
    radarEvent: RadarChangeEvent;
    groundingSources: Array<{ title: string; uri: string }>;
  }) => void;
}

const SCAN_STEPS = [
  'Fetching live pricing signals & Google Search grounding...',
  'Normalizing Starter / Pro / Team / Enterprise tier limits...',
  'Synthesizing sales battlecard kill-points & landmines...',
];

export const LiveScanModal: React.FC<LiveScanModalProps> = ({
  isOpen,
  onClose,
  ourProductName,
  onScanComplete,
}) => {
  const [competitorName, setCompetitorName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (presetIndex: number) => {
    const preset = SCAN_PRESETS[presetIndex];
    if (!preset) return;
    setCompetitorName(preset.name);
    setCompetitorUrl(preset.url);
    setRawText(preset.rawSnippet);
    setErrorMsg(null);
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorName.trim()) {
      setErrorMsg('Please enter a competitor name (or click a quick preset above).');
      return;
    }

    setErrorMsg(null);
    setIsScanning(true);
    setCurrentStepIndex(0);

    const stepTimer1 = setTimeout(() => setCurrentStepIndex(1), 450);
    const stepTimer2 = setTimeout(() => setCurrentStepIndex(2), 900);

    try {
      const response = await fetch('/api/gemini/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorName: competitorName.trim(),
          competitorUrl: competitorUrl.trim(),
          rawText: rawText.trim(),
          ourProductName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze competitor pricing.');
      }

      // Brief pause so user sees step 3 complete smoothly
      await new Promise((resolve) => setTimeout(resolve, 400));

      onScanComplete({
        competitor: data.competitor,
        radarEvent: data.radarEvent,
        groundingSources: data.groundingSources || [],
      });
      setCompetitorName('');
      setCompetitorUrl('');
      setRawText('');
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Live scan failed. Please try again.'
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-scan-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
    >
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-600">
              <Radar className="w-4 h-4" />
              <span>Gemini Live Competitive Intelligence Scanner</span>
            </div>
            <h2
              id="live-scan-modal-title"
              className="text-lg font-bold tracking-tight text-slate-900 mt-1"
            >
              Run Live AI Competitor Pricing Scan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter any competitor name & pricing URL (or paste raw pricing markdown) to extract tiers, feature parity, and sales battlecards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Live Scan Modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* One-Click Presets */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-600">
            Quick-Fill Verified Competitor Targets:
          </div>
          <div className="flex flex-wrap gap-2">
            {SCAN_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(idx)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl transition-colors cursor-pointer"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="scan-comp-name"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Competitor Name *
              </label>
              <input
                id="scan-comp-name"
                type="text"
                value={competitorName}
                onChange={(e) => {
                  setCompetitorName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Railway, Supabase, AWS Amplify"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="scan-comp-url"
                className="block text-xs font-semibold text-slate-800 mb-1"
              >
                Pricing / Changelog URL
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="scan-comp-url"
                  type="text"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  placeholder="https://railway.com/pricing"
                  className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="scan-raw-text"
              className="block text-xs font-semibold text-slate-800 mb-1"
            >
              Raw Pricing Page Text / Changelog Markdown (Optional)
            </label>
            <textarea
              id="scan-raw-text"
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste pricing table snippets or leave blank to use Gemini Google Search Grounding..."
              className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="text-xs font-medium text-red-600">{errorMsg}</div>
          )}

          {/* Realistic Multi-Step Progress Shimmer during Gemini Scan */}
          {isScanning && (
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2.5">
              {SCAN_STEPS.map((stepText, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={stepText}
                    className={`flex items-center gap-2.5 text-xs font-mono ${
                      isCurrent
                        ? 'text-indigo-700 font-semibold'
                        : isDone
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Analyze with Gemini</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
