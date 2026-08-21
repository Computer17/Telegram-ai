import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TelegramProvider } from './context/TelegramContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ChatList } from './components/telegram/ChatList';
import { ChatWindow } from './components/telegram/ChatWindow';
import { ConnectAccountModal } from './components/telegram/ConnectAccountModal';
import { AccountManager } from './components/accounts/AccountManager';
import { AgentBuilder } from './components/ai/AgentBuilder';
import { AutomationBuilder } from './components/automation/AutomationBuilder';
import { PromptLibrary } from './components/ai/PromptLibrary';
import { ProviderSettings } from './components/ai/ProviderSettings';
import { AIMemoryManager } from './components/ai/AIMemoryManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { LiveEventSimulator } from './components/simulator/LiveEventSimulator';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SettingsPage } from './components/settings/SettingsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('telegram');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenSimulator={() => setActiveTab('simulator')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Desktop Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />

        {/* Tab Content Display Area */}
        <main className="flex-1 flex overflow-hidden relative pb-16 md:pb-0">
          {activeTab === 'telegram' && (
            <div className="flex-1 flex h-full overflow-hidden w-full">
              <ChatList />
              <ChatWindow />
            </div>
          )}

          {activeTab === 'accounts' && (
            <AccountManager onOpenConnectModal={() => setIsConnectModalOpen(true)} />
          )}

          {activeTab === 'agents' && <AgentBuilder />}

          {activeTab === 'automations' && <AutomationBuilder />}

          {activeTab === 'prompts' && <PromptLibrary />}

          {activeTab === 'providers' && <ProviderSettings />}

          {activeTab === 'memory' && <AIMemoryManager />}

          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {activeTab === 'simulator' && <LiveEventSimulator />}

          {activeTab === 'admin' && <AdminDashboard />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TelegramProvider>
          <AppContent />
        </TelegramProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
