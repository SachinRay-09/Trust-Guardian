export interface SteeringConfig {
  detection_strictness: number; // 1-10
  visual_haunting: number; // 1-10
  active_agents: {
    spam_detector: boolean;
    deepfake_detector: boolean;
    toxicity_detector: boolean;
    scam_detector: boolean;
  };
  ui_theme: 'day' | 'night' | 'haunted';
}

const DEFAULT_CONFIG: SteeringConfig = {
  detection_strictness: 7,
  visual_haunting: 8,
  active_agents: {
    spam_detector: true,
    deepfake_detector: true,
    toxicity_detector: true,
    scam_detector: true,
  },
  ui_theme: 'haunted',
};

export class SteeringConfigManager {
  private static STORAGE_KEY = 'trust_guardian_steering_config';

  static getConfig(): SteeringConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load steering config:', error);
    }
    return DEFAULT_CONFIG;
  }

  static setConfig(config: Partial<SteeringConfig>): void {
    try {
      const current = this.getConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('steering-config-changed', { detail: updated }));
    } catch (error) {
      console.error('Failed to save steering config:', error);
    }
  }

  static getStrictnessMultiplier(): number {
    const config = this.getConfig();
    return config.detection_strictness / 7;
  }

  static getHauntingMultiplier(): number {
    const config = this.getConfig();
    return config.visual_haunting / 5;
  }

  static isAgentActive(agent: keyof SteeringConfig['active_agents']): boolean {
    const config = this.getConfig();
    return config.active_agents[agent];
  }
}
