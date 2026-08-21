import { FeatureFlags, SystemSetting, UserProfile } from '../../src/types';

let systemSettingStore: SystemSetting = {
  id: 'sys-config',
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxAccountsPerUser: 10,
  maxDailyAiRepliesPerUser: 1000,
  enabledProviders: {
    gemini: true,
    openai: true,
    deepseek: true,
  },
  geminiDefaultModel: 'gemini-3.7-flash',
  workerHeartbeatMinutes: 1,
  updatedAt: new Date().toISOString(),
};

let featureFlagsStore: FeatureFlags = {
  enableAiFeatures: true,
  enableAutoReply: true,
  enableMultiAccount: true,
  enableAutomations: true,
  enableVoicePlayer: true,
  enableProxyRouting: true,
  enableSimulatedHarness: true,
};

let registeredUsers: UserProfile[] = [
  {
    id: 'demo-user-1',
    email: 'kshakilrana2030@gmail.com',
    displayName: 'Shakil Rana (Superadmin)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'superadmin',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-002',
    email: 'sarah.jenkins@techcorp.io',
    displayName: 'Sarah Jenkins',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-003',
    email: 'tariqul.bd@ai-platform.net',
    displayName: 'Tariqul Islam',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class AdminService {
  static getSettings(): SystemSetting {
    return systemSettingStore;
  }

  static updateSettings(updates: Partial<SystemSetting>): SystemSetting {
    systemSettingStore = {
      ...systemSettingStore,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return systemSettingStore;
  }

  static getFeatureFlags(): FeatureFlags {
    return featureFlagsStore;
  }

  static updateFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    featureFlagsStore = {
      ...featureFlagsStore,
      ...flags,
    };
    return featureFlagsStore;
  }

  static getUsers(): UserProfile[] {
    return registeredUsers;
  }

  static updateUserRole(userId: string, role: 'user' | 'admin' | 'superadmin'): UserProfile | null {
    const user = registeredUsers.find((u) => u.id === userId);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  static toggleUserStatus(userId: string, status: 'active' | 'disabled' | 'suspended'): UserProfile | null {
    const user = registeredUsers.find((u) => u.id === userId);
    if (!user) return null;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    return user;
  }
}
