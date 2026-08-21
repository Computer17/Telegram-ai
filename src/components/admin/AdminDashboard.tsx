import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Power,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FeatureFlags, SystemSetting, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'flags' | 'users'>('settings');
  const [settings, setSettings] = useState<SystemSetting | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sRes, fRes, uRes] = await Promise.all([
        api.getAdminSettings(),
        api.getFeatureFlags(),
        api.getAdminUsers(),
      ]);
      setSettings(sRes.settings);
      setFlags(fRes.featureFlags);
      setUsers(uRes.users || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSettings = async (updates: Partial<SystemSetting>) => {
    if (!settings) return;
    try {
      const res = await api.updateAdminSettings(updates);
      setSettings(res.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Update settings failed', e);
    }
  };

  const handleToggleFlag = async (key: keyof FeatureFlags) => {
    if (!flags) return;
    try {
      const res = await api.updateFeatureFlags({ [key]: !flags[key] });
      setFlags(res.featureFlags);
    } catch (e) {
      console.error('Toggle flag failed', e);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await api.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
    } catch (e) {
      console.error('Change role failed', e);
    }
  };

  const handleToggleStatus = async (userId: string, status: string) => {
    try {
      const res = await api.updateUserStatus(userId, status);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
    } catch (e) {
      console.error('Toggle status failed', e);
    }
  };

  return (
    <div id="admin-dashboard-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-purple-600" /> Admin Command Center
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400">
                Superadmin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Global system parameters, feature flag toggles, role assignments, and worker runtime telemetry.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              System Settings
            </button>
            <button
              onClick={() => setActiveTab('flags')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'flags'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Feature Flags
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Users ({users.length})
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Admin configuration successfully saved!</span>
          </div>
        )}

        {/* Tab 1: System Settings */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Platform Governance</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-neutral-900 dark:text-white">Maintenance Mode</div>
                    <p className="text-[11px] text-neutral-500">Temporarily restrict client access</p>
                  </div>
                  <button
                    onClick={() => handleUpdateSettings({ maintenanceMode: !settings.maintenanceMode })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      settings.maintenanceMode ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                        settings.maintenanceMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-neutral-900 dark:text-white">New Registrations</div>
                    <p className="text-[11px] text-neutral-500">Allow new users to create accounts</p>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdateSettings({ allowNewRegistrations: !settings.allowNewRegistrations })
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      settings.allowNewRegistrations ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                        settings.allowNewRegistrations ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Max Accounts Allowed Per User
                  </label>
                  <input
                    type="number"
                    value={settings.maxAccountsPerUser}
                    onChange={(e) =>
                      handleUpdateSettings({ maxAccountsPerUser: parseInt(e.target.value) || 10 })
                    }
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Default Gemini Model
                  </label>
                  <select
                    value={settings.geminiDefaultModel}
                    onChange={(e) => handleUpdateSettings({ geminiDefaultModel: e.target.value })}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700"
                  >
                    <option value="gemini-3.7-flash">gemini-3.7-flash (Default)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Flags */}
        {activeTab === 'flags' && flags && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Feature Flag Matrix</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(flags).map(([key, val]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-neutral-900 dark:text-white capitalize">
                      {key.replace('enable', '').replace(/([A-Z])/g, ' $1')}
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">{key}</span>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(key as keyof FeatureFlags)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      val ? 'bg-purple-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                        val ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Registered Users</h3>
              <span className="text-xs text-neutral-500 font-mono">{users.length} accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">{u.displayName}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{u.email}</div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="bg-neutral-100 dark:bg-neutral-800 text-xs px-2.5 py-1 rounded-lg border border-transparent dark:border-neutral-700 font-semibold uppercase text-[10px]"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                          className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
