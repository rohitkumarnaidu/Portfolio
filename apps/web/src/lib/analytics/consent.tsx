'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ConsentValue = 'granted' | 'denied';

export const CONSENT_STORAGE_KEY = 'analytics_consent';

interface ConsentContextType {
  /** Undefined means the visitor has not made a choice yet. */
  consent: ConsentValue | undefined;
  /** True once we have read the persisted value from localStorage (client only). */
  ready: boolean;
  grant: () => void;
  deny: () => void;
  reset: () => void;
}

const ConsentContext = createContext<ConsentContextType | null>(null);

function readStoredConsent(): ConsentValue | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
    return undefined;
  } catch {
    return undefined;
  }
}

function writeStoredConsent(value: ConsentValue | undefined) {
  if (typeof window === 'undefined') return;
  try {
    if (value === undefined) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } else {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
    }
  } catch {
    /* quota / privacy mode — ignore */
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentValue | undefined>(undefined);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount to stay SSR-safe.
  useEffect(() => {
    setConsent(readStoredConsent());
    setReady(true);
  }, []);

  const grant = useCallback(() => {
    writeStoredConsent('granted');
    setConsent('granted');
  }, []);

  const deny = useCallback(() => {
    writeStoredConsent('denied');
    setConsent('denied');
  }, []);

  const reset = useCallback(() => {
    writeStoredConsent(undefined);
    setConsent(undefined);
  }, []);

  const value = useMemo<ConsentContextType>(
    () => ({ consent, ready, grant, deny, reset }),
    [consent, ready, grant, deny, reset],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within a ConsentProvider');
  return ctx;
}
