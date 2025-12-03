import { useState } from 'react';
import { Skull, Mail, Ghost, Settings, History, Eye, Gamepad2, Shield, Image } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthButton } from './components/AuthButton';
import { NotificationCenter } from './components/NotificationCenter';
import { HauntLevelSlider } from './components/HauntLevelSlider';
import { MessageFeed } from './components/MessageFeed';
import { Leaderboard } from './components/Leaderboard';
import { AnalyzerWidget } from './components/AnalyzerWidget';
import { SettingsPage } from './components/SettingsPage';
import { HistoryDashboard } from './components/HistoryDashboard';
import { SpectralEffects } from './components/SpectralEffects';
import { GmailScanner } from './components/GmailScanner';
import { JumpScare } from './components/JumpScare';
import { ScaryGame } from './components/ScaryGame';
import { DeepGuardLink } from './components/DeepGuardLink';
import { PeekingGhost } from './components/PeekingGhost';
import { ProfilePage } from './components/ProfilePage';
import { OCRScanner } from './components/OCRScanner';
import TrustGuardianDashboard from './components/TrustGuardianDashboard';
import { SpookyAudioControl } from './components/SpookyAudioControl';
import { ThreeDBackground } from './components/ThreeDBackground';
import { CursorTrail } from './components/CursorTrail';
import { AdvancedParticles } from './components/AdvancedParticles';
import { useThreatStore } from './store/threatStore';

