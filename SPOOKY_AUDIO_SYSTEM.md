# 🎵 Spooky Audio System

## Overview
A completely **free, synthesized audio system** using the Web Audio API. No external files needed - all sounds are generated in real-time using oscillators and filters!

---

## 🎹 Features

### Atmospheric Background Ambience
The system creates a layered horror soundscape with:

#### Layer 1: Deep Drone Bass
- **Two low-frequency drones** (55 Hz and 73.42 Hz)
- Creates ominous, rumbling foundation
- Slow LFO modulation for movement
- Low-pass filtered for warmth

#### Layer 2: Eerie Whisper
- **High-frequency sine wave** (1200 Hz)
- Band-pass filtered for ethereal quality
- Modulated for ghostly effect
- Very subtle volume (0.02)

#### Layer 3: Random Creaks
- **Procedurally generated** creak sounds
- Random timing (every 5 seconds, 30% chance)
- Sawtooth wave with frequency sweep
- Simulates old house/door creaks

#### Layer 4: Heartbeat Pulse
- **Double-beat pattern** every 2 seconds
- Low sine wave (60 Hz)
- Quick attack and decay
- Adds tension and rhythm

### Sound Effects

#### Exorcise Sound
- **Whoosh effect** when removing threats
- Frequency sweep: 800 Hz → 100 Hz
- Low-pass filter sweep
- 0.3 second duration

#### Threat Detected Sound
- **Ominous A minor chord** (220, 277.18, 329.63 Hz)
- Staggered note entry
- Triangle wave for warmth
- 1 second fade out

---

## 🎛️ Audio Control Component

### Features
- **Toggle button**: Start/stop audio
- **Volume slider**: 0-30% range (keeps it subtle)
- **Auto-start**: Begins in haunted theme
- **Theme-aware styling**: Adapts to day/night/haunted
- **Visual feedback**: Glow effects when playing

### Location
Fixed position: **Bottom-left corner**

### Controls
- 🔊 **Volume2 icon**: Audio is playing
- 🔇 **VolumeX icon**: Audio is off
- **Slider**: Adjust volume (0-100% display, 0-30% actual)
- **Label**: Shows current state

---

## 🔧 Technical Implementation

### Web Audio API
```typescript
AudioContext - Main audio processing graph
OscillatorNode - Sound generation
GainNode - Volume control
BiquadFilterNode - Frequency filtering
```

### Architecture
```
SpookyAudioSystem (Singleton)
├── audioContext: AudioContext
├── masterGain: GainNode (0.15 default)
├── oscillators: OscillatorNode[]
└── intervals: number[]
```

### Methods

#### `start()`
Initializes and starts all audio layers
- Resumes audio context
- Creates drone layers
- Starts whisper effect
- Schedules random creaks
- Begins heartbeat pulse

#### `stop()`
Stops all audio and cleans up
- Stops all oscillators
- Clears all intervals
- Resets state

#### `playExorciseSound()`
Plays whoosh effect for exorcise action
- Frequency sweep with exponential ramp
- Filter sweep for movement
- Auto-cleanup after 0.3s

#### `playThreatSound()`
Plays ominous chord for threat detection
- Three-note minor chord
- Staggered timing
- Fade out over 1 second

#### `setVolume(volume: number)`
Adjusts master volume (0-1 range)

#### `getIsPlaying()`
Returns current playback state

---

## 🎨 Integration

### Main App
```typescript
import { SpookyAudioControl } from './components/SpookyAudioControl';

// Add to render
<SpookyAudioControl />
```

### Alternate Dashboard
```typescript
import { spookyAudio } from '../utils/spookyAudio';

// Auto-start on mount
useEffect(() => {
  spookyAudio.start();
}, []);

// Play sound effects
spookyAudio.playExorciseSound();
spookyAudio.playThreatSound();
```

---

## 🎵 Sound Design Details

### Frequency Choices

#### Bass Drones
- **55 Hz**: Low A note (fundamental)
- **73.42 Hz**: Low D note (perfect fourth)
- Creates tension without resolution

#### Whisper
- **1200 Hz**: High enough to be eerie
- **Band-pass filtered**: Removes harmonics
- **Modulated**: Creates movement

#### Heartbeat
- **60 Hz**: Sub-bass range
- **Double beat**: Realistic heart pattern
- **2-second interval**: Slow, ominous pace

### Filter Types

#### Low-Pass Filter
- Removes high frequencies
- Creates warmth and depth
- Used on drones and creaks

