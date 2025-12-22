
import { getSettings } from './storage';

// Simple Web Audio API Synthesizer for UI Sounds
const getAudioContext = () => {
  const Win = window as any;
  const Ctx = Win.AudioContext || Win.webkitAudioContext;
  if (!Ctx) return null;
  // Singleton-ish pattern on window to avoid recreating contexts
  if (!Win._flashAudioCtx) {
    Win._flashAudioCtx = new Ctx();
  }
  return Win._flashAudioCtx;
};

const playOscillator = (
  freq: number, 
  type: OscillatorType, 
  startTime: number, 
  duration: number, 
  vol: number = 0.1
) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

const triggerHaptic = (pattern: number | number[]) => {
  const { hapticsEnabled } = getSettings();
  if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const shouldPlaySound = () => {
  return getSettings().soundEnabled;
}

export const playTap = () => {
  triggerHaptic(8); // Very light tap
  if (!shouldPlaySound()) return;

  // Crisp, short, high click
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playOscillator(800, 'sine', t, 0.08, 0.05);
};

export const playSuccess = () => {
  triggerHaptic([10, 50, 10]); // Success pattern
  if (!shouldPlaySound()) return;

  // Major chord arpeggio
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playOscillator(523.25, 'sine', t, 0.3, 0.05); // C5
  playOscillator(659.25, 'sine', t + 0.1, 0.3, 0.05); // E5
  playOscillator(783.99, 'sine', t + 0.2, 0.4, 0.05); // G5
};

export const playError = () => {
  triggerHaptic(50); // Heavy thud
  if (!shouldPlaySound()) return;

  // Low dissonant thud
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  playOscillator(150, 'triangle', t, 0.2, 0.1);
  playOscillator(145, 'sawtooth', t, 0.2, 0.1);
};

export const playDelete = () => {
  triggerHaptic(20);
  if (!shouldPlaySound()) return;

  // Descending slide
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.3);
};

export const playToggle = (isOn: boolean) => {
  triggerHaptic(10);
  if (!shouldPlaySound()) return;

  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  if (isOn) {
    playOscillator(600, 'sine', t, 0.1, 0.05);
    playOscillator(800, 'sine', t + 0.05, 0.1, 0.05);
  } else {
    playOscillator(800, 'sine', t, 0.1, 0.05);
    playOscillator(600, 'sine', t + 0.05, 0.1, 0.05);
  }
};
