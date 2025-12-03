import { create } from 'zustand';

interface ThreatState {
  threatLevel: 'low' | 'medium' | 'high';
  threatCount: number;
  safeCount: number;
  showGhost: boolean;
  particleTrigger: number;
  particlePosition: { x: number; y: number };
  
  setThreatLevel: (level: 'low' | 'medium' | 'high') => void;
  incrementThreatCount: () => void;
  decrementThreatCount: () => void;
  incrementSafeCount: () => void;
  decrementSafeCount: () => void;
  toggleGhost: () => void;
  triggerParticles: (x: number, y: number) => void;
  reset: () => void;
}

export const useThreatStore = create<ThreatState>((set) => ({
  threatLevel: 'low',
  threatCount: 0,
  safeCount: 0,
  showGhost: true,
  particleTrigger: 0,
  particlePosition: { x: 0, y: 0 },

  setThreatLevel: (level) => set({ threatLevel: level }),
  
  incrementThreatCount: () => set((state) => {
    const newCount = state.threatCount + 1;
    const level: 'low' | 'medium' | 'high' = 
      newCount > 5 ? 'high' : newCount > 2 ? 'medium' : 'low';
    return { threatCount: newCount, threatLevel: level };
  }),
  
  decrementThreatCount: () => set((state) => {
    const newCount = Math.max(0, state.threatCount - 1);
    const level: 'low' | 'medium' | 'high' = 
      newCount > 5 ? 'high' : newCount > 2 ? 'medium' : 'low';
    return { threatCount: newCount, threatLevel: level };
  }),
  
  incrementSafeCount: () => set((state) => ({ safeCount: state.safeCount + 1 })),
  
  decrementSafeCount: () => set((state) => ({ 
    safeCount: Math.max(0, state.safeCount - 1) 
  })),
  
  toggleGhost: () => set((state) => ({ showGhost: !state.showGhost })),
  
  triggerParticles: (x, y) => set((state) => ({
    particleTrigger: state.particleTrigger + 1,
    particlePosition: { x, y },
  })),
  
  reset: () => set({
    threatLevel: 'low',
    threatCount: 0,
    safeCount: 0,
    showGhost: true,
    particleTrigger: 0,
    particlePosition: { x: 0, y: 0 },
  }),
}));
