import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Star,
  Copy,
  Check,
  Search,
  Folder,
  Trash2,
  Edit,
  Sparkles,
  Send,
} from 'lucide-react';
import { api } from '../../lib/api';
import { PromptTemplate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTelegram } from '../../context/TelegramContext';

export const PromptLibrary: React.FC = () => {
  const { currentUser } = useAuth();
  const { sendMessage, activeChat } = useTelegram();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PromptTemplate>>({
    title: '',
    category: 'Business',
    description: '',
    content: '',
    variables: [],
    isFavorite: false,
    isPublic: true,
  });

  const loadPrompts = async () => {
    try {
      const res = await api.getPrompts(currentUser.id);
      setPrompts(res.prompts || []);
    } catch (e) {
      console.error('Failed to load prompts', e);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, [currentUser.id]);

  const categories = ['All', 'Business', 'Customer Support', 'Bangla Assistant', 'Productivity'];

  const filteredPrompts = prompts.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (prompt: PromptTemplate) => {
    navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseInChat = (prompt: PromptTemplate) => {
    if (!activeChat) {
      alert('Please open a chat in Telegram Client first.');
      return;
    }
    sendMessage(prompt.content);
    alert('Prompt message sent to active chat!');
  };

  const handleToggleFavorite = async (prompt: PromptTemplate) => {
    try {
      const updated = await api.updatePrompt(prompt.id, { isFavorite: !prompt.isFavorite });
      setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? updated.prompt : p)));
    } catch (e) {
      console.error('Toggle favorite failed', e);
    }
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vars = (formData.content?.match(/\{([^}]+)\}/g) || []).map((v) => v.replace(/[{}]/g, ''));
      await api.createPrompt({
        ...(formData as any),
        userId: currentUser.id,
        variables: vars,
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Business',
        description: '',
        content: '',
        variables: [],
        isFavorite: false,
        isPublic: true,
      });
      await loadPrompts();
    } catch (e) {
      console.error('Save prompt failed', e);
    }
  };

  return (
    <div id="prompt-library-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Prompt & Template Library
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400">
                {prompts.length} Presets
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Reusable prompt templates with variable placeholders and instant one-click chat injection.
            </p>
          </div>

          <button
            id="btn-create-prompt"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white pl-9 pr-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                      {prompt.category}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white mt-2">
                      {prompt.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(prompt)}
                    className="p-1 text-neutral-400 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        prompt.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {prompt.description}
                </p>

                <div className="mt-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs text-neutral-800 dark:text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {prompt.content}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex gap-1">
                  {prompt.variables?.map((v, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {`{${v}}`}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(prompt)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleUseInChat(prompt)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Prompt Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create Prompt Template</h2>

              <form onSubmit={handleSavePrompt} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Schedule Consultation Reply"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Business'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Business">Business</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Bangla Assistant">Bangla Assistant</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of when to use this template"
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Prompt Text (Use {'{name}'} or {'{topic}'} for variables)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Hi {name}! Thanks for reaching out regarding {topic}..."
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono resize-none leading-relaxed"
                  />
                </div>

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
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                  >
                    Save Template
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
