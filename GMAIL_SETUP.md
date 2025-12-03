# 📧 Gmail Integration Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/auth/providers

2. **Enable Google Provider**
   - Find "Google" in the providers list
   - Toggle it to "Enabled"

3. **Get Google OAuth Credentials**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create a new project or select existing
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Trust Guardian"

4. **Add Authorized Redirect URIs**
   ```
   https://svqonczakasqqjmcqiru.supabase.co/auth/v1/callback
   http://localhost:5173/ (for local development)
   ```

5. **Enable Gmail API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Gmail API"
   - Click "Enable"

6. **Configure OAuth Consent Screen**
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - User Type: "External" (for testing) or "Internal" (for organization)
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Add test users (your email) if using External

7. **Copy Credentials to Supabase**
   - Copy Client ID and Client Secret from Google Console
   - Paste into Supabase Google Provider settings
   - Click "Save"

### Step 2: Test the Integration

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Click "SCAN GMAIL INBOX" button**
   - You'll be redirected to Google sign-in
   - Grant permissions for Gmail access
   - You'll be redirected back to the app

3. **Your emails will load automatically**
   - Click "Scan for Evil" to analyze all emails
   - Threats will be highlighted in red
   - Select and delete threatening emails

## Features

### 🔍 Email Scanning
- Scans up to 50 most recent emails
- Analyzes for spam, scams, toxicity, and deepfakes
- Real-time threat detection with confidence scores
- Visual threat indicators (green/orange/red)

### 🗑️ Email Management
- One-click delete individual emails
- Batch delete multiple emails
- "Select All Threats" for quick cleanup
- Emails moved to trash (recoverable)

### 📊 Filtering
- View all emails
- Filter by threats only
- Filter by safe emails only
- Real-time threat count

### 🎨 Horrifying UI
- Blood-red theme for threats
- Creepy shake animations
- Demon eyes effects
- Possessed text for dangerous emails
- Nightmare pulse effects

## Security & Privacy

### What We Access
- **Read**: Subject, sender, date, snippet, body (first 1000 chars)
- **Modify**: Move emails to trash, mark as spam

### What We DON'T Do
- ❌ Store email content on our servers
- ❌ Share your data with third parties
- ❌ Permanently delete emails (they go to trash)
- ❌ Send emails on your behalf

### Data Storage
- Only analysis results are stored (scores, threat levels)
- Email content is analyzed in real-time and discarded
- You can delete your analysis history anytime

## Troubleshooting

### "Failed to fetch emails"
- Check if Gmail API is enabled in Google Cloud Console
- Verify OAuth credentials are correct in Supabase
- Try refreshing the page and reconnecting

### "Not authenticated with Gmail"
- Click "Connect Gmail & Unleash the Scan" again
- Make sure you granted all permissions
- Check browser console for errors

### "Access blocked: This app's request is invalid"
- Make sure redirect URIs match exactly in Google Console
- Verify Gmail API is enabled
- Check OAuth consent screen is configured

### Emails not loading
- Check your internet connection
- Verify you have emails in your inbox
- Try reducing maxResults in code (default: 50)

## Advanced Configuration

### Adjust Email Fetch Limit
Edit `src/services/gmailService.ts`:
```typescript
async fetchEmails(maxResults = 50) // Change 50 to desired number
```

### Add More Gmail Scopes
Edit `src/services/gmailService.ts`:
```typescript
scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send'
```

### Customize Threat Detection
Adjust detection strictness in Settings:
- 1-4: Lenient (fewer false positives)
- 5-7: Balanced (recommended)
- 8-10: Strict (maximum sensitivity)

## Production Deployment

### Vercel Deployment
1. Add your production URL to Google OAuth redirect URIs:
   ```
   https://your-app.vercel.app/
   ```

2. Update Supabase Site URL:
   - Go to: https://supabase.com/dashboard/project/svqonczakasqqjmcqiru/auth/url-configuration
   - Set Site URL to: `https://your-app.vercel.app`

3. Deploy:
   ```bash
   vercel --prod
   ```

### OAuth Verification (Optional)
For public use, submit your app for Google OAuth verification:
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click "Publish App"
3. Submit for verification (takes 1-2 weeks)
4. Until verified, users will see "This app isn't verified" warning

## API Rate Limits

### Gmail API (Free Tier)
- **Quota**: 1 billion quota units/day
- **Read**: 5 units per request
- **Modify**: 10 units per request
- **Typical usage**: ~500 units per scan (50 emails)

### Staying Within Limits
- Scan emails once per session
- Use filters to reduce API calls
- Cache results locally
- Implement exponential backoff for errors

## Best Practices

1. **Scan Regularly**: Check your inbox daily for new threats
2. **Review Before Deleting**: Always review flagged emails before deletion
3. **Adjust Strictness**: Fine-tune based on your false positive rate
4. **Use Filters**: Focus on threats to save time
5. **Batch Operations**: Select multiple emails for faster cleanup

## Support

### Common Issues
- **Slow scanning**: Normal for 50+ emails, each analyzed by 4 AI models
- **False positives**: Adjust detection strictness in settings
- **Missing emails**: Gmail API returns most recent 50 by default

### Getting Help
1. Check browser console for errors
2. Review Supabase logs
3. Verify Google Cloud Console settings
4. Test with a fresh OAuth token

## Privacy Notice

Trust Guardian is designed with privacy in mind:
- Email content is processed locally in your browser
- Only threat scores are stored in the database
- You can delete all your data anytime
- No email content is transmitted to our servers
- OAuth tokens are managed securely by Supabase

---

**Ready to hunt demons in your inbox!** 👻🔥
