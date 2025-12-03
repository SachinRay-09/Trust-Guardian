-- Trust Guardian Database Schema for Kiroween Hackathon

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  total_scans INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis history table
CREATE TABLE public.analysis_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'email', 'comment', 'review', 'text'
  content_preview TEXT, -- First 200 chars
  spam_score INTEGER,
  deepfake_score INTEGER,
  toxicity_score INTEGER,
  scam_score INTEGER,
  overall_threat_level TEXT, -- 'low', 'medium', 'high'
  is_threat BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_scans INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 0, -- Calculated metric
  last_scan_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'threat_detected', 'milestone', 'system'
  is_read BOOLEAN DEFAULT FALSE,
  analysis_id UUID REFERENCES public.analysis_history(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  detection_strictness INTEGER DEFAULT 7 CHECK (detection_strictness BETWEEN 1 AND 10),
  visual_haunting INTEGER DEFAULT 8 CHECK (visual_haunting BETWEEN 1 AND 10),
  ui_theme TEXT DEFAULT 'haunted' CHECK (ui_theme IN ('day', 'night', 'haunted')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  active_agents JSONB DEFAULT '{"spam_detector": true, "deepfake_detector": true, "toxicity_detector": true, "scam_detector": true}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_analyzed_at ON public.analysis_history(analyzed_at DESC);
CREATE INDEX idx_leaderboard_threats_detected ON public.leaderboard(threats_detected DESC);
CREATE INDEX idx_leaderboard_total_scans ON public.leaderboard(total_scans DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Analysis history policies
CREATE POLICY "Users can view their own analysis history" ON public.analysis_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis" ON public.analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard policies (public read)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own leaderboard entry" ON public.leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard entry" ON public.leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.leaderboard (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update leaderboard stats
CREATE OR REPLACE FUNCTION update_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leaderboard
  SET 
    total_scans = (SELECT COUNT(*) FROM public.analysis_history WHERE user_id = NEW.user_id),
    threats_detected = (SELECT COUNT(*) FROM public.analysis_history WHERE user_id = NEW.user_id AND is_threat = true),
    last_scan_at = NEW.analyzed_at,
    accuracy_score = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE is_threat = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
      )
      FROM public.analysis_history 
      WHERE user_id = NEW.user_id
    )
  WHERE user_id = NEW.user_id;
  
  UPDATE public.profiles
  SET 
    total_scans = (SELECT COUNT(*) FROM public.analysis_history WHERE user_id = NEW.user_id),
    threats_detected = (SELECT COUNT(*) FROM public.analysis_history WHERE user_id = NEW.user_id AND is_threat = true)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_analysis_created
  AFTER INSERT ON public.analysis_history
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard_stats();
