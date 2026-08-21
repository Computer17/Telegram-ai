import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Bell,
  Clock,
  Download,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [takeoverDuration, setTakeoverDuration] = useState('15');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [exported, setExported] = useState(false);

  const handleExportConfig = () => {
    const config = {
      appName: 'AI Telegram Platform',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      security: 'AES-256-GCM',
      providers: ['gemini', 'openai', 'deepseek'],
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-telegram-config.json';
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div id="settings-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Platform & Client Preferences
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              v1.0.0 Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Tailor client layout, sound cues, Human Takeover pauses, and export telemetry configuration.
          </p>
        </div>

        {/* Appearance & Theme */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Appearance & Theme</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Dark Mode</span>
              </div>
              {theme === 'dark' && <span className="w-2 h-2 rounded-full bg-sky-500" />}
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Light Mode</span>
              </div>
              {theme === 'light' && <span className="w-2 h-2 rounded-full bg-sky-500" />}
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                theme === 'system'
                  ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">System Auto</span>
              </div>
              {theme === 'system' && <span className="w-2 h-2 rounded-full bg-sky-500" />}
            </button>
          </div>
        </div>

        {/* Human Takeover Engine Configuration */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Human Takeover Auto-Pause Engine</span>
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            When you manually send a message inside any chat thread from this interface, the platform immediately suspends AI auto-replies for that conversation to prevent talking over you.
          </p>

          <div className="pt-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Default Auto-Pause Duration
            </label>
            <select
              value={takeoverDuration}
              onChange={(e) => setTakeoverDuration(e.target.value)}
              className="w-full sm:w-72 bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes (Recommended)</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>

        {/* Export & Data Backup */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-500" />
              <span>Backup Workspace Config</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Export your configured agents, automation rules, and prompt templates to a portable JSON backup.
            </p>
          </div>

          <button
            onClick={handleExportConfig}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            {exported ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{exported ? 'Exported!' : 'Export JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
