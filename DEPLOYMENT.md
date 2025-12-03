# 🚀 Deployment Guide - Trust Guardian

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Vercel account created (optional, for deployment)
- [ ] API keys obtained (optional, for enhanced detection)

## Step-by-Step Deployment

### 1. Database Setup

Your Supabase project is already configured:
- **URL**: `https://svqonczakasqqjmcqiru.supabase.co`
- **Anon Key**: Already in `.env` file

#### Run Database Migration

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/svqonczakasqqjmcqiru
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/20241115000001_trust_guardian_schema.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. Verify success message

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref svqonczakasqqjmcqiru

# Push migration
supabase db push
```

### 2. Enable Google OAuth

1. Go to https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/auth/providers
2. Find "Google" in the providers list
3. Toggle it to "Enabled"
4. Add your OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
5. Add authorized redirect URLs:
   - `https://svqonczakasqqjmcqiru.supabase.co/auth/v1/callback`
   - `http://localhost:5173/` (for local development)
6. Click "Save"

#### Getting Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted
6. Application type: "Web application"
7. Add authorized redirect URIs:
   - `https://svqonczakasqqjmcqiru.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret to Supabase

### 3. API Keys (Optional but Recommended)

Add these to your `.env` file for enhanced AI detection:

#### Hugging Face API Key (Free)
1. Go to https://huggingface.co/settings/tokens
2. Create new token with "Read" access
3. Add to `.env`: `VITE_HUGGING_FACE_API_KEY=hf_...`

#### Google Perspective API Key (Free)
1. Go to https://console.cloud.google.com/
2. Enable "Perspective Comment Analyzer API"
3. Create API key in "Credentials"
4. Add to `.env`: `VITE_PERSPECTIVE_API_KEY=AIza...`

#### Replicate API Key (Optional)
1. Go to https://replicate.com/account/api-tokens
2. Create new token
3. Add to `.env`: `VITE_REPLICATE_API_KEY=r8_...`

### 4. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? trust-guardian
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://svqonczakasqqjmcqiru.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_HUGGING_FACE_API_KEY=hf_... (optional)
   VITE_PERSPECTIVE_API_KEY=AIza... (optional)
   VITE_REPLICATE_API_KEY=r8_... (optional)
   ```
5. Click "Deploy"

### 6. Post-Deployment Configuration

#### Update OAuth Redirect URLs

After deployment, add your Vercel URL to Google OAuth:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   - `https://your-app.vercel.app/`
4. Save

#### Update Supabase Site URL

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set Site URL to your Vercel URL: `https://your-app.vercel.app`
3. Add to Redirect URLs: `https://your-app.vercel.app/**`

### 7. Verify Deployment

Test these features:
- [ ] App loads successfully
- [ ] Google Sign In works
- [ ] Content analysis works (with or without API keys)
- [ ] Leaderboard displays
- [ ] Settings save correctly
- [ ] History dashboard shows data
- [ ] Notifications appear
- [ ] Spectral effects animate

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and anon key in `.env`
- Check if migration ran successfully
- Verify RLS policies are enabled

### OAuth Not Working
- Check redirect URLs match exactly
- Verify Google OAuth credentials
- Check browser console for errors

### API Detection Not Working
- App works without API keys (uses fallback detection)
- Verify API keys are correct
- Check API rate limits

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Performance Optimization

### Enable Caching
Vercel automatically caches static assets. No configuration needed.

### Database Indexes
Already included in migration file for optimal query performance.

### API Rate Limiting
- Hugging Face: 1000 requests/month (free tier)
- Perspective API: 1 QPS (free tier)
- Consider implementing client-side caching for repeated content

## Monitoring

### Vercel Analytics
Enable in Vercel Dashboard → Analytics

### Supabase Logs
View in Supabase Dashboard → Logs

### Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/react
```

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] RLS policies enabled on all tables
- [ ] OAuth redirect URLs restricted
- [ ] API keys have minimal required permissions
- [ ] HTTPS enabled (automatic on Vercel)

## Support

For issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs
4. Review this guide

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Invite users to test
3. Monitor performance and errors
4. Gather feedback
5. Iterate and improve

🎃 Happy Haunting!
