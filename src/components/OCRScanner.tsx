import { useState, useRef } from 'react';
import { Upload, X, Loader, Eye, Skull, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { SpamDetector, DeepfakeDetector, ToxicityDetector, ScamDetector } from '../agents';
import { SteeringConfigManager } from '../lib/steeringConfig';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { analysisService, notificationService } from '../services/supabase';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OCRScanner = ({ isOpen, onClose }: OCRScannerProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract text using OCR
    await extractText(file);
  };

  const extractText = async (file: File) => {
    setProcessing(true);
    setProgress(0);
    setExtractedText('');
    setResults(null);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      setProcessing(false);

      // Automatically analyze the extracted text
      if (text.trim()) {
        await analyzeText(text);
      }
    } catch (error) {
      console.error('OCR failed:', error);
      setProcessing(false);
      alert('Failed to extract text from image. Please try another image.');
    }
  };

  const analyzeText = async (text: string) => {
    if (!text.trim()) return;

    setAnalyzing(true);

    const config = SteeringConfigManager.getConfig();
    const strictnessMultiplier = SteeringConfigManager.getStrictnessMultiplier();

    const detectors = [
      { detector: new SpamDetector(), key: 'spam_detector' as const },
      { detector: new DeepfakeDetector(), key: 'deepfake_detector' as const },
      { detector: new ToxicityDetector(), key: 'toxicity_detector' as const },
      { detector: new ScamDetector(), key: 'scam_detector' as const },
    ];

    const detectionResults = await Promise.all(
      detectors.map(async ({ detector, key }) => {
        if (!config.active_agents[key]) {
          return { key, result: { detected: false, confidence: 0, threatLevel: 'low' as const } };
        }
        const result = await detector.detect(text);
        const adjustedConfidence = Math.min(result.confidence * strictnessMultiplier, 100);
        return {
          key,
          result: { ...result, confidence: adjustedConfidence },
        };
      })
    );

    const scores = {
      spam: detectionResults.find(r => r.key === 'spam_detector')?.result.confidence || 0,
      deepfake: detectionResults.find(r => r.key === 'deepfake_detector')?.result.confidence || 0,
      toxicity: detectionResults.find(r => r.key === 'toxicity_detector')?.result.confidence || 0,
      scam: detectionResults.find(r => r.key === 'scam_detector')?.result.confidence || 0,
    };

    const maxScore = Math.max(scores.spam, scores.deepfake, scores.toxicity, scores.scam);
    const overallThreatLevel: 'low' | 'medium' | 'high' = 
      maxScore > 70 ? 'high' : maxScore > 40 ? 'medium' : 'low';
    const isThreat = maxScore > 40;

    setResults({
      scores,
      overallThreatLevel,
      isThreat,
      maxScore,
    });

    setAnalyzing(false);

    // Save to database if user is logged in
    if (user) {
      await analysisService.saveAnalysis({
        user_id: user.id,
        content_type: 'ocr_image',
        content_preview: text.substring(0, 200),
        spam_score: Math.round(scores.spam),
        deepfake_score: Math.round(scores.deepfake),
        toxicity_score: Math.round(scores.toxicity),
        scam_score: Math.round(scores.scam),
        overall_threat_level: overallThreatLevel,
        is_threat: isThreat,
      });

      // Send notification if threat detected
      if (isThreat) {
        await notificationService.createNotification({
          user_id: user.id,
          title: '🚨 Threat Detected in Image!',
          message: `OCR scan found ${overallThreatLevel} level threat in uploaded image.`,
          type: 'threat_detected',
          is_read: false,
        });
      }
    }
  };

  const handleReset = () => {
    setImage(null);
    setExtractedText('');
    setResults(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className={`relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl border-2 shadow-2xl ${
        theme === 'day'
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
          : theme === 'night'
          ? 'bg-gradient-to-br from-gray-900 to-blue-950 border-blue-700'
          : 'horror-bg border-red-900/50 nightmare-pulse'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 p-6 border-b-2 flex items-center justify-between z-10 ${
          theme === 'day'
            ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'
            : theme === 'night'
            ? 'bg-gradient-to-r from-gray-800 to-blue-900 border-blue-700'
            : 'bg-gradient-to-r from-black via-red-950 to-black border-red-900/50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              {theme === 'haunted' ? (
                <>
                  <Eye className="text-red-500 eye-blink" size={40} />
                  <div className="absolute inset-0 demon-eyes opacity-50" />
                </>
              ) : (
                <ImageIcon className={
                  theme === 'day' ? 'text-purple-600' : 'text-blue-400'
                } size={40} />
              )}
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${
                theme === 'day' ? 'text-purple-600' :
                theme === 'night' ? 'text-blue-400' :
                'text-red-500 possessed-text'
              }`}>
                {theme === 'haunted' ? 'IMAGE EXORCIST' : 'OCR SCANNER'}
              </h2>
              <p className={`text-sm ${
                theme === 'day' ? 'text-purple-500' :
                theme === 'night' ? 'text-blue-300' :
                'text-red-300 animate-pulse'
              }`}>
                {theme === 'haunted' 
                  ? 'Extract text from cursed images'
                  : 'Extract and analyze text from images'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'day'
                ? 'hover:bg-purple-200/50 text-purple-600'
                : theme === 'night'
                ? 'hover:bg-blue-800/50 text-blue-400'
                : 'hover:bg-red-900/30 text-red-400'
            }`}
          >
            <X size={28} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)] p-6">
          {!image ? (
            /* Upload Area */
            <div className="text-center py-20">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="ocr-file-input"
              />
              <label
                htmlFor="ocr-file-input"
                className={`inline-block cursor-pointer p-12 rounded-2xl border-4 border-dashed transition-all ${
                  theme === 'day'
                    ? 'bg-purple-50 border-purple-300 hover:bg-purple-100 hover:border-purple-400'
                    : theme === 'night'
                    ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50 hover:border-blue-600'
                    : 'bg-black/50 border-red-900/50 hover:bg-black/70 hover:border-red-700 nightmare-pulse'
                }`}
              >
                <Upload className={`mx-auto mb-4 ${
                  theme === 'day' ? 'text-purple-500' :
                  theme === 'night' ? 'text-blue-400' :
                  'text-red-500 haunted-float'
                }`} size={64} />
                <h3 className={`text-2xl font-bold mb-2 ${
                  theme === 'day' ? 'text-purple-600' :
                  theme === 'night' ? 'text-blue-400' :
                  'text-red-400 possessed-text'
                }`}>
                  {theme === 'haunted' ? 'Upload Cursed Image' : 'Upload Image'}
                </h3>
                <p className={`text-sm mb-4 ${
                  theme === 'day' ? 'text-purple-500' :
                  theme === 'night' ? 'text-blue-300' :
                  'text-gray-400'
                }`}>
                  Screenshots, photos, or scanned documents
                </p>
                <p className={`text-xs ${
                  theme === 'day' ? 'text-purple-400' :
                  theme === 'night' ? 'text-blue-300/70' :
                  'text-gray-500'
                }`}>
                  Supports: JPG, PNG, GIF, BMP, TIFF
                </p>
              </label>
            </div>
          ) : (
            /* Results Area */
            <div className="space-y-6">
              {/* Image Preview */}
              <div className={`rounded-xl overflow-hidden border-2 ${
                theme === 'day' ? 'border-purple-300' :
                theme === 'night' ? 'border-blue-700' :
                'border-red-900/50'
              }`}>
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full max-h-96 object-contain bg-black/20"
                />
              </div>

              {/* Processing Status */}
              {processing && (
                <div className={`p-6 rounded-xl border-2 ${
                  theme === 'day'
                    ? 'bg-purple-50 border-purple-300'
                    : theme === 'night'
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-black/70 border-red-900/50 nightmare-pulse'
                }`}>
                  <div className="flex items-center gap-4 mb-3">
                    <Loader className={`animate-spin ${
                      theme === 'day' ? 'text-purple-600' :
                      theme === 'night' ? 'text-blue-400' :
                      'text-red-500'
                    }`} size={32} />
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        theme === 'day' ? 'text-purple-600' :
                        theme === 'night' ? 'text-blue-400' :
                        'text-red-400 possessed-text'
                      }`}>
                        {theme === 'haunted' ? 'EXTRACTING CURSED TEXT...' : 'EXTRACTING TEXT...'}
                      </p>
                      <p className={`text-sm ${
                        theme === 'day' ? 'text-purple-500' :
                        theme === 'night' ? 'text-blue-300' :
                        'text-gray-400'
                      }`}>
                        {progress}% complete
                      </p>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${
                    theme === 'day' ? 'bg-purple-200' :
                    theme === 'night' ? 'bg-blue-950' :
                    'bg-gray-800'
                  }`}>
                    <div
                      className={`h-full transition-all duration-300 ${
                        theme === 'day'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : theme === 'night'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                          : 'bg-gradient-to-r from-red-900 via-red-600 to-red-900'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              {extractedText && (
                <div className={`p-6 rounded-xl border-2 ${
                  theme === 'day'
                    ? 'bg-purple-50 border-purple-300'
                    : theme === 'night'
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-black/50 border-red-900/30 redacted-document'
                }`}>
                  <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
                    theme === 'day' ? 'text-purple-600' :
                    theme === 'night' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>
                    <Eye size={20} />
                    Extracted Text
                  </h3>
                  <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto ${
                    theme === 'day'
                      ? 'bg-white text-gray-800'
                      : theme === 'night'
                      ? 'bg-gray-950 text-blue-200'
                      : 'bg-black/70 text-gray-300'
                  }`}>
                    {extractedText}
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analyzing && (
                <div className={`p-6 rounded-xl border-2 text-center ${
                  theme === 'day'
                    ? 'bg-purple-50 border-purple-300'
                    : theme === 'night'
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-black/70 border-red-900/50 nightmare-pulse'
                }`}>
                  <Loader className={`animate-spin mx-auto mb-3 ${
                    theme === 'day' ? 'text-purple-600' :
                    theme === 'night' ? 'text-blue-400' :
                    'text-red-500'
                  }`} size={40} />
                  <p className={`font-bold ${
                    theme === 'day' ? 'text-purple-600' :
                    theme === 'night' ? 'text-blue-400' :
                    'text-red-400 possessed-text'
                  }`}>
                    {theme === 'haunted' ? 'HUNTING DEMONS...' : 'ANALYZING THREATS...'}
                  </p>
                </div>
              )}

              {results && (
                <div className={`p-6 rounded-xl border-2 ${
                  results.isThreat
                    ? theme === 'haunted'
                      ? 'threat-detected-horror border-red-900 blood-stain'
                      : 'bg-red-50 border-red-300'
                    : theme === 'day'
                    ? 'bg-green-50 border-green-300'
                    : theme === 'night'
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-green-900/20 border-green-900/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {results.isThreat ? (
                      <>
                        <AlertTriangle className={
                          theme === 'haunted' ? 'text-red-500 animate-pulse' : 'text-red-600'
                        } size={32} />
                        <div>
                          <h3 className={`text-xl font-bold ${
                            theme === 'haunted' ? 'text-red-400 possessed-text' : 'text-red-600'
                          }`}>
                            {theme === 'haunted' ? 'DEMON DETECTED!' : 'THREAT DETECTED!'}
                          </h3>
                          <p className={
                            theme === 'haunted' ? 'text-red-300' : 'text-red-500'
                          }>
                            {results.overallThreatLevel.toUpperCase()} level threat
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Skull className={
                          theme === 'day' ? 'text-green-600' :
                          theme === 'night' ? 'text-green-400' :
                          'text-green-500'
                        } size={32} />
                        <div>
                          <h3 className={`text-xl font-bold ${
                            theme === 'day' ? 'text-green-600' :
                            theme === 'night' ? 'text-green-400' :
                            'text-green-400'
                          }`}>
                            {theme === 'haunted' ? 'NO DEMONS FOUND' : 'CONTENT SAFE'}
                          </h3>
                          <p className={
                            theme === 'day' ? 'text-green-500' :
                            theme === 'night' ? 'text-green-300' :
                            'text-green-300'
                          }>
                            No significant threats detected
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Threat Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Spam', score: results.scores.spam, icon: '📧' },
                      { label: 'Deepfake', score: results.scores.deepfake, icon: '🎭' },
                      { label: 'Toxic', score: results.scores.toxicity, icon: '☠️' },
                      { label: 'Scam', score: results.scores.scam, icon: '🎣' },
                    ].map(({ label, score, icon }) => (
                      <div
                        key={label}
                        className={`p-4 rounded-lg text-center border-2 ${
                          score > 70
                            ? theme === 'haunted'
                              ? 'bg-red-900/30 border-red-900/50'
                              : 'bg-red-100 border-red-300'
                            : score > 40
                            ? theme === 'haunted'
                              ? 'bg-orange-900/30 border-orange-900/50'
                              : 'bg-orange-100 border-orange-300'
                            : theme === 'haunted'
                            ? 'bg-green-900/30 border-green-900/50'
                            : 'bg-green-100 border-green-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{icon}</div>
                        <div className={`text-xs font-semibold mb-1 ${
                          theme === 'day' ? 'text-gray-600' :
                          theme === 'night' ? 'text-gray-300' :
                          'text-gray-400'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-xl font-bold ${
                          score > 70
                            ? 'text-red-600'
                            : score > 40
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {Math.round(score)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all border-2 ${
                    theme === 'day'
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-600 border-purple-300'
                      : theme === 'night'
                      ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border-blue-700'
                      : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border-red-900/30'
                  }`}
                >
                  Scan Another Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
