# ⚡ Quick Start Guide

Get Trust Guardian running in 5 minutes!

## 🚀 Fastest Path to Running

### 1. Install Dependencies (30 seconds)
```bash
npm install
```

### 2. Database Setup (2 minutes)

**Go to Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/editor
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Open `supabase/migrations/20241115000001_trust_guardian_schema.sql`
5. Copy ALL the SQL code
6. Paste into Supabase SQL Editor
7. Click "Run" (bottom right)
8. Wait for "Success" message

### 3. Enable Google Sign In (2 minutes)

**In Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/auth/providers
2. Find "Google" and toggle it ON
3. For quick testing, use these temporary settings:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`
4. Click "Save"

**Get Google OAuth Credentials (if needed):**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect: `https://svqonczakasqqjmcqiru.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### 4. Start Development Server (10 seconds)
```bash
npm run dev
```

### 5. Open Browser
```
http://localhost:5173
```

## ✅ You're Done!

The app will work immediately with:
- ✅ Content analysis (fallback detection mode)
- ✅ Spectral UI effects
- ✅ Settings and configuration
- ✅ All features except Google Sign In

## 🔑 Optional: Add API Keys for Enhanced Detection

Edit `.env` file and add:

```env
# Already configured:
VITE_SUPABASE_URL=https://svqonczakasqqjmcqiru.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add these for better AI detection (optional):
VITE_HUGGING_FACE_API_KEY=hf_your_key_here
VITE_PERSPECTIVE_API_KEY=AIza_your_key_here
VITE_REPLICATE_API_KEY=r8_your_key_here
```

**Get API Keys:**
- Hugging Face: https://huggingface.co/settings/tokens (free)
- Perspective: https://console.cloud.google.com/ (free)
- Replicate: https://replicate.com/account/api-tokens (optional)

## 🧪 Test the App

1. **Analyze Content:**
   - Click "Analyze Content" button
   - Paste some text
   - See threat analysis with spectral effects!

2. **Adjust Settings:**
   - Click "Settings" button
   - Move "Detection Strictness" slider
   - Move "Visual Haunting" slider
   - See effects change in real-time!

3. **Try Different Content:**
   - Spam: "CONGRATULATIONS! You won $1,000,000! Click here NOW!"
   - Toxic: "You're an idiot and I hate you!"
   - Scam: "Your account has been suspended. Verify immediately or lose access."

## 🎨 Visual Effects to Look For

- 👻 Ghost sprites floating around
- ✨ Vapor trails
- 🌈 Color-changing glows (green → orange → red)
- 💫 Particle bursts on detection
- 🎭 Glitch effects on high threats

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

**Database errors?**
- Make sure you ran the SQL migration
- Check Supabase project is active

**Can't sign in?**
- Google OAuth setup is optional for testing
- All other features work without sign in

**No animations?**
- Check "Visual Haunting" setting is > 1
- Try refreshing the page

## 📱 What Works Without Sign In

- ✅ Content analysis
- ✅ Spectral effects
- ✅ Settings (saved locally)
- ✅ All UI features
- ❌ History dashboard (requires sign in)
- ❌ Leaderboard (requires sign in)
- ❌ Notifications (requires sign in)

## 🚀 Deploy to Production

When ready to deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then deploy to production
vercel --prod
```

See `DEPLOYMENT.md` for detailed deployment guide.

## 🎃 Have Fun!

You're now protecting the digital realm from threats beyond the grave! 👻

**Need help?** Check:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Deployment guide
- `HACKATHON_SUBMISSION.md` - Feature overview
