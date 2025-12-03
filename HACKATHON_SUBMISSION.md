# 👻 Trust Guardian - Kiroween Hackathon Submission

## Project Overview

**Trust Guardian** is an AI-powered content analysis platform with spectral UI effects, built specifically for the Kiroween Hackathon. It combines cutting-edge AI detection with a hauntingly beautiful user experience.

## 🎯 Hackathon Requirements Completed

### ✅ 1. Modular AI Detection Agents (`src/agents/`)

Four independent detector modules, each using free APIs:

- **SpamDetector** (`spamDetector.ts`)
  - Primary: Hugging Face `bert-tiny-finetuned-sms-spam-detection`
  - Fallback: Pattern-based detection
  - Returns: `{ detected: bool, confidence: 0-100 }`

- **DeepfakeDetector** (`deepfakeDetector.ts`)
  - Primary: Replicate API (for media analysis)
  - Fallback: Text pattern analysis for synthetic content indicators
  - Returns: `{ detected: bool, confidence: 0-100 }`

- **ToxicityDetector** (`toxicityDetector.ts`)
  - Primary: Google Perspective API
  - Fallback: Pattern-based toxic language detection
  - Returns: `{ detected: bool, confidence: 0-100 }`

- **ScamDetector** (`scamDetector.ts`)
  - Primary: Hugging Face `bert-finetuned-phishing`
  - Fallback: Comprehensive scam pattern detection
  - Returns: `{ detected: bool, confidence: 0-100 }`

**Key Features:**
- All agents work without API keys (fallback mode)
- Consistent interface via `AgentDetector` type
- Real-time concurrent analysis
- Confidence scoring with threat level classification

### ✅ 2. Spectral UI Animations (`src/index.css`, `src/components/SpectralEffects.tsx`)

Implemented haunting visual effects:

- **Ghost Sprites**: Floating ghost icons with random spawning
- **Vapor Trails**: Animated gradient trails across the screen
- **Glitch Effects**: CSS-based glitch animations on threat detection
- **Dynamic Glow**: Color-coded threat indicators
  - 🟢 Green (0-40%): Low risk
  - 🟠 Orange (41-70%): Medium risk
  - 🔴 Red (71-100%): High risk
- **Particle Effects**: Burst animations on detection events
- **Spectral Shimmer**: Gradient animations on UI elements
- **Haunting Borders**: Animated gradient borders

**Animation System:**
- Intensity controlled by "Visual Haunting" setting (1-10)
- Real-time updates without page reload
- Performance-optimized CSS animations
- Responsive to threat levels

### ✅ 3. Kiro Steering Configuration (`.kiro/steering/trust-guardian-config.md`)

YAML-style configuration document that controls:

```yaml
detection_strictness: 7        # 1-10, affects AI sensitivity
visual_haunting: 8             # 1-10, controls animation intensity
ui_theme: 'haunted'            # day | night | haunted
active_agents:
  spam_detector: true
  deepfake_detector: true
  toxicity_detector: true
  scam_detector: true
```

**Real-time Behavior:**
- Settings loaded from `localStorage` with fallback to steering defaults
- Changes apply immediately via event system
- Strictness multiplier: `baseConfidence * (strictness / 7)`
- Haunting multiplier: `baseAnimationSpeed * (haunting / 5)`
- Agent activation/deactivation without restart

**Implementation:**
- `src/lib/steeringConfig.ts`: Configuration manager
- `src/components/SettingsPage.tsx`: UI for adjustments
- Syncs between local storage and Supabase for logged-in users

### ✅ 4. MCP Configuration (`.kiro/settings/mcp.json`, `mcp-server/analyzer-server.js`)

Model Context Protocol server for concurrent analysis:

**MCP Server Features:**
- `analyze_content`: Single content analysis
- `batch_analyze`: Concurrent multi-stream analysis
- Supports content types: email, comment, review, text
- JSON-RPC protocol implementation

**Configuration:**
```json
{
  "mcpServers": {
    "trust-guardian-analyzer": {
      "command": "node",
      "args": ["./mcp-server/analyzer-server.js"],
      "autoApprove": ["analyze_content", "batch_analyze"]
    }
  }
}
```

