// Spooky Audio System - Generates atmospheric horror sounds using Web Audio API
// No external files needed - all sounds are synthesized!

class SpookyAudioSystem {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private intervals: number[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.15; // Keep it subtle
    }
  }

  // Start the spooky ambience
  start() {
    if (!this.audioContext || this.isPlaying) return;
    
    // Resume audio context (required by browsers)
    this.audioContext.resume();
    this.isPlaying = true;

    // Layer 1: Deep drone bass
    this.createDrone(55, 0.08); // Low A
    this.createDrone(73.42, 0.06); // Low D

    // Layer 2: Eerie high-pitched whistle
    this.createWhisper();

    // Layer 3: Random creepy sounds
    this.scheduleRandomCreaks();

    // Layer 4: Heartbeat pulse
    this.createHeartbeat();
  }

  // Stop all sounds
  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];

    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
  }

  // Create a deep drone sound
  private createDrone(frequency: number, volume: number) {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;

    gainNode.gain.value = volume;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    this.oscillators.push(oscillator);

    // Add slow modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.1; // Very slow
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  // Create whisper-like high frequency
  private createWhisper() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.value = 1200;
    
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 10;

    gainNode.gain.value = 0.02;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    this.oscillators.push(oscillator);

    // Modulate for eerie effect
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 100;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  // Random creaking sounds
  private scheduleRandomCreaks() {
    const interval = setInterval(() => {
      if (!this.isPlaying) return;
      
      // Random chance of creak
      if (Math.random() > 0.7) {
        this.playCreak();
      }
    }, 5000);
    
    this.intervals.push(interval as unknown as number);
  }

  // Play a single creak sound
  private playCreak() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 100 + Math.random() * 200;
    
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Heartbeat pulse effect
  private createHeartbeat() {
    if (!this.audioContext || !this.masterGain) return;

    const playBeat = () => {
      if (!this.audioContext || !this.masterGain || !this.isPlaying) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 60;

      gainNode.gain.value = 0;
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.15);
    };

    // Double beat pattern
    const interval = setInterval(() => {
      if (!this.isPlaying) return;
      playBeat();
      setTimeout(playBeat, 150);
    }, 2000);

    this.intervals.push(interval as unknown as number);
  }

  // Play exorcise sound effect
  playExorciseSound() {
    if (!this.audioContext || !this.masterGain) return;

    // Whoosh sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Play threat detected sound
  playThreatSound() {
    if (!this.audioContext || !this.masterGain) return;

    // Ominous chord
    const frequencies = [220, 277.18, 329.63]; // A minor chord
    
    frequencies.forEach((freq, i) => {
      if (!this.audioContext || !this.masterGain) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(this.audioContext.currentTime + i * 0.05);
      oscillator.stop(this.audioContext.currentTime + 1);
    });
  }

  // Set volume
  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Check if playing
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Export singleton instance
export const spookyAudio = new SpookyAudioSystem();
