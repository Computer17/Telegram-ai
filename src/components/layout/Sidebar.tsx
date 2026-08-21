import React from 'react';
import {
  MessageSquare,
  Users,
  Bot,
  Cpu,
  Workflow,
  BookOpen,
  Brain,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Settings,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConnectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'telegram', label: 'Telegram Client', icon: MessageSquare, badge: 'Live' },
    { id: 'accounts', label: 'Accounts Manager', icon: Users },
    { id: 'agents', label: 'AI Agent Builder', icon: Bot, highlight: true },
    { id: 'automations', label: 'Automations', icon: Workflow },
    { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
    { id: 'providers', label: 'AI Providers', icon: Cpu },
    { id: 'memory', label: 'AI Memory', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'simulator', label: 'Live Simulator', icon: Sparkles, color: 'text-violet-500' },
  ];

  const bottomItems = [
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert, adminOnly: true }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between shrink-0 hidden md:flex transition-colors"
    >
      {/* Top Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Core Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shadow-sm border border-sky-200/50 dark:border-sky-800/40'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-sky-600 dark:text-sky-400' : item.color || 'text-neutral-400 dark:text-neutral-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Worker Health & System Quick Info */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/40">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Telegram Worker
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">ACTIVE</span>
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
            Daemon: Multi-thread MTProto / Bot listener with queue idempotency.
          </p>
        </div>

        {/* Bottom Menu Items */}
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shadow-sm border border-sky-200/50 dark:border-sky-800/40'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
