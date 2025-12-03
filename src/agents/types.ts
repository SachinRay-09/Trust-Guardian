export interface DetectionResult {
  detected: boolean;
  confidence: number; // 0-100
  details?: string;
  threatLevel?: 'low' | 'medium' | 'high';
}

export interface AgentDetector {
  name: string;
  detect(content: string): Promise<DetectionResult>;
}
