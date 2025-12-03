import { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Shield, TrendingUp, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { profileService, analysisService } from '../services/supabase';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePage = ({ isOpen, onClose }: ProfilePageProps) => {
  const { user, profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [stats, setStats] = useState({ total: 0, threats: 0, low: 0, medium: 0, high: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(profile?.display_name || '');
      loadStats();
    }
  }, [user, profile, isOpen]);

  const loadStats = async () => {
    if (!user) return;
    const { data } = await analysisService.getStats(user.id);
    if (data) setStats(data);
  };

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, { display_name: displayName.trim() });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border-2 border-purple-900/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b-2 border-purple-900/50 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <User className="text-purple-400" size={40} />
              <div className="absolute inset-0 demon-eyes opacity-30 rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-purple-400 glitch-text" data-text="PROFILE">
                PROFILE
              </h2>
              <p className="text-purple-300 text-sm terminal-text">Your Digital Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            <X className="text-purple-400" size={28} />
          </button>
        </div>

        {!user ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400 text-xl">Sign in to view your profile</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Info */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-900/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <User size={24} />
                Personal Information
              </h3>
              
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!editing}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-3 bg-purple-900/50 hover:bg-purple-900/70 text-purple-400 rounded-lg transition-all flex items-center gap-2"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <Mail className="text-gray-500" size={20} />
                    <span className="text-white">{user.email}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Member Since</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <Calendar className="text-gray-500" size={20} />
                    <span className="text-white">
                      {new Date(profile?.created_at || user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gmail Stats */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-900/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp size={24} />
                Analysis Statistics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{stats.total}</div>
                  <div className="text-xs text-gray-400">Total Scans</div>
                </div>
                <div className="bg-red-900/20 rounded-lg p-4 text-center border border-red-900/50">
                  <div className="text-3xl font-bold text-red-400 mb-1">{stats.threats}</div>
                  <div className="text-xs text-gray-400">Threats Found</div>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 text-center border border-green-900/50">
                  <div className="text-3xl font-bold text-green-400 mb-1">{stats.low}</div>
                  <div className="text-xs text-gray-400">Low Risk</div>
                </div>
                <div className="bg-orange-900/20 rounded-lg p-4 text-center border border-orange-900/50">
                  <div className="text-3xl font-bold text-orange-400 mb-1">{stats.medium}</div>
                  <div className="text-xs text-gray-400">Medium Risk</div>
                </div>
                <div className="bg-red-900/20 rounded-lg p-4 text-center border border-red-900/50">
                  <div className="text-3xl font-bold text-red-400 mb-1">{stats.high}</div>
                  <div className="text-xs text-gray-400">High Risk</div>
                </div>
              </div>

              {stats.total > 0 && (
                <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Threat Detection Rate</span>
                    <span className="text-purple-400 font-bold">
                      {Math.round((stats.threats / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div
                      className="h-3 bg-gradient-to-r from-purple-600 to-red-600 rounded-full transition-all"
                      style={{ width: `${(stats.threats / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-900/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Shield size={24} />
                Account Security
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div>
                    <div className="text-white font-semibold">Two-Factor Authentication</div>
                    <div className="text-gray-400 text-sm">Managed by Google OAuth</div>
                  </div>
                  <div className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div>
                    <div className="text-white font-semibold">Gmail Access</div>
                    <div className="text-gray-400 text-sm">Read and modify permissions</div>
                  </div>
                  <div className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">
                    Connected
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
