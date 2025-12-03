import { useState, useEffect } from 'react';
import { Trophy, Ghost, Skull, Shield } from 'lucide-react';
import { leaderboardService, type LeaderboardEntry } from '../services/supabase';

const getBadge = (threatsDetected: number) => {
  if (threatsDetected >= 1000) return { name: 'Phantom Lord', icon: '👻' };
  if (threatsDetected >= 500) return { name: 'Specter Master', icon: '💀' };
  if (threatsDetected >= 250) return { name: 'Wraith Hunter', icon: '🎃' };
  if (threatsDetected >= 100) return { name: 'Ghost Buster', icon: '⚡' };
  if (threatsDetected >= 50) return { name: 'Spirit Seeker', icon: '✨' };
  return { name: 'Novice Spirit', icon: '🌟' };
};

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await leaderboardService.getTopUsers(10);
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Top Exorcists</h2>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Ghost className="text-gray-600 mx-auto mb-4" size={64} />
          <p className="text-gray-400">No exorcists yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const isTopThree = index < 3;
            const rankColors = [
              'from-yellow-400 to-yellow-600',
              'from-gray-300 to-gray-400',
              'from-orange-400 to-orange-600',
            ];
            const badge = getBadge(user.threats_detected);

            return (
              <div
                key={user.id}
                className={`
                  relative overflow-hidden rounded-xl p-4 transition-all duration-300
                  ${isTopThree
                    ? 'bg-gradient-to-r ' + rankColors[index] + ' text-gray-900 shadow-lg scale-105'
                    : 'bg-gray-700/50 text-white hover:bg-gray-700/70'
                  }
                  border ${isTopThree ? 'border-white/30' : 'border-gray-600/50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg
                      ${isTopThree ? 'bg-white/20' : 'bg-gray-600/50'}
                    `}
                  >
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <Shield size={16} className={isTopThree ? 'text-gray-900' : 'text-cyan-400'} />
                      )}
                      <h3 className="font-bold text-sm truncate">{user.display_name}</h3>
                      <span className="text-lg">{badge.icon}</span>
                    </div>
                    <p className={`text-xs ${isTopThree ? 'opacity-75' : 'text-gray-400'}`}>
                      {badge.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Skull size={18} className={isTopThree ? 'text-gray-900' : 'text-purple-400'} />
                      <span className="font-bold text-xl">{user.threats_detected}</span>
                    </div>
                    <p className={`text-xs ${isTopThree ? 'opacity-75' : 'text-gray-500'}`}>
                      threats
                    </p>
                  </div>
                </div>

                {isTopThree && (
                  <div className="absolute top-0 right-0 opacity-10">
                    <Ghost size={100} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
