import type { AgentDetector, DetectionResult } from './types';

export class ScamDetector implements AgentDetector {
  name = 'Scam Detector';

  async detect(content: string): Promise<DetectionResult> {
    try {
      // Using Hugging Face for phishing/scam detection
      const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
      
      if (!HF_API_KEY) {
        return this.fallbackDetection(content);
      }

      const response = await fetch(
        'https://api-inference.huggingface.co/models/ealvaradob/bert-finetuned-phishing',
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
      const scamScore = result[0]?.find((r: any) => r.label === 'LABEL_1')?.score || 0;
      const confidence = Math.round(scamScore * 100);

      return {
        detected: confidence > 45,
        confidence,
        details: confidence > 70 ? 'High scam probability' : confidence > 45 ? 'Moderate scam indicators' : 'Low scam risk',
        threatLevel: confidence > 70 ? 'high' : confidence > 45 ? 'medium' : 'low',
      };
    } catch (error) {
      return this.fallbackDetection(content);
    }
  }

  private fallbackDetection(content: string): DetectionResult {
    console.log('🎣 [SCAM] Analyzing:', content.substring(0, 100));
    
    const scamIndicators = [
      'scam', 'fraud', 'phishing', 'nigerian prince', 'inheritance', 'bank transfer', 'wire money',
      'western union', 'gift card', 'itunes card', 'amazon card',
      'social security', 'irs', 'tax refund', 'government grant',
      'lottery', 'sweepstakes', 'you won', 'claim your prize', 'winner',
      'verify your account', 'suspended account', 'unusual activity',
      'confirm your identity', 'update payment', 'billing problem',
      'act immediately', 'within 24 hours', 'account will be closed',
      'click this link', 'download attachment', 'open pdf', 'urgent action',
      'congratulations', 'selected', 'free money', 'cash prize'
    ];

    const urgencyPatterns = [
      /urgent/gi,
      /immediate(ly)?/gi,
      /act now/gi,
      /limited time/gi,
      /expires (soon|today|tonight)/gi,
      /hurry/gi,
      /don't (miss|wait)/gi,
    ];

    const lowerContent = content.toLowerCase();
    const keywordMatches = scamIndicators.filter(indicator => 
      lowerContent.includes(indicator)
    );
    
    const urgencyMatches = urgencyPatterns.filter(pattern => 
      pattern.test(content)
    );

    // Check for suspicious URLs
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const urls = content.match(urlPattern) || [];
    const suspiciousUrls = urls.filter(url => 
      !url.includes('https') || 
      url.includes('bit.ly') || 
      url.includes('tinyurl') ||
      url.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) // IP addresses
    );

    const totalIndicators = keywordMatches.length + urgencyMatches.length + suspiciousUrls.length;
    const confidence = Math.min(totalIndicators * 20, 95);

    console.log('🎣 [SCAM] Keywords found:', keywordMatches.length, keywordMatches);
    console.log('🎣 [SCAM] Urgency patterns:', urgencyMatches.length);
    console.log('🎣 [SCAM] Confidence:', confidence);

    return {
      detected: confidence > 30,
      confidence: Math.max(confidence, totalIndicators > 0 ? 35 : 0),
      details: totalIndicators > 0 
        ? `Scam indicators: ${totalIndicators} red flags detected` 
        : 'No scam indicators',
      threatLevel: confidence > 70 ? 'high' : confidence > 30 ? 'medium' : 'low',
    };
  }
}
