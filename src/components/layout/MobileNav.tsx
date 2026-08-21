import React from 'react';
import { MessageSquare, Users, Bot, Workflow, Sparkles, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  const tabs = [
    { id: 'telegram', label: 'Chats', icon: MessageSquare },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'automations', label: 'Rules', icon: Workflow },
    { id: 'simulator', label: 'Test', icon: Sparkles },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <nav
      id="app-mobile-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 z-40"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
