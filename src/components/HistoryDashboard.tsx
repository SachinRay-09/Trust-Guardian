import { useState, useEffect } from 'react';
import { History, X, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analysisService, type AnalysisHistory } from '../services/supabase';
import { ThreatGlow } from './SpectralEffects';

interface HistoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDashboard = ({ isOpen, onClose }: HistoryDashboardProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [stats, setStats] = useState({ total: 0, threats: 0, low: 0, medium: 0, high: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isOpen) {
      loadHistory();
      loadStats();
    }
  }, [user, isOpen]);

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await analysisService.getHistory(user.id);
    if (data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user) return;
    
    const { data } = await analysisService.getStats(user.id);
    if (data) {
      setStats(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="text-cyan-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Analysis History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {!user ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400 text-lg">Sign in to view your analysis history</p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin mx-auto w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full" />
            <p className="text-gray-400 mt-4">Loading history...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <TrendingUp className="mx-auto text-cyan-400 mb-2" size={24} />
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">Total Scans</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <AlertTriangle className="mx-auto text-red-400 mb-2" size={24} />
                <div className="text-2xl font-bold text-white">{stats.threats}</div>
                <div className="text-xs text-gray-400">Threats Found</div>
              </div>
              <div className="bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.low}</div>
                <div className="text-xs text-gray-400">Low Risk</div>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.medium}</div>
                <div className="text-xs text-gray-400">Medium Risk</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.high}</div>
                <div className="text-xs text-gray-400">High Risk</div>
              </div>
            </div>

            {/* History List */}
            <div className="p-6 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400">No analysis history yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start analyzing content to see your history here</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <ThreatGlow level={item.overall_threat_level} />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                            {item.content_type}
                          </span>
                          <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.overall_threat_level === 'high' ? 'bg-red-500/20 text-red-400' :
                            item.overall_threat_level === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {item.overall_threat_level.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.analyzed_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {item.content_preview}
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Spam:</span>
                          <span className="ml-1 text-white font-semibold">{item.spam_score}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Deepfake:</span>
                          <span className="ml-1 text-white font-semibold">{item.deepfake_score}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Toxicity:</span>
                          <span className="ml-1 text-white font-semibold">{item.toxicity_score}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Scam:</span>
                          <span className="ml-1 text-white font-semibold">{item.scam_score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
