export interface User {
  id: string;
  username: string;
  exorcist_score: number;
  ghost_badge_level: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  channel: 'email' | 'reviews' | 'comments' | 'manual';
  author: string;
  is_flagged: boolean;
  haunt_level: number;
  analyzed_at: string | null;
  created_at: string;
}

export interface Detection {
  id: string;
  message_id: string;
  detector_type: 'spam' | 'scam' | 'deepfake' | 'toxicity';
  confidence_score: number;
  threat_details: Record<string, unknown>;
  created_at: string;
}

export interface UserAction {
  id: string;
  user_id: string;
  message_id: string;
  action_type: 'dismiss' | 'confirm' | 'report';
  points_earned: number;
  created_at: string;
}

export interface MessageWithDetections extends Message {
  detections: Detection[];
}

export type ThemeMode = 'day' | 'night' | 'haunted';
