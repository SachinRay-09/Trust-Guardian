# Gmail Scanner Troubleshooting Guide

## Error: "Insufficient Authentication Scopes" (403)

### What This Means
Your Gmail access token doesn't have the required permissions to read and modify emails. This typically happens when:

1. **First time using the app** - You haven't granted permissions yet
2. **Permissions expired** - Your OAuth token has expired (usually after 7 days)
3. **Scopes changed** - The app was updated to require additional permissions
4. **Token revoked** - You manually revoked access in your Google Account settings

---

## ✅ Quick Fix (Takes 30 seconds)

### Step 1: Sign Out
1. If you're logged in, sign out of Trust Guardian
2. This clears your old, invalid token

### Step 2: Reconnect Gmail
1. Click the **"SCAN GMAIL INBOX"** button
2. Click **"Connect Gmail & Unleash the Scan"**
3. You'll be redirected to Google's OAuth consent screen

### Step 3: Grant Permissions
When Google asks for permissions, you'll see:
- ✅ **Read your email messages** (gmail.readonly)
- ✅ **Manage your email** (gmail.modify)

**Important**: You MUST click **"Allow"** for both permissions!

### Step 4: Done!
You'll be redirected back to Trust Guardian and can now scan your emails.

---

## 🔍 Detailed Explanation

### Required Gmail Scopes

Trust Guardian needs these permissions:

#### 1. `gmail.readonly`
**Why**: To read your email messages and analyze them for threats
**What it does**: 
- Fetches email list from your inbox
- Reads email content (subject, body, sender)
- Reads email metadata (date, labels)

#### 2. `gmail.modify`
**Why**: To move spam/threats to trash or mark as spam
**What it does**:
- Moves emails to trash
- Marks emails as spam
- Modifies email labels

### What Trust Guardian Does NOT Do
- ❌ Send emails on your behalf
- ❌ Delete emails permanently (only moves to trash)
- ❌ Access emails from other accounts
- ❌ Share your data with third parties
- ❌ Store your emails on our servers

---

## 🛠️ Advanced Troubleshooting

### Issue: "Connect Gmail" button doesn't work

**Solution 1: Check Browser Settings**
- Ensure pop-ups are allowed for this site
- Disable ad blockers temporarily
- Try in incognito/private mode

**Solution 2: Clear Browser Cache**
```
1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "Cookies and other site data"
3. Click "Clear data"
4. Refresh the page
```

**Solution 3: Try Different Browser**
- Chrome (recommended)
- Firefox
- Edge
- Safari

### Issue: Permissions granted but still getting 403 error

**Solution: Revoke and Re-grant Access**

1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "Trust Guardian" in the list
3. Click "Remove Access"
4. Return to Trust Guardian
5. Click "Connect Gmail" again
6. Grant permissions again

### Issue: OAuth redirect not working

**Solution: Check Redirect URI**

The redirect URI must match exactly:
- Development: `http://localhost:5173`
- Production: Your deployed URL

If you're getting redirect errors:
1. Check your `.env` file has correct URLs
2. Verify Google Cloud Console OAuth settings
3. Ensure redirect URI is whitelisted

---

## 🔐 Security & Privacy

### Is This Safe?
**Yes!** Trust Guardian uses Google's official OAuth 2.0 protocol:

- ✅ **Secure**: All communication is encrypted (HTTPS)
- ✅ **Standard**: Uses Google's official Gmail API
- ✅ **Revocable**: You can revoke access anytime
- ✅ **Limited**: Only requests necessary permissions
- ✅ **Transparent**: Open source code you can review

### How to Revoke Access
If you want to stop Trust Guardian from accessing your Gmail:

1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "Trust Guardian"
3. Click "Remove Access"
4. Done! Access is immediately revoked

---

## 📝 Common Questions

### Q: Why do permissions expire?
**A**: Google OAuth tokens typically expire after 7 days for security. This is normal and protects your account.

### Q: Can Trust Guardian read all my emails?
**A**: Yes, but it only reads emails in your INBOX and only when you click "Scan". It doesn't continuously monitor your email.

### Q: Does Trust Guardian store my emails?
**A**: No! Emails are analyzed in your browser and only threat scores are saved to the database (not the email content).

### Q: What happens to deleted emails?
**A**: They're moved to your Gmail Trash folder. You can restore them within 30 days.

### Q: Can I use this with multiple Gmail accounts?
**A**: Yes! Just sign out and sign in with a different Google account.

---

## 🚨 Still Having Issues?

### Check These:

1. **Google Account Settings**
   - Ensure 2FA is not blocking OAuth
   - Check if "Less secure app access" is relevant (it's not for OAuth)
   - Verify your account is not restricted

2. **Browser Console**
   - Press F12 to open Developer Tools
   - Check Console tab for errors
   - Look for network errors in Network tab

3. **Environment Variables**
   - Verify `.env` file exists
   - Check `VITE_SUPABASE_URL` is set
   - Check `VITE_SUPABASE_ANON_KEY` is set

4. **Supabase Configuration**
   - Verify Google OAuth is enabled in Supabase dashboard
   - Check redirect URLs are configured
   - Ensure Google Client ID and Secret are set

---

## 📧 Error Messages Explained

### "Not authenticated with Gmail"
**Meaning**: No access token found
**Fix**: Click "Connect Gmail" button

### "Failed to fetch email list: 403"
**Meaning**: Insufficient permissions
**Fix**: Reconnect Gmail with updated permissions

### "Failed to fetch email list: 401"
**Meaning**: Token expired or invalid
**Fix**: Sign out and reconnect

### "Failed to fetch email list: 429"
**Meaning**: Too many requests (rate limit)
**Fix**: Wait a few minutes and try again

### "Failed to fetch email list: 500"
**Meaning**: Gmail API server error
**Fix**: Try again later (Google's issue, not yours)

---

## ✅ Success Checklist

Before reporting an issue, verify:

- [ ] You clicked "Allow" on Google's permission screen
- [ ] You granted BOTH gmail.readonly AND gmail.modify scopes
- [ ] Your browser allows pop-ups for this site
- [ ] You're using a modern browser (Chrome, Firefox, Edge, Safari)
- [ ] You've tried signing out and reconnecting
- [ ] You've cleared browser cache
- [ ] You've checked Google Account permissions page

---

## 🎯 Quick Reference

### To Reconnect Gmail:
1. Sign out (if logged in)
2. Click "SCAN GMAIL INBOX"
3. Click "Connect Gmail & Unleash the Scan"
4. Allow both permissions
5. Done!

### To Revoke Access:
1. Visit [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "Trust Guardian"
3. Click "Remove Access"
4. Done!

---

**Need More Help?**
Check the main [GMAIL_SETUP.md](./GMAIL_SETUP.md) for initial setup instructions.

**Built for Kiroween Hackathon 2024** 🎃👻
