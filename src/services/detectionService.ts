import { Detection } from '../types/database';

interface DetectionResult {
  detectorType: 'spam' | 'scam' | 'deepfake' | 'toxicity';
  confidenceScore: number;
  threatDetails: Record<string, unknown>;
}

const SPAM_KEYWORDS = [
  'winner', 'congratulations', 'click here', 'free money', 'act now',
  'limited time', 'urgent', 'verify your account', 'claim your prize',
  'nigerian prince', 'inheritance', 'bitcoin', 'crypto investment'
];

const SCAM_PATTERNS = [
  /password.*reset/i,
  /verify.*account/i,
  /suspended.*account/i,
  /urgent.*action/i,
  /click.*link.*immediately/i,
  /\b\d{16}\b/,
  /social.*security.*number/i,
];

const TOXIC_KEYWORDS = [
  'hate', 'kill', 'die', 'stupid', 'idiot', 'loser', 'trash',
  'worst', 'terrible', 'awful', 'disgusting', 'pathetic'
];

const DEEPFAKE_INDICATORS = [
  /deepfake/i,
  /ai.*generated/i,
  /synthetic.*media/i,
  /manipulated.*image/i,
  /fake.*video/i,
];

function analyzeSpam(content: string): DetectionResult | null {
  const lowerContent = content.toLowerCase();
  const matches = SPAM_KEYWORDS.filter(keyword => lowerContent.includes(keyword));

  if (matches.length > 0) {
    const confidence = Math.min(0.95, 0.4 + (matches.length * 0.15));
    return {
      detectorType: 'spam',
      confidenceScore: Number(confidence.toFixed(2)),
      threatDetails: {
        matched_keywords: matches,
        total_matches: matches.length
      }
    };
  }
  return null;
}

function analyzeScam(content: string): DetectionResult | null {
  const matches = SCAM_PATTERNS.filter(pattern => pattern.test(content));

  if (matches.length > 0) {
    const confidence = Math.min(0.98, 0.5 + (matches.length * 0.2));
    return {
      detectorType: 'scam',
      confidenceScore: Number(confidence.toFixed(2)),
      threatDetails: {
        pattern_matches: matches.length,
        severity: matches.length >= 2 ? 'high' : 'medium'
      }
    };
  }
  return null;
}

function analyzeToxicity(content: string): DetectionResult | null {
  const lowerContent = content.toLowerCase();
  const matches = TOXIC_KEYWORDS.filter(keyword => lowerContent.includes(keyword));

  const hasAllCaps = content === content.toUpperCase() && content.length > 10;
  const hasExcessivePunctuation = (content.match(/[!?]{3,}/g) || []).length > 0;

  if (matches.length > 0 || hasAllCaps || hasExcessivePunctuation) {
    const baseScore = matches.length * 0.2;
    const capsBonus = hasAllCaps ? 0.15 : 0;
    const punctuationBonus = hasExcessivePunctuation ? 0.1 : 0;
    const confidence = Math.min(0.92, 0.3 + baseScore + capsBonus + punctuationBonus);

    return {
      detectorType: 'toxicity',
      confidenceScore: Number(confidence.toFixed(2)),
      threatDetails: {
        toxic_keywords: matches,
        all_caps: hasAllCaps,
        excessive_punctuation: hasExcessivePunctuation
      }
    };
  }
  return null;
}

function analyzeDeepfake(content: string): DetectionResult | null {
  const matches = DEEPFAKE_INDICATORS.filter(pattern => pattern.test(content));

  if (matches.length > 0) {
    return {
      detectorType: 'deepfake',
      confidenceScore: 0.75,
      threatDetails: {
        indicators_found: matches.length,
        warning: 'Potential synthetic or manipulated content'
      }
    };
  }
  return null;
}

export async function analyzeContent(content: string): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = [];

  const spamResult = analyzeSpam(content);
  if (spamResult) detections.push(spamResult);

  const scamResult = analyzeScam(content);
  if (scamResult) detections.push(scamResult);

  const toxicityResult = analyzeToxicity(content);
  if (toxicityResult) detections.push(toxicityResult);

  const deepfakeResult = analyzeDeepfake(content);
  if (deepfakeResult) detections.push(deepfakeResult);

  return detections;
}

export function calculateHauntLevel(detections: Detection[]): number {
  if (detections.length === 0) return 0;

  const maxConfidence = Math.max(...detections.map(d => d.confidence_score));
  const threatCount = detections.length;

  if (maxConfidence >= 0.9 || threatCount >= 3) return 5;
  if (maxConfidence >= 0.75 || threatCount >= 2) return 4;
  if (maxConfidence >= 0.6) return 3;
  if (maxConfidence >= 0.4) return 2;
  return 1;
}

export function getGhostBadgeLevel(score: number): string {
  if (score >= 1000) return 'Phantom Lord';
  if (score >= 500) return 'Specter Master';
  if (score >= 250) return 'Wraith Hunter';
  if (score >= 100) return 'Ghost Buster';
  if (score >= 50) return 'Spirit Seeker';
  return 'Novice Spirit';
}
