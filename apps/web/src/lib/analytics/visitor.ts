export const VISITOR_ID_KEY = 'analytics_visitor_id';
export const SESSION_ID_KEY = 'analytics_session_id';

function randomId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${uuid}`;
}

/** A stable, persisted visitor id stored in localStorage. */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = randomId('vis');
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return randomId('vis');
  }
}

/** A per-tab session id stored in sessionStorage. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = randomId('sess');
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return randomId('sess');
  }
}
