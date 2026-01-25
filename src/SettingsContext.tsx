import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  soundEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSoundEnabled: (enabled: boolean) => void;
}

const defaultSettings: Settings = {
  soundEnabled: true,
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

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSoundEnabled }}>
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
