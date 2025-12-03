/*
  # Trust Guardian Schema - The Resurrected Spam Filter

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier
      - `username` (text, unique) - Display name
      - `exorcist_score` (integer) - Points earned from cleaning threats
      - `ghost_badge_level` (text) - Badge tier based on score
      - `created_at` (timestamptz) - Account creation time
      
    - `messages`
      - `id` (uuid, primary key) - Message identifier
      - `content` (text) - The message content to analyze
      - `channel` (text) - Source channel (email, reviews, comments)
      - `author` (text) - Original author/sender
      - `is_flagged` (boolean) - Whether message is flagged as threat
      - `haunt_level` (integer) - Severity level (1-5)
      - `analyzed_at` (timestamptz) - When analysis was performed
      - `created_at` (timestamptz) - When message was received
      
    - `detections`
      - `id` (uuid, primary key) - Detection identifier
      - `message_id` (uuid, foreign key) - Reference to analyzed message
      - `detector_type` (text) - Type of detector (spam, scam, deepfake, toxicity)
      - `confidence_score` (numeric) - Confidence level (0-1)
      - `threat_details` (jsonb) - Additional threat information
      - `created_at` (timestamptz) - Detection timestamp
      
    - `user_actions`
      - `id` (uuid, primary key) - Action identifier
      - `user_id` (uuid, foreign key) - User who took action
      - `message_id` (uuid, foreign key) - Message acted upon
      - `action_type` (text) - Action taken (dismiss, confirm, report)
      - `points_earned` (integer) - Points awarded for action
      - `created_at` (timestamptz) - Action timestamp

  2. Security
    - Enable RLS on all tables
    - Public can read messages and detections (for live feed)
    - Authenticated users can create messages and actions
    - Users can only update their own records
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  exorcist_score integer DEFAULT 0,
  ghost_badge_level text DEFAULT 'Novice Spirit',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'reviews', 'comments', 'manual')),
  author text NOT NULL DEFAULT 'Anonymous',
  is_flagged boolean DEFAULT false,
  haunt_level integer DEFAULT 0 CHECK (haunt_level >= 0 AND haunt_level <= 5),
  analyzed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  detector_type text NOT NULL CHECK (detector_type IN ('spam', 'scam', 'deepfake', 'toxicity')),
  confidence_score numeric(3, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  threat_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('dismiss', 'confirm', 'report')),
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view users leaderboard"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view detections"
  ON detections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert detections"
  ON detections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view user actions"
  ON user_actions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert actions"
  ON user_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_flagged ON messages(is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_detections_message_id ON detections(message_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(exorcist_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
