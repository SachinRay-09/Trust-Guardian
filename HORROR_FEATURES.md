# 🎃 Psychological Horror Features

## Overview
Trust Guardian now features a complete **Psychological Horror** theme that creates an unsettling, scary, and immersive experience while maintaining full functionality.

## 🎨 Visual Horror Elements

### 1. **Abyssal Black Background** (#0a0a0a)
- Deep, oppressive black background throughout the app
- Creates a sense of isolation and dread
- Perfect contrast for blood-red and spectral green accents

### 2. **Film Grain / Static Noise Overlay**
- Animated noise overlay covering the entire screen
- Low opacity (15%) for subtle unsettling effect
- Constantly shifting to create unease
- Simulates old horror film aesthetic

### 3. **Distorted Typography**
- **Creepster Font**: For glitchy headers
- **Special Elite**: Typewriter-style for body text
- **VT323**: Terminal-style monospace for technical elements
- Creates authentic horror document feel

### 4. **CSS Glitch Effect on Headers**
- Red and cyan chromatic aberration
- Random text clipping and offsetting
- Continuous skewing animation
- Applied to all h1 and h2 elements with `.glitch-text` class
- Use `data-text` attribute for glitch duplication

```tsx
<h1 className="glitch-text" data-text="TRUST GUARDIAN">
  TRUST GUARDIAN
</h1>
```

## 🎭 Interactive Horror Elements

### 5. **Redacted Document Style**
- Email list items styled as classified government documents
- "CLASSIFIED" watermark in corner
- Typewriter font for authentic feel
- Dark borders and aged paper effect

### 6. **Blood Stain Effects**
- Radial gradient blood splatters on threat emails
- Positioned in corners for maximum impact
- Blurred edges for realistic appearance

### 7. **Violent Shake on Hover**
- Emails shake violently when hovered
- Random rotation and translation
- Creates sense of instability
- Applied with `.violent-shake` class

### 8. **Dying Lightbulb Flicker**
- Safe emails flicker like dying lights when hovered
- Random opacity and brightness changes
- Simulates electrical malfunction
- Applied with `.dying-light` class

## 🖱️ Cursor & Interactions

