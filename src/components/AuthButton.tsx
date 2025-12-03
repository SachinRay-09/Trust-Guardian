import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthButton = () => {
  const { user, profile, signInWithGoogle, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <User size={20} className="text-cyan-400" />
          )}
          <span className="text-sm text-gray-300">{profile?.display_name || user.email}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/50 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
    >
      <LogIn size={20} />
      <span>Sign in with Google</span>
    </button>
  );
};
