import type { AgentDetector, DetectionResult } from './types';

export class ToxicityDetector implements AgentDetector {
  name = 'Toxicity Detector';

  async detect(content: string): Promise<DetectionResult> {
    try {
      // Using Perspective API for toxicity detection
      const PERSPECTIVE_API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;
      
      if (!PERSPECTIVE_API_KEY) {
        return this.fallbackDetection(content);
      }

      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: { text: content },
            languages: ['en'],
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              INSULT: {},
              PROFANITY: {},
              THREAT: {},
            },
          }),
        }
      );

      if (!response.ok) {
        return this.fallbackDetection(content);
      }

      const result = await response.json();
      const toxicityScore = result.attributeScores?.TOXICITY?.summaryScore?.value || 0;
      const severeToxicity = result.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0;
      const maxScore = Math.max(toxicityScore, severeToxicity);
      const confidence = Math.round(maxScore * 100);

      return {
        detected: confidence > 50,
        confidence,
        details: confidence > 75 ? 'Severe toxicity detected' : confidence > 50 ? 'Moderate toxicity' : 'Low toxicity',
        threatLevel: confidence > 75 ? 'high' : confidence > 50 ? 'medium' : 'low',
      };
    } catch (error) {
      return this.fallbackDetection(content);
    }
  }

  private fallbackDetection(content: string): DetectionResult {
    console.log('☠️ [TOXIC] Analyzing:', content.substring(0, 100));
    
    const toxicPatterns = [
      /\b(hate|stupid|idiot|dumb|moron|loser|fool|jerk)\b/gi,
      /\b(kill|die|death|hurt|harm|murder|destroy)\b/gi,
      /\b(racist|sexist|bigot|nazi|fascist)\b/gi,
      /\b(fuck|shit|damn|hell|ass|bitch)\b/gi,
      /\b(ugly|disgusting|pathetic|worthless|useless)\b/gi,
      /[!]{3,}/g, // Multiple exclamation marks
      /[A-Z]{10,}/g, // Excessive caps
    ];

    const matches = toxicPatterns.filter(pattern => pattern.test(content));
    const confidence = Math.min(matches.length * 25, 95);

    console.log('☠️ [TOXIC] Patterns matched:', matches.length);
    console.log('☠️ [TOXIC] Confidence:', confidence);

    return {
      detected: confidence > 30,
      confidence: Math.max(confidence, matches.length > 0 ? 40 : 0),
      details: matches.length > 0 ? `Toxic patterns detected: ${matches.length} indicators` : 'No toxicity detected',
      threatLevel: confidence > 70 ? 'high' : confidence > 30 ? 'medium' : 'low',
    };
  }
}
