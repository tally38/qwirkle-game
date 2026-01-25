import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationSound = 'none' | 'chime' | 'bell' | 'melody' | 'fanfare';

export const TILE_SIZE_MIN = 24;
export const TILE_SIZE_MAX = 56;
export const TILE_SIZE_DEFAULT = 40;

// Calculate cell size from tile size (adds padding)
export function getCellSize(tileSize: number): number {
  return Math.round(tileSize * 1.25);
}

interface Settings {
  notificationSound: NotificationSound;
  volume: number; // 0 to 1
  tileSize: number; // pixels, 24-56
}

interface SettingsContextType {
  settings: Settings;
  setNotificationSound: (sound: NotificationSound) => void;
  setVolume: (volume: number) => void;
  setTileSize: (size: number) => void;
}

const defaultSettings: Settings = {
  notificationSound: 'chime',
  volume: 0.7,
  tileSize: TILE_SIZE_DEFAULT,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'qwirkle-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setNotificationSound = (sound: NotificationSound) => {
    setSettings(prev => ({ ...prev, notificationSound: sound }));
  };

  const setVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  };

  const setTileSize = (size: number) => {
    setSettings(prev => ({ ...prev, tileSize: Math.max(TILE_SIZE_MIN, Math.min(TILE_SIZE_MAX, size)) }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setNotificationSound, setVolume, setTileSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function playNote(
  audioContext: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.5
) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  oscillator.start(startTime);
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  oscillator.stop(startTime + duration);
}

export function playNotificationSound(sound: NotificationSound, volume: number = 0.7) {
  if (sound === 'none') return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  const v = volume; // master volume multiplier

  switch (sound) {
    case 'chime':
      // Three-note descending chime (C6 -> G5 -> E5)
      playNote(audioContext, 1047, now, 0.25, 'sine', 1.0 * v);
      playNote(audioContext, 784, now + 0.15, 0.25, 'sine', 0.9 * v);
      playNote(audioContext, 659, now + 0.30, 0.4, 'sine', 0.8 * v);
      break;

    case 'bell':
      // Bell chord with harmonics (plays multiple frequencies together)
      playNote(audioContext, 659, now, 0.8, 'sine', 0.9 * v);       // E5
      playNote(audioContext, 830, now, 0.8, 'triangle', 0.6 * v);   // G#5
      playNote(audioContext, 1319, now + 0.05, 0.7, 'sine', 0.4 * v); // E6 harmonic
      break;

    case 'melody':
      // Ascending four-note melody (C5 -> E5 -> G5 -> C6)
      playNote(audioContext, 523, now, 0.2, 'sine', 0.9 * v);
      playNote(audioContext, 659, now + 0.15, 0.2, 'sine', 0.9 * v);
      playNote(audioContext, 784, now + 0.30, 0.2, 'sine', 0.9 * v);
      playNote(audioContext, 1047, now + 0.45, 0.4, 'sine', 1.0 * v);
      break;

    case 'fanfare':
      // Short fanfare (G4 -> C5 -> E5 -> G5, then chord)
      playNote(audioContext, 392, now, 0.15, 'triangle', 0.9 * v);        // G4
      playNote(audioContext, 523, now + 0.12, 0.15, 'triangle', 0.9 * v); // C5
      playNote(audioContext, 659, now + 0.24, 0.15, 'triangle', 0.9 * v); // E5
      playNote(audioContext, 784, now + 0.36, 0.5, 'triangle', 1.0 * v);  // G5
      // Final chord
      playNote(audioContext, 523, now + 0.5, 0.5, 'sine', 0.6 * v);  // C5
      playNote(audioContext, 659, now + 0.5, 0.5, 'sine', 0.6 * v);  // E5
      playNote(audioContext, 784, now + 0.5, 0.5, 'sine', 0.8 * v);  // G5
      break;
  }
}
