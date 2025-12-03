import { useState } from 'react';
import { Mail, MessageSquare, Star, Skull, Zap } from 'lucide-react';
import { MessageWithDetections } from '../types/database';
import { GhostOverlay } from './GhostOverlay';
import { ThreatGlow } from './SpectralEffects';
import { GlitchText } from './GlitchText';
import { useThreatStore } from '../store/threatStore';

interface MessageCardProps {
  message: MessageWithDetections;
  hauntIntensity: number;
}

const channelIcons = {
  email: Mail,
  reviews: Star,
  comments: MessageSquare,
  manual: MessageSquare,
};

const threatLabels = {
  spam: { label: 'SPAM DETECTED', color: 'from-yellow-500 to-orange-600', icon: '📧' },
  scam: { label: 'SCAM ALERT', color: 'from-red-500 to-rose-700', icon: '🎣' },
  deepfake: { label: 'FAKE CONTENT', color: 'from-purple-500 to-fuchsia-600', icon: '🎭' },
  toxicity: { label: 'TOXIC', color: 'from-orange-500 to-red-600', icon: '☠️' },
};

export function MessageCard({ message, hauntIntensity }: MessageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { triggerParticles } = useThreatStore();
  const ChannelIcon = channelIcons[message.channel];
  
  // Calculate max threat score
  const maxThreatScore = Math.max(
    ...message.detections.map(d => d.confidence_score * 100),
    0
  );
  
  const threatLevel: 'low' | 'medium' | 'high' = 
    maxThreatScore > 70 ? 'high' : maxThreatScore > 40 ? 'medium' : 'low';
  
  const shouldFlicker = message.is_flagged && hauntIntensity >= 2;

  const handleCardClick = (e: React.MouseEvent) => {
    if (message.is_flagged && hauntIntensity >= 5) {
      triggerParticles(e.clientX, e.clientY);
    }
  };

  const cardClass = `
    relative overflow-hidden rounded-xl p-5 smooth-transition card-interactive
    ${message.is_flagged
      ? `bg-gradient-to-br from-gray-900/95 to-red-900/90 border-2 border-red-500/50 intensity-${threatLevel}`
      : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 glass-morphism'
    }
    ${shouldFlicker ? 'animate-flicker' : ''}
    ${message.is_flagged && threatLevel === 'high' ? 'threat-pulse-high' : ''}
    ${message.is_flagged && threatLevel === 'medium' ? 'threat-pulse-medium' : ''}
    backdrop-blur-sm cursor-pointer hover-lift
  `;

  return (
    <div 
      className={cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {message.is_flagged && (
        <>
          <GhostOverlay
            hauntLevel={message.haunt_level}
            isVisible={hauntIntensity >= 2}
          />
          <ThreatGlow level={threatLevel} />
        </>
      )}

      <div className="relative z-20">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${message.is_flagged ? 'bg-red-500/20' : 'bg-cyan-500/20'}`}>
              <ChannelIcon className={message.is_flagged ? 'text-red-400' : 'text-cyan-400'} size={18} />
            </div>
            <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
              {message.channel}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-sm text-gray-500">{message.author}</span>
          </div>

          {message.is_flagged && (
            <div className="flex items-center gap-1">
              {Array.from({ length: message.haunt_level }).map((_, i) => (
                <Skull 
                  key={i} 
                  className="text-red-400 animate-pulse" 
                  size={16}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {message.is_flagged && hauntIntensity >= 7 ? (
          <GlitchText 
            intensity={threatLevel} 
            className="text-gray-200 mb-4 line-clamp-3 leading-relaxed"
          >
            {message.content}
          </GlitchText>
        ) : (
          <p className="text-gray-200 mb-4 line-clamp-3 leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Threat Intensity Visualization */}
        {message.is_flagged && message.detections.length > 0 && (
          <div className="space-y-3 mb-4">
            {/* Threat Score Bar */}
            <div className="threat-bar h-2">
              <div 
                className={`threat-bar-fill ${
                  threatLevel === 'high' ? 'bg-gradient-to-r from-red-600 to-red-500' :
                  threatLevel === 'medium' ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                  'bg-gradient-to-r from-yellow-600 to-yellow-500'
                }`}
                style={{ width: `${maxThreatScore}%` }}
              />
            </div>

            {/* Detection Badges */}
            <div className="flex flex-wrap gap-2">
              {message.detections.map((detection) => (
                <div
                  key={detection.id}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg
                    bg-gradient-to-r ${threatLabels[detection.detector_type].color}
                    text-white text-xs font-bold uppercase tracking-wide
                    shadow-lg shimmer-effect button-press
                    ${isHovered ? 'scale-105' : 'scale-100'}
                    smooth-transition
                  `}
                >
                  <span className="text-base">{threatLabels[detection.detector_type].icon}</span>
                  <span>{threatLabels[detection.detector_type].label}</span>
                  <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded">
                    <Zap size={10} />
                    <span>{Math.round(detection.confidence_score * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
          <span className="text-xs text-gray-500">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
          {message.is_flagged && (
            <div className="flex items-center gap-2">
              {hauntIntensity >= 4 && (
                <span className="text-xs text-red-400 animate-pulse uppercase font-bold">
                  ⚠ DANGER ⚠
                </span>
              )}
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                threatLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                threatLevel === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {threatLevel} THREAT
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer Effect */}
      {message.is_flagged && hauntIntensity >= 3 && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
}
