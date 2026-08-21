import React, { useState } from 'react';
import {
  Bot,
  Sun,
  Moon,
  Shield,
  User,
  Zap,
  ChevronDown,
  Sparkles,
  Wifi,
  Power,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTelegram } from '../../context/TelegramContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenConnectModal: () => void;
  onOpenSimulator: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConnectModal,
  onOpenSimulator,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, role, switchUserRole } = useAuth();
  const { accounts, activeAccount, setActiveAccountId, resumeAiTakeover } = useTelegram();
  const { theme, setTheme, isDark } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const isTakeoverActive =
    activeAccount?.humanTakeoverPausedUntil &&
    new Date(activeAccount.humanTakeoverPausedUntil).getTime() > Date.now();

  return (
    <header id="app-navbar" className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('telegram')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-neutral-900 dark:text-white tracking-tight">AI Telegram</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini & Multi-Worker Cloud
            </p>
          </div>
        </div>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Telegram Account Switcher */}
        <div className="relative">
          <button
            id="btn-account-switcher"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm transition-all"
          >
            {activeAccount?.photoUrl ? (
              <img
                src={activeAccount.photoUrl}
                alt={activeAccount.firstName}
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Bot className="w-4 h-4 text-sky-500" />
            )}
            <span className="font-medium text-neutral-800 dark:text-neutral-200 max-w-[120px] truncate hidden sm:inline">
              {activeAccount?.username ? `@${activeAccount.username}` : activeAccount?.firstName || 'No Account'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                activeAccount?.status === 'connected' ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'
              }`}
            />
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Telegram Accounts</span>
                <span className="text-[11px] text-neutral-400">{accounts.length} connected</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setActiveAccountId(acc.id);
                      setShowAccountMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors ${
                      acc.id === activeAccount?.id ? 'bg-sky-50/70 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' : ''
                    }`}
                  >
                    <img
                      src={acc.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate text-neutral-900 dark:text-white">
                        {acc.firstName} {acc.lastName}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {acc.username ? `@${acc.username}` : acc.phoneNumberMasked}
                      </div>
                    </div>
                    {acc.autoReplyEnabled && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                        AI ON
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800 px-2">
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    onOpenConnectModal();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Connect Another Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Human Takeover Alert Pill (if active) */}
        {isTakeoverActive && activeAccount && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium animate-pulse">
            <span>Human Takeover Active</span>
            <button
              onClick={() => resumeAiTakeover(activeAccount.id)}
              className="text-[11px] underline hover:text-amber-700 dark:hover:text-amber-300 font-bold ml-1"
            >
              Resume AI
            </button>
          </div>
        )}

        {/* Event Simulator Test Button */}
        <button
          id="btn-open-simulator"
          onClick={onOpenSimulator}
          title="Open Live Telegram Event & Auto-Reply Simulator"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Test Auto-Reply</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Role & Profile Switcher */}
        <div className="relative">
          <button
            id="btn-user-role-menu"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <img
              src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.displayName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-500/30"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hidden xl:inline">
              {currentUser.displayName}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="font-semibold text-xs text-neutral-900 dark:text-white">{currentUser.displayName}</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{currentUser.email}</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Role: {role}
                  </span>
                </div>
              </div>

              <div className="px-3 py-2">
                <div className="text-[11px] font-medium text-neutral-400 mb-1">Switch Test Persona:</div>
                <div className="space-y-1">
                  {(['superadmin', 'admin', 'user'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchUserRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        role === r
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="capitalize">{r} Mode</span>
                      {role === r && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
