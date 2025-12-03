# 👻 Trust Guardian - Kiroween Hackathon Edition

**The Resurrected Spam Filter** - An AI-powered content analysis platform with spectral UI effects, built for the Kiroween Hackathon.

## 🎃 Features

### 🔥 **GMAIL INBOX SCANNER** (NEW!)
**One-tap Gmail integration to hunt demons in your inbox!**

- **One-Click Google Sign-In**: Instant authentication with Gmail access
- **Automatic Email Import**: Fetches your 50 most recent emails
- **Real-Time Threat Detection**: Scans all emails for spam, scams, toxicity, and deepfakes
- **Visual Threat Indicators**: Horrifying red theme for dangerous emails
- **Batch Delete**: Select and delete multiple threatening emails at once
- **Smart Filtering**: View all, threats only, or safe emails
- **Instant Results**: See threat scores for spam, deepfake, toxicity, and scam
- **Safe Deletion**: Emails moved to trash (recoverable)

**How to Use:**
1. Click "SCAN GMAIL INBOX" button
2. Sign in with Google (one-time)
3. Grant Gmail permissions
4. Click "Scan for Evil"
5. Review threats and delete with one click!

### 1. **Modular AI Detection Agents**
- **Spam Detector**: Identifies spam using Hugging Face models
- **Deepfake Detector**: Detects synthetic/manipulated content
- **Toxicity Detector**: Analyzes harmful language using Perspective API
- **Scam Detector**: Identifies phishing and scam attempts

Each agent returns:
```typescript
{
  detected: boolean,
  confidence: 0-100,
  threatLevel: 'low' | 'medium' | 'high'
}
```

### 2. **Spectral UI Animations**
- 👻 Ghost sprites floating across the screen
- ✨ Vapor trails and particle effects
- 🌈 Dynamic threat glow (green → orange → red)
- 💫 Glitch effects on detection
- 🎨 Haunting visual themes

### 3. **Kiro Steering Configuration**
Real-time behavior control via `.kiro/steering/trust-guardian-config.md`:
- **Detection Strictness** (1-10): Controls AI sensitivity
- **Visual Haunting** (1-10): Animation intensity
- **Active Agents**: Enable/disable specific detectors
- **UI Theme**: day | night | haunted

### 4. **MCP Integration**
Model Context Protocol server for concurrent analysis:
- Analyze single content items
- Batch process multiple streams (emails, comments, reviews)
- Real-time threat detection

### 5. **Full-Stack Features**
- 🔐 **Google OAuth** via Supabase Auth
- 🏆 **Real-time Leaderboard** with badges
- 📊 **Analysis History Dashboard**
- 🔔 **Real-time Notifications**
- ⚙️ **Settings Page** with live config updates
- 💾 **Persistent Storage** in Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (already configured!)
- Google account for Gmail scanning
- API Keys (optional for enhanced detection)

### Installation (2 Minutes)

1. **Install dependencies**
```bash
npm install
```

2. **Set up Supabase database**
   - Go to: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/editor
   - Click "SQL Editor" → "New Query"
   - Copy all SQL from `supabase/migrations/20241115000001_trust_guardian_schema.sql`
   - Paste and click "Run"

3. **Configure Google OAuth for Gmail**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add redirect: `https://svqonczakasqqjmcqiru.supabase.co/auth/v1/callback`
   - Enable Gmail API
   - Add scopes: `gmail.readonly` and `gmail.modify`
   - Copy credentials to Supabase Dashboard → Auth → Providers → Google

   **Detailed guide**: See `GMAIL_SETUP.md`

4. **Run the app**
```bash
npm run dev
```

5. **Start scanning!**
   - Open http://localhost:5173
   - Click "SCAN GMAIL INBOX"
   - Sign in with Google
   - Watch the horror unfold! 👻

### Optional: Add AI API Keys
```env
# Add to .env for enhanced detection (app works without these)
VITE_HUGGING_FACE_API_KEY=your_key_here
VITE_PERSPECTIVE_API_KEY=your_key_here
VITE_REPLICATE_API_KEY=your_key_here
```

