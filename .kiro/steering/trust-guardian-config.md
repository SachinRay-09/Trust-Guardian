---
inclusion: always
---

# Trust Guardian - Kiroween Configuration

This steering document controls the behavior and visual presentation of Trust Guardian's AI detection system.

## Detection Configuration

### Detection Strictness (1-10)
Controls how aggressive the AI agents are in flagging content.
- **Current Value**: 7
- **Range**: 1 (lenient) to 10 (strict)
- **Impact**: 
  - Lower values (1-4): Fewer false positives, may miss subtle threats
  - Medium values (5-7): Balanced detection
  - Higher values (8-10): Maximum sensitivity, more false positives

### Active Agents
Specify which detection agents are enabled:
- **spam_detector**: true
- **deepfake_detector**: true
- **toxicity_detector**: true
- **scam_detector**: true

## Visual Configuration

### Visual Haunting Level (1-10)
Controls the intensity of spectral UI effects.
- **Current Value**: 8
- **Range**: 1 (minimal) to 10 (maximum haunting)
- **Effects Controlled**:
  - Ghost sprite frequency
  - Vapor trail intensity
  - Glitch effect frequency
  - Particle burst density
  - Glow pulse speed

### UI Theme
- **Options**: 'day' | 'night' | 'haunted'
- **Current**: 'haunted'
- **Description**: 
  - day: Purple gradient, bright and friendly
  - night: Dark blue gradient, professional
  - haunted: Deep purple/black, maximum spooky

## Real-time Behavior

These settings are loaded dynamically and affect:
1. **Agent Execution**: Confidence thresholds adjusted by strictness level
2. **UI Rendering**: Animation speeds and intensities scaled by haunting level
3. **Threat Display**: Color coding (green→orange→red) based on combined scores
4. **Notifications**: Alert frequency and urgency based on detection results

## Implementation Notes

- Settings are read from `localStorage` with fallback to these defaults
- Changes take effect immediately without page reload
- Strictness multiplier: `baseConfidence * (strictness / 7)`
- Haunting multiplier: `baseAnimationSpeed * (haunting / 5)`
