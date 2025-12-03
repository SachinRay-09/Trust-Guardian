import { useState, useEffect } from 'react';
import { Mail, Trash2, AlertTriangle, Skull, Eye, Loader, Shield, X } from 'lucide-react';
import { gmailService, type GmailMessage } from '../services/gmailService';
import { SpamDetector, DeepfakeDetector, ToxicityDetector, ScamDetector } from '../agents';
import { SteeringConfigManager } from '../lib/steeringConfig';
import { useAuth } from '../contexts/AuthContext';
import { analysisService, notificationService } from '../services/supabase';

interface GmailScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GmailScanner = ({ isOpen, onClose }: GmailScannerProps) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'threats' | 'safe' | 'promotional'>('all');
  const [scanProgress, setScanProgress] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      checkAuthentication();
    }
  }, [isOpen, user]);

  const checkAuthentication = async () => {
    const isAuth = await gmailService.refreshToken();
    setAuthenticated(isAuth);
  };

  const handleAuthenticate = async () => {
    setLoading(true);
    const success = await gmailService.authenticate();
    if (success) {
      setAuthenticated(true);
      await loadEmails();
    }
    setLoading(false);
  };

  const loadEmails = async () => {
    setLoading(true);
    setAnimationComplete(false);
    try {
      const fetchedEmails = await gmailService.fetchEmails(50);
      setEmails(fetchedEmails);
      
      // Mark animation as complete after all emails have crawled in
      setTimeout(() => {
        setAnimationComplete(true);
      }, fetchedEmails.length * 50 + 1000); // 50ms per email + 1s buffer
    } catch (error: any) {
      console.error('Failed to load emails:', error);
      
      // Check if it's a permission error
      if (error?.message?.includes('PERMISSION_ERROR')) {
        setAuthenticated(false);
        alert('⚠️ Gmail Permissions Expired!\n\nYour Gmail access has expired or needs updated permissions.\n\nPlease click "Connect Gmail & Unleash the Scan" button again to reconnect with the required permissions.');
      } else {
        alert('Failed to load emails. Please try reconnecting your Gmail account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadEmails = async () => {
    setAnimationComplete(false);
    await loadEmails();
  };

  const scanEmails = async () => {
    if (emails.length === 0) return;

    setScanning(true);
    setScanProgress(0);

    const config = SteeringConfigManager.getConfig();
    const strictnessMultiplier = SteeringConfigManager.getStrictnessMultiplier();

    const detectors = [
      { detector: new SpamDetector(), key: 'spam_detector' as const },
      { detector: new DeepfakeDetector(), key: 'deepfake_detector' as const },
      { detector: new ToxicityDetector(), key: 'toxicity_detector' as const },
      { detector: new ScamDetector(), key: 'scam_detector' as const },
    ];

    const scannedEmails: GmailMessage[] = [];
    let threatsFound = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const content = `${email.subject} ${email.snippet} ${email.body}`;

      // Run all active detectors
      const results = await Promise.all(
        detectors.map(async ({ detector, key }) => {
          if (!config.active_agents[key]) {
            return { key, result: { detected: false, confidence: 0, threatLevel: 'low' as const } };
          }
          const result = await detector.detect(content);
          const adjustedConfidence = Math.min(result.confidence * strictnessMultiplier, 100);
          return {
            key,
            result: { ...result, confidence: adjustedConfidence },
          };
        })
      );

      const scores = {
        spam: results.find(r => r.key === 'spam_detector')?.result.confidence || 0,
        deepfake: results.find(r => r.key === 'deepfake_detector')?.result.confidence || 0,
        toxicity: results.find(r => r.key === 'toxicity_detector')?.result.confidence || 0,
        scam: results.find(r => r.key === 'scam_detector')?.result.confidence || 0,
      };

      const maxScore = Math.max(scores.spam, scores.deepfake, scores.toxicity, scores.scam);
      const overallThreatLevel: 'low' | 'medium' | 'high' = 
        maxScore > 70 ? 'high' : maxScore > 40 ? 'medium' : 'low';
      const isThreat = maxScore > 40;

      // Detect promotional/advertising emails
      const promotionalKeywords = [
        'unsubscribe', 'opt out', 'promotional', 'advertisement', 'sale', 'discount',
        'offer', 'deal', 'limited time', 'shop now', 'buy now', 'order now',
        'newsletter', 'subscribe', 'marketing', 'promotion', 'special offer',
        '% off', 'free shipping', 'coupon', 'promo code', 'exclusive'
      ];
      const emailContent = `${email.subject} ${email.snippet} ${email.body}`.toLowerCase();
      const isPromotional = promotionalKeywords.some(keyword => emailContent.includes(keyword));

      if (isThreat) threatsFound++;

      scannedEmails.push({
        ...email,
        spamScore: Math.round(scores.spam),
        deepfakeScore: Math.round(scores.deepfake),
        toxicityScore: Math.round(scores.toxicity),
        scamScore: Math.round(scores.scam),
        overallThreatLevel,
        isThreat,
        isSpam: scores.spam > 40,
        isPromotional,
      } as any);

      setScanProgress(Math.round(((i + 1) / emails.length) * 100));

      // Save to database if user is logged in
      if (user) {
        await analysisService.saveAnalysis({
          user_id: user.id,
          content_type: 'email',
          content_preview: `${email.subject} - ${email.snippet}`.substring(0, 200),
          spam_score: Math.round(scores.spam),
          deepfake_score: Math.round(scores.deepfake),
          toxicity_score: Math.round(scores.toxicity),
          scam_score: Math.round(scores.scam),
          overall_threat_level: overallThreatLevel,
          is_threat: isThreat,
        });
      }
    }

    setEmails(scannedEmails);
    setScanning(false);

    // Send notification
    if (user && threatsFound > 0) {
      await notificationService.createNotification({
        user_id: user.id,
        title: '🚨 Email Threats Detected!',
        message: `Found ${threatsFound} threatening emails in your inbox. Review and delete them now!`,
        type: 'threat_detected',
        is_read: false,
      });
    }
  };

  const handleDelete = async (emailId: string) => {
    const success = await gmailService.deleteEmail(emailId);
    if (success) {
      setEmails(emails.filter(e => e.id !== emailId));
      setSelectedEmails(prev => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedEmails.size === 0) return;

    const result = await gmailService.batchDeleteEmails(Array.from(selectedEmails));
    if (result.success > 0) {
      setEmails(emails.filter(e => !selectedEmails.has(e.id)));
      setSelectedEmails(new Set());
    }
  };

  const toggleSelect = (emailId: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  };

  const selectAllThreats = () => {
    const threatIds = emails.filter(e => e.isThreat).map(e => e.id);
    setSelectedEmails(new Set(threatIds));
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'threats') return email.isThreat;
    if (filter === 'safe') return !email.isThreat && !(email as any).isPromotional;
    if (filter === 'promotional') return (email as any).isPromotional;
    return true;
  });

  const threatCount = emails.filter(e => e.isThreat).length;
  const promotionalCount = emails.filter(e => (e as any).isPromotional).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden horror-bg rounded-2xl border-2 border-red-900/50 shadow-2xl nightmare-pulse">
        {/* Horrifying Header */}
        <div className="sticky top-0 bg-gradient-to-r from-black via-red-950 to-black border-b-2 border-red-900/50 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Skull className="text-red-500 creepy-shake" size={40} />
              <div className="absolute inset-0 demon-eyes opacity-50" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-red-500 possessed-text">
                INBOX OF HORRORS
              </h2>
              <p className="text-red-300 text-sm animate-pulse">
                {threatCount > 0 ? `⚠️ ${threatCount} THREATS DETECTED` : 'Scanning for evil...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <X className="text-red-400" size={28} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6">
          {!authenticated ? (
            <div className="text-center py-20 crawl-in">
              <div className="relative inline-block mb-6">
                <Eye className="text-red-500 eye-blink" size={80} />
                <div className="absolute inset-0 demon-eyes opacity-70" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-4 possessed-text">
                GRANT ACCESS TO YOUR SOUL... I MEAN, GMAIL
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Allow us to peer into your inbox and hunt down the demons lurking in your emails
              </p>
              <button
                onClick={handleAuthenticate}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg nightmare-pulse disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <Loader className="animate-spin" size={24} />
                    Summoning...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Mail size={24} />
                    Connect Gmail & Unleash the Scan
                  </span>
                )}
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <Loader className="animate-spin text-red-500 mx-auto mb-4" size={64} />
              <p className="text-red-400 text-xl possessed-text">Summoning your emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-20">
              <Shield className="text-green-500 mx-auto mb-4 haunted-float" size={64} />
              <p className="text-gray-400 text-xl">Your inbox is empty... for now</p>
              <button
                onClick={loadEmails}
                className="mt-6 px-6 py-3 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-all"
              >
                Load Emails
              </button>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-black/50 p-4 rounded-xl border border-red-900/30">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filter === 'all'
                        ? 'bg-red-900 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    All ({emails.length})
                  </button>
                  <button
                    onClick={() => setFilter('threats')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filter === 'threats'
                        ? 'bg-red-900 text-white nightmare-pulse'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    🔥 Threats ({threatCount})
                  </button>
                  <button
                    onClick={() => setFilter('promotional')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filter === 'promotional'
                        ? 'bg-yellow-900 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    📢 Promotional ({promotionalCount})
                  </button>
                  <button
                    onClick={() => setFilter('safe')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filter === 'safe'
                        ? 'bg-green-900 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    ✅ Safe ({emails.length - threatCount - promotionalCount})
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={reloadEmails}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-400 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Mail size={18} />
                    Reload Emails
                  </button>

                  {!scanning && emails.some(e => e.spamScore === 0) && (
                    <button
                      onClick={scanEmails}
                      className="px-6 py-2 bg-gradient-to-r from-purple-900 to-red-900 hover:from-purple-800 hover:to-red-800 text-white font-bold rounded-lg transition-all shadow-lg"
                    >
                      <span className="flex items-center gap-2">
                        <Skull size={20} />
                        Scan for Evil
                      </span>
                    </button>
                  )}
                  
                  {threatCount > 0 && (
                    <button
                      onClick={selectAllThreats}
                      className="px-4 py-2 bg-orange-900/50 hover:bg-orange-900/70 text-orange-400 rounded-lg transition-all"
                    >
                      Select All Threats
                    </button>
                  )}

                  {selectedEmails.size > 0 && (
                    <button
                      onClick={handleBatchDelete}
                      className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete {selectedEmails.size}
                    </button>
                  )}
                </div>
              </div>

              {/* Scanning Progress */}
              {scanning && (
                <div className="mb-6 bg-black/70 p-6 rounded-xl border-2 border-red-900/50 nightmare-pulse">
                  <div className="flex items-center gap-4 mb-3">
                    <Loader className="animate-spin text-red-500" size={32} />
                    <div className="flex-1">
                      <p className="text-red-400 font-bold text-lg possessed-text">
                        SCANNING FOR DEMONS...
                      </p>
                      <p className="text-gray-400 text-sm">{scanProgress}% complete</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-900 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Email List */}
              <div className={`space-y-3 ${animationComplete ? 'email-list-stable' : ''}`}>
                {filteredEmails.map((email, index) => {
                  const isPromotional = (email as any).isPromotional;
                  return (
                    <div
                      key={email.id}
                      className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all redacted-document ${
                        !animationComplete ? 'crawl-in' : ''
                      } ${
                        email.isThreat
                          ? 'threat-detected-horror border-red-900 blood-stain'
                          : isPromotional
                          ? 'bg-yellow-900/10 border-yellow-700/50 hover:border-yellow-600'
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                      }`}
                      style={!animationComplete ? { animationDelay: `${index * 0.05}s` } : {}}
                    >
                      {email.isThreat && (
                        <div className="absolute top-0 right-0 p-2">
                          <AlertTriangle className="text-red-500 animate-pulse" size={24} />
                        </div>
                      )}
                      {isPromotional && !email.isThreat && (
                        <div className="absolute top-0 right-0 p-2">
                          <span className="text-yellow-500 text-xl">📢</span>
                        </div>
                      )}

                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={() => toggleSelect(email.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-lg truncate ${
                              email.isThreat ? 'text-red-400 possessed-text' : 'text-white'
                            }`}>
                              {email.subject || '(No Subject)'}
                            </h4>
                            <p className="text-gray-400 text-sm truncate">{email.from}</p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(email.date).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {email.snippet}
                        </p>

                        {email.spamScore > 0 && (
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {[
                              { label: 'Spam', score: email.spamScore, icon: '📧' },
                              { label: 'Deepfake', score: email.deepfakeScore, icon: '🎭' },
                              { label: 'Toxic', score: email.toxicityScore, icon: '☠️' },
                              { label: 'Scam', score: email.scamScore, icon: '🎣' },
                            ].map(({ label, score, icon }) => (
                              <div
                                key={label}
                                className={`p-2 rounded-lg text-center ${
                                  score > 70 ? 'bg-red-900/30 border border-red-900/50' :
                                  score > 40 ? 'bg-orange-900/30 border border-orange-900/50' :
                                  'bg-green-900/30 border border-green-900/50'
                                }`}
                              >
                                <div className="text-lg mb-1">{icon}</div>
                                <div className={`text-xs font-bold ${
                                  score > 70 ? 'text-red-400' :
                                  score > 40 ? 'text-orange-400' :
                                  'text-green-400'
                                }`}>
                                  {score}%
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(email.id)}
                            className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
