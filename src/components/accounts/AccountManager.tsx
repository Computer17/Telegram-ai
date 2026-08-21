import React, { useState } from 'react';
import {
  Users,
  Plus,
  Bot,
  Power,
  Trash2,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { TelegramAccount } from '../../types';

interface AccountManagerProps {
  onOpenConnectModal: () => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ onOpenConnectModal }) => {
  const {
    accounts,
    toggleAutoReply,
    resumeAiTakeover,
    refreshAccounts,
  } = useTelegram();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  return (
    <div id="account-manager-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Telegram Accounts Manager
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400">
                {accounts.length} Connected
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage multi-account MTProto sessions, background listeners, proxies, and AI auto-reply pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshAccounts()}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Refresh Accounts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              id="btn-add-new-account"
              onClick={onOpenConnectModal}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Connect New Account</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {accounts.map((acc) => {
            const isTakeover =
              acc.humanTakeoverPausedUntil &&
              new Date(acc.humanTakeoverPausedUntil).getTime() > Date.now();

            const quotaPercent = Math.min(
              100,
              Math.round((acc.dailyAiRepliesUsed / (acc.dailyAiRepliesMax || 500)) * 100)
            );

            return (
              <div
                key={acc.id}
                id={`account-card-${acc.id}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Account Profile Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={acc.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                          {acc.firstName} {acc.lastName}
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        {acc.username ? `@${acc.username}` : acc.phoneNumberMasked}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {acc.connectionType}
                        </span>
                        {acc.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auto-Reply Switch */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      id={`toggle-autoreply-${acc.id}`}
                      onClick={() => toggleAutoReply(acc.id, !acc.autoReplyEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        acc.autoReplyEnabled ? 'bg-sky-500' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          acc.autoReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {acc.autoReplyEnabled ? 'AI AUTO-REPLY ON' : 'AI PAUSED'}
                    </span>
                  </div>
                </div>

                {/* Human Takeover Alert Banner */}
                {isTakeover && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Human Takeover Mode active (Expires:{' '}
                        {new Date(acc.humanTakeoverPausedUntil!).toLocaleTimeString()})
                      </span>
                    </div>
                    <button
                      onClick={() => resumeAiTakeover(acc.id)}
                      className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 ml-2"
                    >
                      Resume AI Now
                    </button>
                  </div>
                )}

                {/* Quota & AI Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Daily AI Replies Quota</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                      {acc.dailyAiRepliesUsed} / {acc.dailyAiRepliesMax} ({quotaPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      style={{ width: `${quotaPercent}%` }}
                      className={`h-full rounded-full transition-all ${
                        quotaPercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Settings & Proxy Badges */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      {acc.proxyConfig?.enabled ? 'Proxy: SOCKS5' : 'Direct Connection'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AES-256 Vault</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
