import { ExternalLink, Shield } from 'lucide-react';

export const DeepGuardLink = () => {
  return (
    <a
      href="https://deep-gaurd.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative">
        {/* Glowing background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-purple-900 rounded-xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
        
        {/* Main button */}
        <div className="relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-950 via-black to-purple-950 border-2 border-red-900 rounded-xl shadow-2xl group-hover:scale-105 transition-all nightmare-pulse">
          <Shield className="text-red-500 group-hover:text-red-400 transition-colors" size={24} />
          <div className="text-left">
            <div className="text-red-500 font-bold text-sm group-hover:text-red-400 transition-colors glitch-text" data-text="DEEPGUARD">
              DEEPGUARD
            </div>
            <div className="text-red-300 text-xs terminal-text">Advanced Protection</div>
          </div>
          <ExternalLink className="text-red-400 group-hover:text-red-300 transition-colors" size={16} />
        </div>

        {/* Dripping effect */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-red-900 to-transparent opacity-70" />
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-900 rounded-full opacity-50 animate-pulse" />
      </div>
    </a>
  );
};
