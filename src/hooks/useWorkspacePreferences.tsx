import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AccentColor,
  VisualIntensity,
  WorkspacePreferences,
  WorkspaceUserProfile,
} from '../types';

interface WorkspacePreferencesContextType extends WorkspacePreferences {
  setAccentColor: (color: AccentColor) => void;
  setIntensity: (intensity: VisualIntensity) => void;
  setProfile: (profile: WorkspaceUserProfile) => void;
}

export const WORKSPACE_PREFERENCES_STORAGE_KEY = 'hubtask_workspace_preferences';

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  accentColor: 'indigo',
  intensity: 'balanced',
  profile: {
    name: 'Jonathan Müller',
    email: 'jonathan.muller@grupounico.com',
    department: 'Gerência de Projetos',
    photo: null,
  },
};

const accentHex: Record<AccentColor, string> = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  emerald: '#059669',
  rose: '#e11d48',
  amber: '#d97706',
};

const intensityOpacity: Record<VisualIntensity, string> = {
  soft: '8%',
  balanced: '14%',
  vivid: '22%',
};

function loadPreferences(): WorkspacePreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_PREFERENCES_STORAGE_KEY) || '{}');
    return {
      accentColor: Object.hasOwn(accentHex, saved.accentColor)
        ? saved.accentColor
        : DEFAULT_WORKSPACE_PREFERENCES.accentColor,
      intensity: Object.hasOwn(intensityOpacity, saved.intensity)
        ? saved.intensity
        : DEFAULT_WORKSPACE_PREFERENCES.intensity,
      profile: {
        ...DEFAULT_WORKSPACE_PREFERENCES.profile,
        ...(saved.profile && typeof saved.profile === 'object' ? saved.profile : {}),
      },
    };
  } catch {
    return DEFAULT_WORKSPACE_PREFERENCES;
  }
}

const WorkspacePreferencesContext = createContext<WorkspacePreferencesContextType | undefined>(undefined);

export function WorkspacePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(WORKSPACE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.style.setProperty('--workspace-accent', accentHex[preferences.accentColor]);
    document.documentElement.style.setProperty('--workspace-accent-soft', intensityOpacity[preferences.intensity]);
  }, [preferences]);

  return (
    <WorkspacePreferencesContext.Provider
      value={{
        ...preferences,
        setAccentColor: (accentColor) => setPreferences((current) => ({ ...current, accentColor })),
        setIntensity: (intensity) => setPreferences((current) => ({ ...current, intensity })),
        setProfile: (profile) => setPreferences((current) => ({ ...current, profile })),
      }}
    >
      {children}
    </WorkspacePreferencesContext.Provider>
  );
}

export function useWorkspacePreferences() {
  const context = useContext(WorkspacePreferencesContext);
  if (!context) {
    throw new Error('useWorkspacePreferences must be used within WorkspacePreferencesProvider');
  }
  return context;
}
