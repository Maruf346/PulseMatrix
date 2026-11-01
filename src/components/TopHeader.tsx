import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Menu,
  Moon,
  Plus,
  Radar,
  Search,
  Sparkles,
  Sun,
  Swords,
  X,
} from 'lucide-react';
import { CompetitorProfile, WorkspaceConfig } from '../types/intelligence';

export type ActiveTab = 'matrix' | 'battlecards' | 'radar';

interface DashboardShellHeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  workspaces: WorkspaceConfig[];
  selectedWorkspace: WorkspaceConfig;
  onSelectWorkspace: (ws: WorkspaceConfig) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenScanModal: () => void;
  changesCount7d: number;
  competitors: CompetitorProfile[];
  selectedCompetitorId: string;
  onQuickJumpCompetitor: (competitorId: string) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NAV_ITEMS: Array<{
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  accent: string;
}> = [
  {
    id: 'matrix',
    label: 'Pricing & Feature Matrix',
    shortLabel: 'Matrix',
    icon: LayoutGrid,
    accent: 'text-indigo-400',
  },
  {
    id: 'battlecards',
    label: 'Sales Battlecards',
    shortLabel: 'Battlecards',
    icon: Swords,
    accent: 'text-emerald-400',
  },
  {
    id: 'radar',
    label: 'Weekly Change Radar',
    shortLabel: 'Radar',
    icon: Activity,
    accent: 'text-amber-400',
  },
];

const RIVAL_DOT_COLORS = [
  'bg-amber-400',
  'bg-rose-500',
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-fuchsia-400',
];

export const TopHeader: React.FC<DashboardShellHeaderProps> = ({
  activeTab,
  onSelectTab,
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  searchQuery,
  onSearchChange,
  onOpenScanModal,
  changesCount7d,
  competitors,
  selectedCompetitorId,
  onQuickJumpCompetitor,
  isSidebarCollapsed,
  onToggleSidebar,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const currentViewLabel =
    NAV_ITEMS.find((i) => i.id === activeTab)?.label || 'Pricing & Feature Matrix';

  return (
    <>
      {/* Desktop Left Obsidian Command Sidebar */}
      <aside
        aria-label="Workspace Sidebar Navigation"
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#0B0F19] text-slate-200 border-r border-slate-800/90 shadow-xl transition-[width] duration-200 ease-out select-none ${
          isSidebarCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Sidebar Top Brand & Collapse Toggle */}
        <div className="h-15 px-3.5 flex items-center justify-between border-b border-slate-800/80">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('matrix');
            }}
            className="flex items-center gap-2.5 text-white font-bold whitespace-nowrap overflow-hidden focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.45)]">
              <Radar className="w-4 h-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-[15px] font-extrabold tracking-tight text-white leading-none">
                  PulseMatrix
                </span>
                <span className="text-[10px] font-mono text-indigo-300/80 mt-0.5">
                  REVOPS INTELLIGENCE
                </span>
              </div>
            )}
          </a>

          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Workspace Switcher Dropdown */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-b border-slate-800/80" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setWsDropdownOpen((prev) => !prev)}
                aria-expanded={wsDropdownOpen}
                aria-label="Select Workspace"
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="truncate font-semibold">{selectedWorkspace.name}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {wsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 right-0 mt-1.5 bg-[#111827] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50"
                  >
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
                              ? 'bg-indigo-500/15 text-white font-medium'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="truncate">
                            <div className="text-white font-semibold truncate">
                              {ws.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {ws.segment}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Primary Intelligence Views Navigation */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Analytics & Views
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-transparent border border-indigo-500/40 rounded-xl -z-10"
                  />
                )}
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? item.accent : 'text-slate-500'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.id === 'radar' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] font-semibold text-amber-300 tabular-nums">
                    {changesCount7d}
                  </span>
                )}
              </button>
            );
          })}

          {/* Tracked Competitors Quick-Jump Section with Mini Win-Rate Bars */}
          {!isSidebarCollapsed && (
            <div className="pt-6">
              <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Tracked Rivals ({competitors.length})</span>
                <span className="font-mono">Win Rate</span>
              </div>
              <div className="mt-1 space-y-1">
                {competitors.map((comp, idx) => {
                  const isFocused =
                    activeTab === 'battlecards' && selectedCompetitorId === comp.id;
                  const dotColor = RIVAL_DOT_COLORS[idx % RIVAL_DOT_COLORS.length];
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => onQuickJumpCompetitor(comp.id)}
                      className={`w-full px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isFocused
                          ? 'bg-indigo-500/20 border border-indigo-500/40 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                          <span className="truncate">{comp.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-400 font-semibold tabular-nums">
                          {comp.winRateAgainst}%
                        </span>
                      </div>
                      <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, comp.winRateAgainst)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Bottom Status & Theme Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-[#080B12]">
          {!isSidebarCollapsed && (
            <div className="px-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{selectedWorkspace.lastSyncedLabel}</span>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!isSidebarCollapsed && <span>Light Canvas Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                {!isSidebarCollapsed && <span>Dark Canvas Mode</span>}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Top Workspace Header Bar */}
      <header
        className={`sticky top-0 z-20 h-15 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/90 transition-[padding] duration-200 ${
          isSidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-64'
        }`}
      >
        <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Button + Breadcrumb Trail */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label="Toggle Mobile Navigation"
              className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 font-semibold text-xs truncate">
                {selectedWorkspace.ourProductName}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                /
              </span>
              <span className="text-slate-800 dark:text-slate-100 font-bold truncate">
                {currentViewLabel}
              </span>
            </div>
          </div>

          {/* Center: Global Search Filter Input */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tiers, features, SSO, egress... (⌘K)"
                aria-label="Global Matrix and Battlecard Search"
                className="w-full pl-8.5 pr-12 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/90 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search query"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Right: Theme Switch & Vibrant Primary Scan CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-[0_2px_12px_rgba(79,70,229,0.3)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-100" />
              <span>Add / Scan Competitor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer (<768px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative w-72 max-w-[82vw] bg-[#0B0F19] text-white h-full border-r border-slate-800 p-4 flex flex-col justify-between z-10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Radar className="w-4 h-4 text-white" />
                    </div>
                    <span>PulseMatrix</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close Mobile Menu"
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
                {selectedWorkspace.lastSyncedLabel}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
