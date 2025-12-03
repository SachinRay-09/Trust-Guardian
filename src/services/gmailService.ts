/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  isSpam: boolean;
  isThreat: boolean;
  spamScore: number;
  deepfakeScore: number;
  toxicityScore: number;
  scamScore: number;
  overallThreatLevel: 'low' | 'medium' | 'high';
}

export class GmailService {
  private accessToken: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔍 [AUTH DEBUG] Current session:', session ? 'EXISTS' : 'NULL');
      console.log('🔍 [AUTH DEBUG] Provider token:', session?.provider_token ? 'EXISTS' : 'NULL');
      
      if (!session?.provider_token) {
        // Initiate OAuth with Gmail scope - FIXED: Explicit scopes
        console.log('🔐 [AUTH] Initiating OAuth with Gmail scopes...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        
        if (error) {
          console.error('❌ [AUTH ERROR]', error);
          throw error;
        }
        return false; // Will redirect
      }

      this.accessToken = session.provider_token;
      console.log('✅ [AUTH] Access token set successfully');
      return true;
    } catch (error) {
      console.error('❌ [AUTH FAILED]', error);
      return false;
    }
  }

  async fetchEmails(maxResults = 50): Promise<GmailMessage[]> {
    if (!this.accessToken) {
      console.error('❌ [FETCH] No access token available');
      throw new Error('Not authenticated with Gmail');
    }

    try {
      console.log('📧 [FETCH] Fetching email list...');
      
      // FIXED: Use labelIds parameter with uppercase INBOX
      const listResponse = await fetch(
        `${GMAIL_API_BASE}/messages?maxResults=${maxResults}&labelIds=INBOX`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📧 [FETCH] Response status:', listResponse.status, listResponse.statusText);

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('❌ [FETCH ERROR] Response:', errorText);
        
        // Check if it's a permission error
        if (listResponse.status === 403) {
          // Clear the invalid token and force re-authentication
          this.accessToken = null;
          await supabase.auth.signOut();
          throw new Error('PERMISSION_ERROR: Your Gmail permissions have expired or are insufficient. Please reconnect your Gmail account with the "Connect Gmail" button.');
        }
        
        throw new Error(`Failed to fetch email list: ${listResponse.status} ${errorText}`);
      }

      const listData = await listResponse.json();
      console.log('📧 [FETCH] API Response:', JSON.stringify(listData, null, 2));
      console.log('📧 [FETCH] Messages found:', listData.messages?.length || 0);

      if (!listData.messages || listData.messages.length === 0) {
        console.warn('⚠️ [FETCH] No messages returned from Gmail API');
        return [];
      }

      const messages: GmailMessage[] = [];

      // Fetch full message details in parallel (limit to 10 at a time to avoid rate limits)
      const batchSize = 10;
      for (let i = 0; i < listData.messages.length; i += batchSize) {
        const batch = listData.messages.slice(i, i + batchSize);
        console.log(`📧 [FETCH] Processing batch ${i / batchSize + 1}...`);
        
        const messagePromises = batch.map(async (msg: any) => {
          try {
            const response = await fetch(
              `${GMAIL_API_BASE}/messages/${msg.id}?format=full`,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!response.ok) {
              console.error(`❌ [FETCH] Failed to fetch message ${msg.id}:`, response.status);
              return null;
            }

            const data = await response.json();
            return this.parseGmailMessage(data);
          } catch (error) {
            console.error(`❌ [FETCH] Error fetching message ${msg.id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(messagePromises);
        messages.push(...results.filter((m): m is GmailMessage => m !== null));
      }

      console.log('✅ [FETCH] Successfully fetched', messages.length, 'emails');
      return messages;
    } catch (error) {
      console.error('❌ [FETCH FAILED]', error);
      throw error;
    }
  }

  private parseGmailMessage(data: any): GmailMessage {
    const headers = data.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('from');
    const subject = getHeader('subject');
    const date = getHeader('date');

    // Extract body
    let body = '';
    if (data.payload?.body?.data) {
      body = this.decodeBase64(data.payload.body.data);
    } else if (data.payload?.parts) {
      const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = this.decodeBase64(textPart.body.data);
      }
    }

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      from,
      subject,
      date,
      body: body.substring(0, 1000), // Limit body length
      isSpam: false,
      isThreat: false,
      spamScore: 0,
      deepfakeScore: 0,
      toxicityScore: 0,
      scamScore: 0,
      overallThreatLevel: 'low',
    };
  }

  private decodeBase64(encoded: string): string {
    try {
      // Gmail uses URL-safe base64
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      console.error('Failed to decode base64:', error);
      return '';
    }
  }

  async deleteEmail(messageId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      const response = await fetch(
        `${GMAIL_API_BASE}/messages/${messageId}/trash`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to delete email:', error);
      return false;
    }
  }

  async batchDeleteEmails(messageIds: string[]): Promise<{ success: number; failed: number }> {
    const results = await Promise.all(
      messageIds.map(id => this.deleteEmail(id))
    );

    return {
      success: results.filter(r => r).length,
      failed: results.filter(r => !r).length,
    };
  }

  async markAsSpam(messageId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      const response = await fetch(
        `${GMAIL_API_BASE}/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: ['SPAM'],
            removeLabelIds: ['INBOX'],
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to mark as spam:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        this.accessToken = session.provider_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
}

export const gmailService = new GmailService();
