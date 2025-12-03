import { useState } from 'react';
import { Scan, Upload, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analysisService, notificationService } from '../services/supabase';
import { SpamDetector, DeepfakeDetector, ToxicityDetector, ScamDetector } from '../agents';
import { SteeringConfigManager } from '../lib/steeringConfig';
import { ThreatGlow } from './SpectralEffects';

interface AnalyzerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzed: () => void;
}

export function AnalyzerWidget({ isOpen, onClose, onAnalyzed }: AnalyzerWidgetProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'email' | 'comment' | 'review' | 'text'>('text');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    spam: number;
    deepfake: number;
    toxicity: number;
    scam: number;
    overall: 'low' | 'medium' | 'high';
    isThreat: boolean;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const config = SteeringConfigManager.getConfig();
      const strictnessMultiplier = SteeringConfigManager.getStrictnessMultiplier();

      // Run all active detectors
      const detectors = [
        { detector: new SpamDetector(), key: 'spam_detector' as const },
        { detector: new DeepfakeDetector(), key: 'deepfake_detector' as const },
        { detector: new ToxicityDetector(), key: 'toxicity_detector' as const },
        { detector: new ScamDetector(), key: 'scam_detector' as const },
      ];

      const results = await Promise.all(
        detectors.map(async ({ detector, key }) => {
          if (!config.active_agents[key]) {
            return { key, result: { detected: false, confidence: 0, threatLevel: 'low' as const } };
          }
          const result = await detector.detect(content);
          // Apply strictness multiplier
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
      
      const overall: 'low' | 'medium' | 'high' = 
        maxScore > 70 ? 'high' : maxScore > 40 ? 'medium' : 'low';
      const isThreat = maxScore > 40;

      setResult({
        ...scores,
        overall,
        isThreat,
      });

      // Save to database if user is logged in
      if (user) {
        const { data: analysis } = await analysisService.saveAnalysis({
          user_id: user.id,
          content_type: contentType,
          content_preview: content.substring(0, 200),
          spam_score: Math.round(scores.spam),
          deepfake_score: Math.round(scores.deepfake),
          toxicity_score: Math.round(scores.toxicity),
          scam_score: Math.round(scores.scam),
          overall_threat_level: overall,
          is_threat: isThreat,
        });

        // Create notification if threat detected
        if (isThreat && analysis) {
          await notificationService.createNotification({
            user_id: user.id,
            title: '⚠️ Threat Detected',
            message: `${overall.toUpperCase()} risk content detected with ${Math.round(maxScore)}% confidence`,
            type: 'threat_detected',
            is_read: false,
            analysis_id: analysis.id,
          });
        }
      }

      onAnalyzed();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text');
    if (text) setContent(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-morphism-strong rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.4)] max-w-2xl w-full max-h-[90vh] overflow-hidden glow-pulse-cyan">
        <div className="sticky top-0 glass-morphism border-b border-cyan-500/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 glow-pulse-cyan">
              <Scan className="text-cyan-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Trust Analyzer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg button-press"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)] smooth-scroll">
          <div>
            <label className="block text-white font-semibold mb-3 text-sm flex items-center gap-2">
              <span className="text-cyan-400">📝</span>
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['email', 'comment', 'review', 'text'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-3 py-2 rounded-lg border smooth-transition capitalize text-sm font-semibold button-press ${
                    contentType === type
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-gray-700/50 glass-morphism text-gray-400 hover:border-cyan-500/50 hover:text-cyan-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative group"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or drag content here to analyze for spam, scams, deepfakes, and toxicity..."
              className="w-full h-48 glass-morphism border-2 border-dashed border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none smooth-transition resize-none group-hover:border-cyan-500/50"
            />
            <div className="absolute bottom-4 right-4 text-gray-500 text-sm flex items-center gap-2 opacity-50 group-hover:opacity-100 smooth-transition">
              <Upload size={16} />
              <span>Drop text here</span>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!content.trim() || analyzing}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed smooth-transition shadow-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-[1.02] button-press"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Scan size={20} />
                Analyze Content
              </span>
            )}
          </button>

          {result && (
            <div className={`relative mt-6 p-6 glass-morphism-strong rounded-xl border-2 shimmer-effect ${
              result.isThreat 
                ? result.overall === 'high' ? 'border-red-500/50 threat-pulse-high' :
                  result.overall === 'medium' ? 'border-orange-500/50 threat-pulse-medium' :
                  'border-yellow-500/50 threat-pulse-low'
                : 'border-green-500/50'
            }`}>
              <ThreatGlow level={result.overall} />
              
              <div className="relative z-10">
                {!result.isThreat ? (
                  <div className="flex items-center gap-4 text-green-400">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Content is Clean ✨</h3>
                      <p className="text-sm text-gray-400">No significant threats detected</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-full ${
                        result.overall === 'high' ? 'bg-red-500/20' :
                        result.overall === 'medium' ? 'bg-orange-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        <AlertTriangle size={32} className={`animate-pulse ${
                          result.overall === 'high' ? 'text-red-400' :
                          result.overall === 'medium' ? 'text-orange-400' :
                          'text-yellow-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xl ${
                          result.overall === 'high' ? 'text-red-400' :
                          result.overall === 'medium' ? 'text-orange-400' :
                          'text-yellow-400'
                        }`}>
                          {result.overall.toUpperCase()} Risk Detected ⚠️
                        </h3>
                        <p className="text-sm text-gray-400">
                          Multiple threat indicators found
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Spam', score: result.spam, icon: '📧' },
                        { label: 'Deepfake', score: result.deepfake, icon: '🎭' },
                        { label: 'Toxicity', score: result.toxicity, icon: '☠️' },
                        { label: 'Scam', score: result.scam, icon: '🎣' },
                      ].map(({ label, score, icon }) => (
                        <div
                          key={label}
                          className={`p-4 rounded-lg border-2 glass-morphism hover-lift smooth-transition ${
                            score > 70 ? 'border-red-500/30' :
                            score > 40 ? 'border-orange-500/30' :
                            'border-green-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold text-sm flex items-center gap-2">
                              <span className="text-xl">{icon}</span>
                              {label}
                            </span>
                            <span className={`text-lg font-bold ${
                              score > 70 ? 'text-red-400' :
                              score > 40 ? 'text-orange-400' :
                              'text-green-400'
                            }`}>
                              {Math.round(score)}%
                            </span>
                          </div>
                          <div className="threat-bar h-2.5">
                            <div
                              className={`threat-bar-fill ${
                                score > 70 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                                score > 40 ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                                'bg-gradient-to-r from-green-600 to-green-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