## 📦 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Add environment variables in Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add all variables from `.env`

### Supabase Setup
Your database is already configured at:
- URL: `https://svqonczakasqqjmcqiru.supabase.co`
- The migration file creates all necessary tables and RLS policies

## 🎮 Usage

### 🔥 Scanning Gmail Inbox (PRIMARY FEATURE)
1. Click **"SCAN GMAIL INBOX"** button (big red button)
2. Sign in with Google (one-time)
3. Grant Gmail permissions
4. Your emails load automatically
5. Click **"Scan for Evil"** to analyze all emails
6. Review threats (highlighted in horrifying red)
7. Select threatening emails
8. Click **"Delete"** to move them to trash
9. Use filters to view: All / Threats / Safe

**Pro Tips:**
- Click "Select All Threats" for quick cleanup
- Adjust detection strictness in Settings
- Emails go to trash (recoverable for 30 days)
- Scan regularly to keep inbox clean

### Analyzing Text Content
1. Click "Analyze Text" button
2. Select content type (email, comment, review, text)
3. Paste or drag content into the analyzer
4. View real-time threat analysis with spectral effects

### Adjusting Settings
1. Click "Settings" button
2. Adjust detection strictness (1-10)
3. Control visual haunting level (1-10)
4. Enable/disable specific AI agents
5. Changes apply immediately

### Viewing History
1. Sign in with Google
2. Click "History" button
3. View all past analyses with threat levels
4. See statistics and trends

## 🏗️ Architecture

```
src/
├── agents/              # AI detection modules
│   ├── spamDetector.ts
│   ├── deepfakeDetector.ts
│   ├── toxicityDetector.ts
│   └── scamDetector.ts
├── components/          # React components
│   ├── SpectralEffects.tsx
│   ├── AnalyzerWidget.tsx
│   ├── SettingsPage.tsx
│   ├── HistoryDashboard.tsx
│   └── NotificationCenter.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/            # API services
│   └── supabase.ts
├── lib/                 # Utilities
│   └── steeringConfig.ts
└── index.css            # Spectral animations

.kiro/
├── steering/            # Kiro steering docs
│   └── trust-guardian-config.md
└── settings/
    └── mcp.json         # MCP configuration

mcp-server/              # MCP server for concurrent analysis
└── analyzer-server.js
```

## 🎨 Spectral Effects

The app features haunting visual effects that respond to threat levels:

- **Green Glow**: Low risk (0-40% confidence)
- **Orange Glow**: Medium risk (41-70% confidence)
- **Red Glow**: High risk (71-100% confidence)

Effects intensity scales with the "Visual Haunting" setting (1-10).

## 🔧 Configuration

### Steering Config
Edit `.kiro/steering/trust-guardian-config.md` to change defaults:
```yaml
detection_strictness: 7    # 1-10
visual_haunting: 8         # 1-10
ui_theme: 'haunted'        # day | night | haunted
active_agents:
  spam_detector: true
  deepfake_detector: true
  toxicity_detector: true
  scam_detector: true
```

### MCP Server
The MCP server enables concurrent analysis:
```bash
node mcp-server/analyzer-server.js
```

## 🏆 Leaderboard Badges

- 👻 **Phantom Lord**: 1000+ threats detected
- 💀 **Specter Master**: 500+ threats detected
- 🎃 **Wraith Hunter**: 250+ threats detected
- ⚡ **Ghost Buster**: 100+ threats detected
- ✨ **Spirit Seeker**: 50+ threats detected
- 🌟 **Novice Spirit**: < 50 threats detected

## 🔗 Links

- **DeepGuard AI**: https://deepguard.ai
- **Supabase Dashboard**: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru

## 📝 License

MIT License - Built for Kiroween Hackathon 2024

## 🎃 Happy Haunting!

Protect the digital realm from threats beyond the grave. 👻
