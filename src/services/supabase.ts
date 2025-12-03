import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  total_scans: number;
  threats_detected: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisHistory {
  id: string;
  user_id: string;
  content_type: 'email' | 'comment' | 'review' | 'text' | 'ocr_image';
  content_preview: string;
  spam_score: number;
  deepfake_score: number;
  toxicity_score: number;
  scam_score: number;
  overall_threat_level: 'low' | 'medium' | 'high';
  is_threat: boolean;
  analyzed_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_scans: number;
  threats_detected: number;
  accuracy_score: number;
  last_scan_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'threat_detected' | 'milestone' | 'system';
  is_read: boolean;
  analysis_id?: string;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  detection_strictness: number;
  visual_haunting: number;
  ui_theme: 'day' | 'night' | 'haunted';
  notifications_enabled: boolean;
  active_agents: {
    spam_detector: boolean;
    deepfake_detector: boolean;
    toxicity_detector: boolean;
    scam_detector: boolean;
  };
  updated_at: string;
}

// Auth functions
export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

// Profile functions
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },
};

// Analysis functions
export const analysisService = {
  async saveAnalysis(analysis: Omit<AnalysisHistory, 'id' | 'analyzed_at'>) {
    const { data, error } = await supabase
      .from('analysis_history')
      .insert(analysis)
      .select()
      .single();
    return { data, error };
  },

  async getHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getStats(userId: string) {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('overall_threat_level, is_threat')
      .eq('user_id', userId);
    
    if (error) return { data: null, error };

    const stats = {
      total: data.length,
      threats: data.filter(a => a.is_threat).length,
      low: data.filter(a => a.overall_threat_level === 'low').length,
      medium: data.filter(a => a.overall_threat_level === 'medium').length,
      high: data.filter(a => a.overall_threat_level === 'high').length,
    };

    return { data: stats, error: null };
  },
};

// Leaderboard functions
export const leaderboardService = {
  async getTopUsers(limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('threats_detected', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getUserRank(userId: string) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('user_id, threats_detected')
      .order('threats_detected', { ascending: false });
    
    if (error || !data) return { rank: null, error };

    const rank = data.findIndex(entry => entry.user_id === userId) + 1;
    return { rank: rank || null, error: null };
  },
};

// Notification functions
export const notificationService = {
  async getNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return { error };
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    return { data, error };
  },

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  },
};

// Settings functions
export const settingsService = {
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateSettings(userId: string, settings: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },
};