function AppContent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [gmailScannerOpen, setGmailScannerOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ocrScannerOpen, setOcrScannerOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const handleAnalyzed = () => {
    setFeedKey(prev => prev + 1);
  };

  // Zustand store for threat management
  const { threatLevel, showGhost, particleTrigger, particlePosition } = useThreatStore();

  // Show alternate dashboard if enabled
  if (dashboardOpen) {
    return (
      <>
        <TrustGuardianDashboard />
        <button
          onClick={() => setDashboardOpen(false)}
          className="fixed top-4 right-4 z-[200] px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
        >
          ← Back to Main
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen relative horror-bg">
          {/* 3D Background with Ghost */}
          {theme === 'haunted' && (
            <ThreeDBackground threatLevel={threatLevel} showGhost={showGhost} />
          )}

          {/* Cursor Trail Effect */}
          {theme === 'haunted' && <CursorTrail />}

          {/* Advanced Particle System */}
          <AdvancedParticles
            trigger={particleTrigger}
            x={particlePosition.x}
            y={particlePosition.y}
            color={threatLevel === 'high' ? '#ff1744' : '#8a2be2'}
            count={40}
          />
          <div className="vapor-trail" />
          <SpectralEffects />

          {/* Demon Eyes Background */}
          <div className="fixed top-10 left-10 w-20 h-20 demon-eyes rounded-full opacity-30 pointer-events-none" />
          <div className="fixed top-20 right-20 w-16 h-16 demon-eyes rounded-full opacity-25 pointer-events-none" />
          <div className="fixed bottom-20 left-1/4 w-24 h-24 demon-eyes rounded-full opacity-20 pointer-events-none" />

          <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
            <header className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative theme-icon">
                    {theme === 'day' && <Shield className="text-purple-500" size={56} />}
                    {theme === 'night' && <Shield className="text-blue-400" size={56} />}
                    {theme === 'haunted' && (
                      <>
                        <Skull className="text-red-500 creepy-shake" size={56} />
                        <Ghost className="absolute -top-2 -right-2 text-purple-400 ghost-sprite" size={28} />
                        <div className="absolute inset-0 demon-eyes opacity-40 rounded-full" />
                      </>
                    )}
                  </div>
                  <div>
                    <h1 className={`text-5xl font-bold mb-1 tracking-tight ${
                      theme === 'day' ? 'text-purple-600' :
                      theme === 'night' ? 'text-blue-400' :
                      'text-red-500 glitch-text'
                    }`} data-text="TRUST GUARDIAN">
                      TRUST GUARDIAN
                    </h1>
                    <p className={`text-sm uppercase tracking-widest font-semibold ${
                      theme === 'day' ? 'text-purple-400' :
                      theme === 'night' ? 'text-blue-300 terminal-text' :
                      'text-red-300 terminal-text'
                    }`}>
                      {theme === 'day' && '✨ EMAIL PROTECTION ✨'}
                      {theme === 'night' && '🛡️ SECURE INBOX 🛡️'}
                      {theme === 'haunted' && '🔥 INBOX EXORCIST 🔥'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <NotificationCenter />
                  {user && (
                    <button
                      onClick={() => setProfileOpen(true)}
                      className={`p-3 rounded-lg border transition-all ${
                        theme === 'day'
                          ? 'bg-purple-100/30 hover:bg-purple-200/40 border-purple-300/50 hover:border-purple-400'
                          : theme === 'night'
                          ? 'bg-blue-900/30 hover:bg-blue-800/40 border-blue-700/50 hover:border-blue-600'
                          : 'bg-purple-900/50 hover:bg-purple-900/70 border-purple-900/50 hover:border-purple-700'
                      }`}
                      title="Profile"
                    >
                      <Ghost className={
                        theme === 'day' ? 'text-purple-600' :
                        theme === 'night' ? 'text-blue-400' :
                        'text-purple-400'
                      } size={20} />
                    </button>
                  )}
                  <ThemeToggle />
                  <AuthButton />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setGmailScannerOpen(true)}
                  className={`flex items-center justify-center gap-3 px-8 py-5 font-bold rounded-xl transition-all shadow-2xl hover:scale-105 border-2 ${
                    theme === 'day' 
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:to-pink-600 text-white border-purple-400/50'
                      : theme === 'night'
                      ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:to-cyan-700 text-white border-blue-400/50'
                      : 'bg-gradient-to-r from-red-900 via-red-700 to-red-900 hover:from-red-800 hover:to-red-600 text-white border-red-500/50 nightmare-pulse'
                  }`}
                >
                  <Mail size={28} className={theme === 'haunted' ? 'animate-pulse' : ''} />
                  <div className="text-left">
                    <div className="text-xl">
                      {theme === 'day' && 'SCAN GMAIL INBOX'}
                      {theme === 'night' && 'ANALYZE GMAIL'}
                      {theme === 'haunted' && 'SCAN GMAIL INBOX'}
                    </div>
                    <div className={`text-xs opacity-80 ${
                      theme === 'day' ? 'text-purple-100' :
                      theme === 'night' ? 'text-blue-100' :
                      'text-red-200'
                    }`}>
                      {theme === 'day' && 'Check your emails for threats'}
                      {theme === 'night' && 'Secure email analysis'}
                      {theme === 'haunted' && 'Hunt demons in your emails'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOcrScannerOpen(true)}
                  className={`flex items-center justify-center gap-3 px-8 py-5 font-bold rounded-xl transition-all shadow-2xl hover:scale-105 border-2 ${
                    theme === 'day' 
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white border-pink-400/50'
                      : theme === 'night'
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-700 hover:to-blue-700 text-white border-cyan-400/50'
                      : 'bg-gradient-to-r from-purple-900 via-red-700 to-purple-900 hover:from-purple-800 hover:to-red-600 text-white border-purple-500/50 nightmare-pulse'
                  }`}
                >
                  <Image size={28} className={theme === 'haunted' ? 'eye-blink' : ''} />
                  <div className="text-left">
                    <div className="text-xl">
                      {theme === 'day' && 'SCAN IMAGE (OCR)'}
                      {theme === 'night' && 'IMAGE SCANNER'}
                      {theme === 'haunted' && 'IMAGE EXORCIST'}
                    </div>
                    <div className={`text-xs opacity-80 ${
                      theme === 'day' ? 'text-pink-100' :
                      theme === 'night' ? 'text-cyan-100' :
                      'text-purple-200'
                    }`}>
                      {theme === 'day' && 'Extract & analyze text from images'}
                      {theme === 'night' && 'OCR text extraction & analysis'}
                      {theme === 'haunted' && 'Extract text from cursed images'}
                    </div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 mt-3">
                <button
                  onClick={() => setDashboardOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm font-semibold rounded-xl transition-all border ${
                    theme === 'day'
                      ? 'bg-pink-100/20 text-pink-600 border-pink-300/50 hover:bg-pink-200/30 hover:border-pink-400'
                      : theme === 'night'
                      ? 'bg-purple-900/30 text-purple-300 border-purple-700/50 hover:bg-purple-800/40 hover:border-purple-600'
                      : 'bg-purple-900/50 text-purple-300 border-purple-900/50 hover:bg-purple-800/70 hover:border-purple-700 glow-pulse-purple'
                  }`}
                >
                  <Skull size={20} />
                  <span>Alt View</span>
                </button>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm font-semibold rounded-xl transition-all border ${
                    theme === 'day'
                      ? 'bg-purple-100/20 text-purple-600 border-purple-300/50 hover:bg-purple-200/30 hover:border-purple-400'
                      : theme === 'night'
                      ? 'bg-blue-900/30 text-blue-300 border-blue-700/50 hover:bg-blue-800/40 hover:border-blue-600'
                      : 'bg-gray-900/80 text-gray-300 border-red-900/30 hover:bg-gray-800 hover:border-red-900/50 violent-shake'
                  }`}
                >
                  <History size={20} />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setAnalyzerOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm font-semibold rounded-xl transition-all border ${
                    theme === 'day'
                      ? 'bg-pink-100/20 text-pink-600 border-pink-300/50 hover:bg-pink-200/30 hover:border-pink-400'
                      : theme === 'night'
                      ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50 hover:bg-cyan-800/40 hover:border-cyan-600'
                      : 'bg-gray-900/80 text-gray-300 border-red-900/30 hover:bg-gray-800 hover:border-red-900/50 dying-light'
                  }`}
                >
                  <Eye size={20} className={theme === 'haunted' ? 'eye-blink' : ''} />
                  <span>Analyze Text</span>
                </button>
                <button
                  onClick={() => setGameOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm font-semibold rounded-xl transition-all border ${
                    theme === 'day'
                      ? 'bg-purple-200/30 text-purple-700 border-purple-400/50 hover:bg-purple-300/40 hover:border-purple-500'
                      : theme === 'night'
                      ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700/50 hover:bg-indigo-800/40 hover:border-indigo-600'
                      : 'bg-purple-900/50 text-purple-300 border-purple-900/50 hover:bg-purple-800/70 hover:border-purple-700 dripping-button'
                  }`}
                >
                  <Gamepad2 size={20} />
                  <span>Play Game</span>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm font-semibold rounded-xl transition-all border ${
                    theme === 'day'
                      ? 'bg-purple-100/20 text-purple-600 border-purple-300/50 hover:bg-purple-200/30 hover:border-purple-400'
                      : theme === 'night'
                      ? 'bg-gray-700/30 text-gray-300 border-gray-600/50 hover:bg-gray-600/40 hover:border-gray-500'
                      : 'bg-gray-900/80 text-gray-300 border-red-900/30 hover:bg-gray-800 hover:border-red-900/50'
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <MessageFeed key={feedKey} />
              </div>

              <div className="space-y-6">
                <HauntLevelSlider />
                <Leaderboard />
              </div>
            </div>
          </div>

          <GmailScanner
            isOpen={gmailScannerOpen}
            onClose={() => setGmailScannerOpen(false)}
          />

          <AnalyzerWidget
            isOpen={analyzerOpen}
            onClose={() => setAnalyzerOpen(false)}
            onAnalyzed={handleAnalyzed}
          />

          <SettingsPage
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />

          <HistoryDashboard
            isOpen={historyOpen}
            onClose={() => setHistoryOpen(false)}
          />

          <ScaryGame
            isOpen={gameOpen}
            onClose={() => setGameOpen(false)}
          />

          <ProfilePage
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
          />

          <OCRScanner
            isOpen={ocrScannerOpen}
            onClose={() => setOcrScannerOpen(false)}
          />

          {/* Horror Effects */}
          <JumpScare />
          <PeekingGhost />

          {/* Spooky Audio Control */}
          <SpookyAudioControl />

          {/* DeepGuard Link */}
          <DeepGuardLink />

          <footer className="relative z-10 mt-16 pb-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-black/80 backdrop-blur-sm rounded-full border-2 border-red-900/50 redacted-document">
              <Skull className="text-red-500 creepy-shake" size={20} />
              <span className="text-red-300 text-sm font-semibold terminal-text">
                Protecting souls from digital demons since 2024
              </span>
            </div>
          </footer>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