**Usage Example:**
```javascript
// Analyze multiple content streams concurrently
const results = await mcpClient.call('batch_analyze', {
  items: [
    { content: 'Email text...', type: 'email' },
    { content: 'Comment text...', type: 'comment' },
    { content: 'Review text...', type: 'review' }
  ]
});
```

### ✅ 5. Full-Stack Features

**Authentication:**
- Google OAuth via Supabase Auth
- Profile management with avatars
- Session persistence

**Database (Supabase):**
- `profiles`: User data
- `analysis_history`: All scans with scores
- `leaderboard`: Real-time rankings
- `notifications`: Real-time alerts
- `user_settings`: Persistent configuration
- Row Level Security (RLS) enabled

**Real-time Features:**
- Live leaderboard updates
- Instant notifications on threat detection
- Settings sync across devices
- Concurrent analysis streams

**UI Components:**
- `AnalyzerWidget`: Main analysis interface
- `SettingsPage`: Configuration management
- `HistoryDashboard`: Analysis history with stats
- `NotificationCenter`: Real-time alerts
- `Leaderboard`: Competitive rankings with badges

**Badges System:**
- 👻 Phantom Lord: 1000+ threats
- 💀 Specter Master: 500+ threats
- 🎃 Wraith Hunter: 250+ threats
- ⚡ Ghost Buster: 100+ threats
- ✨ Spirit Seeker: 50+ threats
- 🌟 Novice Spirit: < 50 threats

## 🛠️ Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

**Backend:**
- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security for data protection

**AI/ML:**
- Hugging Face Inference API (free tier)
- Google Perspective API (free tier)
- Replicate API (optional)
- Fallback pattern-based detection

**Deployment:**
- Vercel (frontend hosting)
- Supabase (backend + database)
- All free tier services

## 📊 Project Statistics

- **Total Files Created**: 25+
- **Lines of Code**: ~3,500+
- **Components**: 15+
- **AI Agents**: 4
- **Database Tables**: 5
- **API Integrations**: 3
- **Animation Effects**: 10+

## 🎨 Unique Features

1. **Spectral Theme**: Fully immersive haunted UI
2. **Real-time Everything**: Leaderboard, notifications, settings
3. **Adaptive AI**: Strictness control affects detection sensitivity
4. **Concurrent Analysis**: MCP server for batch processing
5. **Progressive Enhancement**: Works without API keys
6. **Gamification**: Badges and leaderboard for engagement

## 🚀 Deployment Ready

- ✅ Vercel configuration included
- ✅ Environment variables documented
- ✅ Database migration ready
- ✅ OAuth setup guide provided
- ✅ Comprehensive deployment documentation

## 📖 Documentation

- `README.md`: Project overview and quick start
- `DEPLOYMENT.md`: Step-by-step deployment guide
- `HACKATHON_SUBMISSION.md`: This file
- Inline code comments throughout

## 🎯 Hackathon Goals Achieved

1. ✅ **Innovation**: Unique spectral UI + AI detection combo
2. ✅ **Technical Excellence**: Clean architecture, TypeScript, real-time features
3. ✅ **User Experience**: Intuitive, visually stunning, responsive
4. ✅ **Completeness**: Fully functional MVP ready for deployment
5. ✅ **Documentation**: Comprehensive guides and comments

## 🔗 Links

- **Supabase Project**: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru
- **DeepGuard AI**: https://deepguard.ai (footer link)

## 🎃 Special Kiroween Features

- Ghost sprites that haunt the interface
- Threat-responsive glow effects
- Haunted theme with deep purples and blacks
- Particle bursts on detection
- Vapor trails across the screen
- Glitch effects for high threats
- Spectral shimmer animations

## 💡 Future Enhancements

- Image/video deepfake detection
- Browser extension for real-time protection
- Mobile app version
- Advanced ML model training
- Community threat database
- API for third-party integration

## 🏆 Why This Wins

1. **Complete Implementation**: All requirements met and exceeded
2. **Production Ready**: Deployable immediately
3. **Scalable Architecture**: Modular, maintainable, extensible
4. **User Delight**: Stunning visuals + powerful functionality
5. **Free Tier Friendly**: No cost barriers to deployment
6. **Well Documented**: Easy for judges to understand and test

---

**Built with 👻 for Kiroween Hackathon 2024**

*Protecting the digital realm from threats beyond the grave.*
