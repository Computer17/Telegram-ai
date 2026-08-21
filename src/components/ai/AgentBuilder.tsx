import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Sparkles,
  Sliders,
  Languages,
  Trash2,
  Edit,
  Check,
  Send,
  Loader2,
  Settings,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AiAgent } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AgentBuilder: React.FC = () => {
  const { currentUser } = useAuth();
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Playground state
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AiAgent>>({
    name: '',
    description: '',
    systemInstruction: '',
    personality: '',
    languageMode: 'multilingual',
    responseStyle: 'friendly',
    maxResponseTokens: 500,
    temperature: 0.7,
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    replyDelaySeconds: 1,
    simulateTyping: true,
  });

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAgents(currentUser.id);
      setAgents(res.agents || []);
      if (res.agents?.length > 0 && !selectedAgent) {
        setSelectedAgent(res.agents[0]);
        setFormData(res.agents[0]);
      }
    } catch (e) {
      console.error('Failed to load agents', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [currentUser.id]);

  const handleSelectAgent = (agent: AiAgent) => {
    setSelectedAgent(agent);
    setFormData(agent);
    setIsEditing(false);
    setTestResponse('');
  };

  const handleCreateNew = () => {
    const fresh: Partial<AiAgent> = {
      name: 'New Custom AI Agent',
      description: 'Specialized assistant for personalized Telegram chats.',
      systemInstruction: 'You are an authentic, smart virtual assistant. Help the user clearly and politely.',
      personality: 'Friendly, helpful, and concise.',
      languageMode: 'multilingual',
      responseStyle: 'friendly',
      maxResponseTokens: 400,
      temperature: 0.7,
      provider: 'gemini',
      model: 'gemini-3.7-flash',
      replyDelaySeconds: 1,
      simulateTyping: true,
    };
    setSelectedAgent(null);
    setFormData(fresh);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (selectedAgent && !isEditing) {
        const res = await api.updateAgent(selectedAgent.id, formData);
        setSelectedAgent(res.agent);
      } else {
        const res = await api.createAgent({
          ...(formData as any),
          userId: currentUser.id,
          avatar:
            formData.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          memoryMode: 'conversation',
          isDefault: agents.length === 0,
        });
        setSelectedAgent(res.agent);
        setIsEditing(false);
      }
      await loadAgents();
    } catch (e) {
      console.error('Save agent failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this AI Agent?')) return;
    try {
      await api.deleteAgent(agentId);
      await loadAgents();
      setSelectedAgent(null);
    } catch (e) {
      console.error('Delete agent failed', e);
    }
  };

  const handleTestRun = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse('');
    try {
      const res = await api.generateAI({
        provider: formData.provider || 'gemini',
        model: formData.model || 'gemini-3.7-flash',
        prompt: testPrompt,
        systemInstruction: formData.systemInstruction,
        temperature: formData.temperature,
        maxTokens: formData.maxResponseTokens,
      });
      setTestResponse(res.text);
    } catch (err: any) {
      setTestResponse('Error testing agent: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="agent-builder-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                AI Agent Builder
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-400">
                Persona Studio
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Craft multi-lingual personas (Bangla & English), system instructions, tone presets, and Gemini model settings.
            </p>
          </div>

          <button
            id="btn-create-agent"
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/20 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Agent</span>
          </button>
        </div>

        {/* Main Grid: Left Agent List, Right Editor + Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Agent Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">Your Agents</div>
            <div className="space-y-2.5">
              {agents.map((agent) => {
                const isSelected = selectedAgent?.id === agent.id;
                return (
                  <div
                    key={agent.id}
                    id={`agent-item-${agent.id}`}
                    onClick={() => handleSelectAgent(agent)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-900 border-violet-500 shadow-md ring-1 ring-violet-500/20'
                        : 'bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={agent.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                            {agent.name}
                            {agent.isDefault && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                                Default
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="capitalize font-medium text-violet-600 dark:text-violet-400">
                        {agent.languageMode} • {agent.model}
                      </span>
                      <span>Temp: {agent.temperature}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Configuration Editor */}
          <div className="lg:col-span-8 space-y-6">
            <form
              onSubmit={handleSave}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-violet-600" />
                    <span>{selectedAgent ? `Configure ${selectedAgent.name}` : 'New Agent Persona'}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Customize system instructions, knowledge tone, and Gemini inference hyperparameters.
                  </p>
                </div>

                {selectedAgent && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedAgent.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                    title="Delete Agent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Executive Assistant"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Primary Language Preset
                  </label>
                  <select
                    value={formData.languageMode || 'multilingual'}
                    onChange={(e) => setFormData({ ...formData, languageMode: e.target.value as any })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="multilingual">Multilingual (Adaptive auto-detect)</option>
                    <option value="bangla">Bangla Dedicated (বাংলা সহকারী)</option>
                    <option value="english">English Professional</option>
                    <option value="auto">Auto Language Match</option>
                  </select>
                </div>
              </div>

              {/* System Instruction */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  System Instruction (Prompt)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.systemInstruction || ''}
                  onChange={(e) => setFormData({ ...formData, systemInstruction: e.target.value })}
                  placeholder="You are an authentic, smart personal assistant..."
                  className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Personality & Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Personality Description
                  </label>
                  <input
                    type="text"
                    value={formData.personality || ''}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    placeholder="Warm, polite, structured problem solver"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    AI Model (Server-side)
                  </label>
                  <select
                    value={formData.model || 'gemini-3.7-flash'}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash (Recommended & Ultra Fast)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="deepseek-v3">DeepSeek V3</option>
                  </select>
                </div>
              </div>

              {/* Hyperparameters: Temperature & Max Tokens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Creativity (Temperature)</span>
                    <span className="font-mono">{formData.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.temperature ?? 0.7}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Max Output Tokens</span>
                    <span className="font-mono">{formData.maxResponseTokens} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={formData.maxResponseTokens ?? 500}
                    onChange={(e) => setFormData({ ...formData, maxResponseTokens: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Agent Settings</span>
                </button>
              </div>
            </form>

            {/* Interactive Agent Testing Sandbox */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Test Agent Live Sandbox</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTestRun()}
                  placeholder="Type a test Telegram message in Bangla or English (e.g. ভাই কেমন আছেন?)..."
                  className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  type="button"
                  disabled={isTesting || !testPrompt.trim()}
                  onClick={handleTestRun}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Test</span>
                </button>
              </div>

              {testResponse && (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Agent Output:
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {testResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
