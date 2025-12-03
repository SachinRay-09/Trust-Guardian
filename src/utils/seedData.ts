import { supabase } from '../lib/supabase';
import { analyzeContent, calculateHauntLevel } from '../services/detectionService';

const sampleMessages = [
  {
    content: "CONGRATULATIONS!!! You've WON $1,000,000! Click here NOW to claim your prize! Limited time offer! Act fast!",
    channel: 'email' as const,
    author: 'winner@totallylegit.com',
  },
  {
    content: "Your account has been suspended. Please verify your password immediately by clicking this link.",
    channel: 'email' as const,
    author: 'security@bank-alert.com',
  },
  {
    content: "Hey team! Just wanted to share the latest project updates. Meeting scheduled for tomorrow at 2pm.",
    channel: 'comments' as const,
    author: 'Sarah Johnson',
  },
  {
    content: "This product is absolutely TERRIBLE!!! WORST purchase ever! You're all IDIOTS for buying this TRASH!!!",
    channel: 'reviews' as const,
    author: 'AngryCustomer99',
  },
  {
    content: "Great service! The team was professional and delivered exactly what we needed. Highly recommend!",
    channel: 'reviews' as const,
    author: 'HappyClient',
  },
  {
    content: "FREE CRYPTO INVESTMENT! Double your Bitcoin in 24 hours! Nigerian prince needs your help! Wire transfer required!",
    channel: 'email' as const,
    author: 'crypto-prince@invest.ng',
  },
  {
    content: "This video appears to be AI generated deepfake content. The synthetic media has been manipulated.",
    channel: 'comments' as const,
    author: 'ContentModerator',
  },
  {
    content: "Thanks for the feedback! We're working on improving our service based on customer suggestions.",
    channel: 'comments' as const,
    author: 'CustomerService',
  },
];

const sampleUsers = [
  { username: 'SpectralHunter', exorcist_score: 850, ghost_badge_level: 'Specter Master' },
  { username: 'GhostBuster42', exorcist_score: 620, ghost_badge_level: 'Specter Master' },
  { username: 'PhantomSlayer', exorcist_score: 420, ghost_badge_level: 'Wraith Hunter' },
  { username: 'SpiritGuardian', exorcist_score: 280, ghost_badge_level: 'Wraith Hunter' },
  { username: 'WraithWatcher', exorcist_score: 150, ghost_badge_level: 'Ghost Buster' },
];

export async function seedDatabase() {
  try {
    for (const user of sampleUsers) {
      await supabase
        .from('users')
        .upsert(user, { onConflict: 'username' });
    }

    for (const msg of sampleMessages) {
      const detectionResults = await analyzeContent(msg.content);

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: msg.content,
          channel: msg.channel,
          author: msg.author,
          is_flagged: detectionResults.length > 0,
          analyzed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error inserting message:', messageError);
        continue;
      }

      if (detectionResults.length > 0) {
        const { data: insertedDetections, error: detectionsError } = await supabase
          .from('detections')
          .insert(
            detectionResults.map((dr) => ({
              message_id: message.id,
              detector_type: dr.detectorType,
              confidence_score: dr.confidenceScore,
              threat_details: dr.threatDetails,
            }))
          )
          .select();

        if (detectionsError) {
          console.error('Error inserting detections:', detectionsError);
          continue;
        }

        const hauntLevel = calculateHauntLevel(insertedDetections);
        await supabase
          .from('messages')
          .update({ haunt_level: hauntLevel })
          .eq('id', message.id);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