#### Band-Pass Filter
- Isolates specific frequency range
- Creates focused, eerie tones
- Used on whisper effect

---

## 🎯 User Experience

### Auto-Start Behavior
- **Haunted Theme**: Auto-starts after 1 second
- **Day/Night Theme**: Stops if playing
- **User Control**: Can toggle anytime

### Volume Management
- **Default**: 15% (0.15)
- **Range**: 0-30% (prevents overwhelming)
- **Persistent**: Remembers user setting
- **Visual**: Slider shows percentage

### Browser Compatibility
- **Modern browsers**: Full support
- **Safari**: Uses webkitAudioContext
- **Autoplay policy**: Respects browser restrictions
- **Fallback**: Graceful degradation

---

## 🚀 Performance

### Optimization
- **Singleton pattern**: One instance only
- **Cleanup**: Stops oscillators on unmount
- **Efficient**: Uses native Web Audio API
- **No files**: Zero network requests

### Resource Usage
- **CPU**: Minimal (native audio processing)
- **Memory**: ~1-2 MB for audio context
- **Network**: 0 bytes (all synthesized)
- **Battery**: Negligible impact

---

## 🎃 Horror Sound Theory

### Why These Sounds Work

#### Low Frequencies (Infrasound)
- **Below 20 Hz**: Felt more than heard
- **Creates unease**: Subconscious effect
- **Used in horror films**: Standard technique

#### Dissonant Intervals
- **Minor chords**: Sad, ominous
- **Tritones**: "Devil's interval"
- **Unresolved**: Creates tension

#### Random Elements
- **Unpredictable timing**: Keeps listener alert
- **Varied pitch**: Prevents habituation
- **Natural sounds**: Creaks, whispers

#### Slow Modulation
- **LFO effects**: Creates movement
- **Prevents monotony**: Keeps interesting
- **Subtle changes**: Subconscious impact

---

## 🔊 Sound Examples

### What You'll Hear

1. **Deep Rumble**: Constant low drone
2. **High Whistle**: Faint, wavering tone
3. **Random Creaks**: Occasional wood sounds
4. **Heartbeat**: Rhythmic pulse
5. **Whoosh**: On exorcise action
6. **Chord**: On threat detection

### Layering Effect
All sounds play simultaneously, creating a rich, atmospheric soundscape that enhances the horror theme without being overwhelming.

---

## 📱 Mobile Considerations

### Touch Interaction
- **Tap to start**: Required by mobile browsers
- **Visual feedback**: Shows audio state
- **Volume control**: Touch-friendly slider

### Battery Impact
- **Minimal**: Native audio processing
- **User control**: Can disable anytime
- **Auto-stop**: When leaving haunted theme

---

## 🎬 Future Enhancements

### Potential Additions
1. **More sound effects**: Click, hover, notification sounds
2. **Dynamic intensity**: Adjust based on haunt level
3. **Spatial audio**: Panning effects
4. **Reverb**: Add depth and space
5. **Presets**: Different ambience modes
6. **Visualizer**: Audio waveform display
7. **Recording**: Save audio sessions
8. **Sharing**: Export audio settings

---

## 🔧 Troubleshooting

### Audio Not Playing?
1. **Check browser**: Modern browser required
2. **User interaction**: Click toggle button
3. **Volume**: Ensure slider is up
4. **Browser policy**: Some browsers block autoplay

### Audio Too Loud/Quiet?
1. **Use slider**: Adjust volume control
2. **System volume**: Check OS settings
3. **Default**: 15% is intentionally subtle

### Performance Issues?
1. **Stop audio**: Click toggle to disable
2. **Close tabs**: Reduce browser load
3. **Update browser**: Use latest version

---

## 📊 Technical Specifications

### Audio Parameters
```
Sample Rate: 44100 Hz (default)
Bit Depth: 32-bit float
Channels: Stereo
Latency: ~10ms
Master Volume: 0.15 (15%)
```

### Oscillator Settings
```
Drone 1: 55 Hz sine, 0.08 gain
Drone 2: 73.42 Hz sine, 0.06 gain
Whisper: 1200 Hz sine, 0.02 gain
Heartbeat: 60 Hz sine, 0.1 gain (pulsed)
Creak: 100-300 Hz sawtooth, 0.05 gain
```

---

**Built for Kiroween Hackathon** 🎃👻
100% Free, 100% Synthesized, 100% Spooky!