### 9. **Crosshair Cursor**
- Custom SVG crosshair cursor throughout app
- Red color (#ff0000) for menacing feel
- Replaces default cursor everywhere
- Reinforces "hunting" theme

### 10. **Dripping Buttons**
- Action buttons appear to drip blood
- Animated gradient below button
- Pulsing drip effect
- Applied with `.dripping-button` class

## 👻 Jump Scare Mechanics

### 11. **Random Jump Scares**
- Triggers every 10-20 seconds randomly
- Three types of scares:
  - **Glowing Eyes**: Red demonic eyes
  - **Shadow Figure**: Dark silhouette
  - **Face**: Distorted horror face
- Flashes for 0.2 seconds then fades
- Positioned center screen
- Non-intrusive but effective

### 12. **Demon Eyes Background**
- Floating demon eyes in background
- Radial gradient red glow
- Pulsing animation
- Multiple eyes at different positions
- Low opacity for subtle horror

## 🎨 Color Palette

### Blood Red (#8a0000)
- Primary threat indicator
- Used for dangerous emails
- Headers and warnings
- Dripping effects

### Spectral Green (#00ff41)
- Terminal-style text
- Matrix/hacker aesthetic
- Safe indicators
- Technical readouts

### Deep Black (#0a0a0a)
- Background color
- Creates oppressive atmosphere
- Maximum contrast

## 🎮 Scary Game Feature

### Ghost Hunter Mini-Game
- **Objective**: Click ghosts before they escape
- **Time Limit**: 30 seconds
- **Scoring**: 10 points per ghost
- **High Score**: Saved in localStorage
- **Features**:
  - Floating ghost sprites
  - Crosshair cursor
  - Real-time score tracking
  - Glitch text effects
  - Nightmare pulse animations
  - Game over screen with stats

**Access**: Click "Play Game" button in main navigation

## 🔗 DeepGuard Link

### Floating Link Component
- Fixed position bottom-right
- Glowing background effect
- Nightmare pulse animation
- Dripping blood effect
- Links to: https://deep-gaurd.vercel.app
- Hover effects with scale transform

## 🐛 Bug Fixes Implemented

### Gmail API Fixes
1. **Authentication Scope Fix**
   - Added explicit Gmail scopes to OAuth
   - `openid email profile gmail.readonly gmail.modify`
   - Force consent with `prompt: 'consent'`
   - Offline access with `access_type: 'offline'`

2. **API Query Fix**
   - Changed from `q=in:inbox` to `labelIds=INBOX`
   - Uppercase "INBOX" required by Gmail API
   - Added proper error handling

3. **Debug Logging**
   - Console logs for all API calls
   - Full response object logging
   - Status code tracking
   - Error message display

### Text Analyzer Fixes
1. **Detection Sensitivity**
   - Lowered detection thresholds (30% instead of 40%)
   - Increased keyword lists
   - Added more patterns
   - Better confidence scoring

2. **Scam Detector**
   - Added "scam", "fraud", "phishing" keywords
   - More urgency patterns
   - Better URL detection
   - Minimum 35% confidence for matches

3. **Toxicity Detector**
   - Expanded profanity list
   - More toxic patterns
   - Better pattern matching
   - Minimum 40% confidence for matches

4. **Spam Detector**
   - Larger keyword database
   - Better spam indicators
   - Improved confidence calculation
   - Minimum 35% confidence for matches

## 📝 CSS Classes Reference

### Horror Effects
- `.glitch-text` - Glitchy header with chromatic aberration
- `.redacted-document` - Classified document style
- `.blood-stain` - Blood splatter effect
- `.violent-shake` - Violent shaking on hover
- `.dying-light` - Flickering light effect
- `.dripping-button` - Blood dripping from button
- `.terminal-text` - Green terminal-style text
- `.creepy-shake` - Constant creepy shaking
- `.nightmare-pulse` - Pulsing red glow
- `.haunted-float` - Floating ghost animation
- `.possessed-text` - Glitchy possessed text
- `.demon-eyes` - Glowing red eyes effect

### Usage Examples

```tsx
// Glitch header
<h1 className="glitch-text" data-text="TITLE">TITLE</h1>

// Redacted email
<div className="redacted-document blood-stain violent-shake">
  Email content
</div>

// Dripping button
<button className="dripping-button nightmare-pulse">
  Click Me
</button>

// Terminal text
<span className="terminal-text">System Ready</span>
```

## 🎯 User Experience

### Immersive Horror
- Every interaction reinforces horror theme
- Subtle unsettling effects throughout
- Jump scares keep users on edge
- Professional functionality maintained

### Accessibility
- All effects are visual only
- No audio jump scares
- Cursor remains functional
- Text remains readable
- Colors have sufficient contrast

### Performance
- CSS animations (GPU accelerated)
- Minimal JavaScript overhead
- Optimized SVG graphics
- Efficient jump scare timing

## 🚀 Testing Checklist

- [ ] Film grain overlay visible
- [ ] Crosshair cursor working
- [ ] Glitch text animating
- [ ] Jump scares triggering
- [ ] Violent shake on hover
- [ ] Dying light flicker
- [ ] Dripping button effect
- [ ] Demon eyes visible
- [ ] Game playable
- [ ] DeepGuard link working
- [ ] Gmail API connecting
- [ ] Text analyzer detecting threats

## 🎃 Horror Level Control

Users can adjust horror intensity in Settings:
- **Visual Haunting**: 1-10 scale
- **Detection Strictness**: 1-10 scale
- Higher values = more intense effects
- Real-time updates without reload

---

**Built with 👻 for maximum psychological horror!**
