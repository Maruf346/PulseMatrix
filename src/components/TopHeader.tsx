import React, { useEffect, useRef } from 'react';
import {
  Plus,
  Radar,
  Search,
  Sparkles,
  X,
  Building2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { WorkspaceConfig } from '../types/intelligence';

export type ActiveTab = 'matrix' | 'battlecards' | 'radar';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  workspaces: WorkspaceConfig[];
  selectedWorkspace: WorkspaceConfig;
  onSelectWorkspace: (ws: WorkspaceConfig) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenScanModal: () => void;
  changesCount7d: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  searchQuery,
  onSearchChange,
  onOpenScanModal,
  changesCount7d,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wsDropdownOpen, setWsDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 h-14">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('matrix');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            PulseMatrix
          </a>

          {/* Zone 2: Primary View Navigation Links */}
          <nav
            aria-label="Primary Intelligence Views"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => onSelectTab('matrix')}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Pricing & Feature Matrix
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('battlecards')}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'battlecards'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sales Battlecards
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('radar')}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'radar'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly Change Radar ({changesCount7d})
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:translate-y-0 hover:-translate-y-0.5 transition-all duration-150 rounded-xl shadow-[0_2px_10px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-300" />
              <span>Add / Scan Competitor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Non-Sticky Workspace Context, Search & Mobile View Switcher Toolbar */}
      <div className="bg-white/60 border-b border-slate-200/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5">
          {/* Left: Workspace Selector + Sync Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setWsDropdownOpen((prev) => !prev)}
                aria-expanded={wsDropdownOpen}
                aria-label="Select Workspace"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedWorkspace.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {wsDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-lg py-1.5 z-40">
                  <div className="px-3 py-1 text-[11px] font-medium text-slate-400">
                    Active Product Workspaces
                  </div>
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === selectedWorkspace.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          onSelectWorkspace(ws);
                          setWsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/60 text-slate-900 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="text-slate-900 font-medium">{ws.name}</div>
                          <div className="text-[11px] text-slate-500">{ws.segment}</div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span aria-hidden="true" className="hidden sm:inline text-slate-300">
              ·
            </span>
            <span className="font-mono text-slate-500 tabular-nums">
              {selectedWorkspace.lastSyncedLabel}
            </span>
            <span aria-hidden="true" className="hidden lg:inline text-slate-300">
              ·
            </span>
            <span className="hidden lg:inline text-slate-500">
              Benchmarking <strong className="font-medium text-slate-700">{selectedWorkspace.ourProductName}</strong>
            </span>
          </div>

          {/* Right: Global Filter Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter features, tiers, SSO, egress... (⌘K)"
              aria-label="Global Matrix and Battlecard Search"
              className="w-full pl-8 pr-14 py-1.5 text-xs bg-slate-50/90 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Tab Switcher (<768px) */}
        <div
          role="tablist"
          aria-label="Mobile View Switcher"
          className="flex md:hidden items-center gap-1.5 py-2 overflow-x-auto no-scrollbar border-t border-slate-100"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'matrix'}
            onClick={() => onSelectTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            Pricing & Feature Matrix
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'battlecards'}
            onClick={() => onSelectTab('battlecards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'battlecards'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Battlecards
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'radar'}
            onClick={() => onSelectTab('radar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Change Radar ({changesCount7d})
          </button>
        </div>
        </div>
      </div>
    </>
  );
};
