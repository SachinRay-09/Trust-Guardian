import type { AgentDetector, DetectionResult } from './types';

export class SpamDetector implements AgentDetector {
  name = 'Spam Detector';

  async detect(content: string): Promise<DetectionResult> {
    try {
      // Using Hugging Face Inference API for spam detection
      const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
      
      if (!HF_API_KEY) {
        return this.fallbackDetection(content);
      }

      const response = await fetch(
        'https://api-inference.huggingface.co/models/mrm8488/bert-tiny-finetuned-sms-spam-detection',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: content }),
        }
      );

      if (!response.ok) {
        return this.fallbackDetection(content);
      }

      const result = await response.json();
      const spamScore = result[0]?.find((r: any) => r.label === 'LABEL_1')?.score || 0;
      const confidence = Math.round(spamScore * 100);

      return {
        detected: confidence > 50,
        confidence,
        details: confidence > 70 ? 'High spam probability' : confidence > 50 ? 'Moderate spam indicators' : 'Low spam risk',
        threatLevel: confidence > 70 ? 'high' : confidence > 50 ? 'medium' : 'low',
      };
    } catch (error) {
      return this.fallbackDetection(content);
    }
  }

  private fallbackDetection(content: string): DetectionResult {
    console.log('📧 [SPAM] Analyzing:', content.substring(0, 100));
    
    const spamKeywords = [
      'winner', 'congratulations', 'claim', 'prize', 'free money', 'free gift',
      'click here', 'act now', 'limited time', 'urgent', 'verify account',
      'suspended', 'confirm identity', 'bitcoin', 'crypto', 'investment opportunity',
      'make money', 'work from home', 'earn cash', 'get paid', 'no experience',
      'viagra', 'cialis', 'weight loss', 'diet pills', 'miracle cure',
      'unsubscribe', 'opt out', 'remove', 'mlm', 'multi-level',
      'guarantee', '100%', 'risk free', 'no risk', 'limited offer'
    ];

    const lowerContent = content.toLowerCase();
    const matches = spamKeywords.filter(keyword => lowerContent.includes(keyword));
    const confidence = Math.min(matches.length * 20, 95);

    console.log('📧 [SPAM] Keywords found:', matches.length, matches);
    console.log('📧 [SPAM] Confidence:', confidence);

    return {
      detected: confidence > 30,
      confidence: Math.max(confidence, matches.length > 0 ? 35 : 0),
      details: matches.length > 0 ? `Spam keywords detected: ${matches.join(', ')}` : 'No spam indicators',
      threatLevel: confidence > 70 ? 'high' : confidence > 30 ? 'medium' : 'low',
    };
  }
}
