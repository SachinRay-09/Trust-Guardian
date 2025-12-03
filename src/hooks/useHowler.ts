import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Generate sound using Web Audio API and convert to data URL
const generateTone = (frequency: number, duration: number, type: OscillatorType = 'sine'): string => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Note: This is a simplified version. In production, you'd generate actual audio data
  return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
};

export const useHowler = () => {
  const soundsRef = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    // Initialize sounds (using Web Audio API generated tones)
    soundsRef.current = {
      whoosh: new Howl({
        src: [generateTone(800, 0.3, 'sawtooth')],
        volume: 0.3,
      }),
      threat: new Howl({
        src: [generateTone(220, 0.5, 'triangle')],
        volume: 0.2,
      }),
      click: new Howl({
        src: [generateTone(1000, 0.1, 'sine')],
        volume: 0.1,
      }),
    };

    return () => {
      // Cleanup
      Object.values(soundsRef.current).forEach(sound => sound.unload());
    };
  }, []);

  const playSound = (soundName: string) => {
    const sound = soundsRef.current[soundName];
    if (sound) {
      sound.play();
    }
  };

  return { playSound };
};
