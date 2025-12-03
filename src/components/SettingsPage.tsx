import { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { settingsService, type UserSettings } from '../services/supabase';
import { SteeringConfigManager } from '../lib/steeringConfig';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPage = ({ isOpen, onClose }: SettingsPageProps) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    detection_strictness: 7,
    visual_haunting: 8,
    ui_theme: 'haunted',
    notifications_enabled: true,
    active_agents: {
      spam_detector: true,
      deepfake_detector: true,
      toxicity_detector: true,
      scam_detector: true,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadSettings();
    }
  }, [user, isOpen]);

  const loadSettings = async () => {
    if (!user) return;
    
    const { data } = await settingsService.getSettings(user.id);
    if (data) {
      setSettings(data);
      // Sync with local steering config
      SteeringConfigManager.setConfig({
        detection_strictness: data.detection_strictness,
        visual_haunting: data.visual_haunting,
        ui_theme: data.ui_theme,
        active_agents: data.active_agents,
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings(user.id, settings);
      
      // Update local steering config
      SteeringConfigManager.setConfig({
        detection_strictness: settings.detection_strictness!,
        visual_haunting: settings.visual_haunting!,
        ui_theme: settings.ui_theme!,
        active_agents: settings.active_agents!,
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-cyan-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Detection Strictness */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Detection Strictness: {settings.detection_strictness}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.detection_strictness}
              onChange={(e) => setSettings({ ...settings, detection_strictness: parseInt(e.target.value) })}
              className="w-full haunt-slider"
            />
            <p className="text-sm text-gray-400 mt-1">
              Higher values = more sensitive detection (more false positives)
            </p>
          </div>

          {/* Visual Haunting */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Visual Haunting Level: {settings.visual_haunting}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.visual_haunting}
              onChange={(e) => setSettings({ ...settings, visual_haunting: parseInt(e.target.value) })}
              className="w-full haunt-slider"
            />
            <p className="text-sm text-gray-400 mt-1">
              Controls ghost sprites, glitch effects, and particle intensity
            </p>
          </div>

          {/* UI Theme */}
          <div>
            <label className="block text-white font-semibold mb-2">UI Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {(['day', 'night', 'haunted'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSettings({ ...settings, ui_theme: theme })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                    settings.ui_theme === theme
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Active Agents */}
          <div>
            <label className="block text-white font-semibold mb-3">Active Detection Agents</label>
            <div className="space-y-2">
              {Object.entries(settings.active_agents || {}).map(([agent, enabled]) => (
                <label key={agent} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      active_agents: {
                        ...settings.active_agents!,
                        [agent]: e.target.checked,
                      },
                    })}
                    className="w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300 capitalize">
                    {agent.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-white font-semibold">Enable Notifications</span>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !user}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>

          {!user && (
            <p className="text-center text-yellow-400 text-sm">
              Sign in to save your settings across devices
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
