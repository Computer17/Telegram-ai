import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Power,
  Trash2,
  Edit,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Bot,
  Activity,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AutomationLog, AutomationRule } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AutomationBuilder: React.FC = () => {
  const { currentUser } = useAuth();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'logs'>('rules');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new/edit rule
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    enabled: true,
    triggerType: 'keyword_match',
    triggerKeywords: [],
    chatTypeFilter: 'all',
    allowlist: [],
    blocklist: [],
    actionType: 'ai_reply',
    agentId: 'agent-001',
    cooldownSeconds: 30,
    maxRunsPerUser: 10,
  });

  const [keywordsInput, setKeywordsInput] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        api.getAutomations(currentUser.id),
        api.getAutomationLogs(currentUser.id),
      ]);
      setAutomations(rulesRes.automations || []);
      setLogs(logsRes.logs || []);
    } catch (e) {
      console.error('Failed to load automation data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const updated = await api.updateAutomation(rule.id, { enabled: !rule.enabled });
      setAutomations((prev) => prev.map((r) => (r.id === rule.id ? updated.automation : r)));
    } catch (e) {
      console.error('Toggle rule failed', e);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.deleteAutomation(ruleId);
      setAutomations((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (e) {
      console.error('Delete rule failed', e);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const kwArray = keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await api.createAutomation({
        ...(formData as any),
        userId: currentUser.id,
        triggerKeywords: kwArray,
      });

      setAutomations((prev) => [...prev, res.automation]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        enabled: true,
        triggerType: 'keyword_match',
        triggerKeywords: [],
        chatTypeFilter: 'all',
        allowlist: [],
        blocklist: [],
        actionType: 'ai_reply',
        agentId: 'agent-001',
        cooldownSeconds: 30,
        maxRunsPerUser: 10,
      });
      setKeywordsInput('');
    } catch (e) {
      console.error('Save rule failed', e);
    }
  };

  return (
    <div id="automations-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Automation & Trigger Engine
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                Rule Orchestrator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Configure intelligent keyword matching, first-message welcomes, rate-limit filters, and execution audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Sub-tabs: Rules vs Logs */}
            <div className="flex bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveSubTab('rules')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'rules'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Rules ({automations.length})
              </button>
              <button
                onClick={() => setActiveSubTab('logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'logs'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Execution Logs ({logs.length})
              </button>
            </div>

            {activeSubTab === 'rules' && (
              <button
                id="btn-create-rule"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Rule</span>
              </button>
            )}
          </div>
        </div>

        {/* Content based on sub-tab */}
        {activeSubTab === 'rules' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {automations.map((rule) => (
              <div
                key={rule.id}
                id={`rule-card-${rule.id}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{rule.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                        Trigger: {rule.triggerType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        rule.enabled ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Keywords Chips */}
                {rule.triggerKeywords && rule.triggerKeywords.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {rule.triggerKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300"
                        >
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta details */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-sky-500" />
                    <span>Agent: Personal Assistant</span>
                  </span>
                  <span className="font-mono text-[11px]">Executed: {rule.runCount} times</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Execution Logs Table */
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Recent Automation Invocations
              </h3>
              <button onClick={loadData} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Sender</th>
                    <th className="p-3.5">Incoming Message</th>
                    <th className="p-3.5">AI Response</th>
                    <th className="p-3.5">Model / Tokens</th>
                    <th className="p-3.5">Latency</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                              : log.status === 'skipped_takeover'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                              : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {log.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-neutral-900 dark:text-white whitespace-nowrap">
                        {log.senderName}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-neutral-600 dark:text-neutral-300">
                        {log.incomingMessage}
                      </td>
                      <td className="p-3.5 max-w-sm truncate text-neutral-800 dark:text-neutral-200">
                        {log.aiResponse || (
                          <span className="text-neutral-400 italic">{log.errorMessage || 'Skipped'}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {log.model || 'Gemini'} ({log.tokensUsed || 0} tokens)
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {log.durationMs}ms
                      </td>
                      <td className="p-3.5 text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Automation Rule</h2>

              <form onSubmit={handleSaveRule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Price & Roadmap Query Trigger"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Trigger Type
                  </label>
                  <select
                    value={formData.triggerType || 'keyword_match'}
                    onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as any })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="keyword_match">Keyword Match</option>
                    <option value="first_message">First Message From Contact</option>
                    <option value="new_message">Every New Message</option>
                  </select>
                </div>

                {formData.triggerType === 'keyword_match' && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Trigger Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="price, cost, demo, schedule, ফি, কোর্স"
                      className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
                  >
                    Create Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
