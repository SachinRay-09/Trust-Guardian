import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageWithDetections } from '../types/database';
import { MessageCard } from './MessageCard';
import { Loader, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function MessageFeed() {
  const [messages, setMessages] = useState<MessageWithDetections[]>([]);
  const [loading, setLoading] = useState(true);
  const { hauntLevel } = useTheme();

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (messagesError) throw messagesError;

      const messagesWithDetections = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: detections } = await supabase
            .from('detections')
            .select('*')
            .eq('message_id', message.id);

          return {
            ...message,
            detections: detections || [],
          };
        })
      );

      setMessages(messagesWithDetections);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Live Trust Feed</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/40 rounded-xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">
            No messages yet. Use the analyzer to scan your first content!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              hauntIntensity={hauntLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
