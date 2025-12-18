const PRACTICE_TOUR_VERSION = 1;
const PRACTICE_TOUR_PREFIX = `cq:practiceTour:v${PRACTICE_TOUR_VERSION}`;

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getPracticeTourStorageKey = (userKey = 'anon') => {
  const normalized = userKey ? String(userKey) : 'anon';
  return `${PRACTICE_TOUR_PREFIX}:${normalized}`;
};

export const readPracticeTourState = (userKey = 'anon') => {
  try {
    const raw = localStorage.getItem(getPracticeTourStorageKey(userKey));
    if (!raw) return null;
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== PRACTICE_TOUR_VERSION) return null;
    if (parsed.status !== 'completed' && parsed.status !== 'dismissed') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writePracticeTourState = (userKey = 'anon', status, meta = {}) => {
  if (status !== 'completed' && status !== 'dismissed') return;
  const payload = {
    version: PRACTICE_TOUR_VERSION,
    status,
    updatedAt: new Date().toISOString(),
    ...meta,
  };

  try {
    localStorage.setItem(getPracticeTourStorageKey(userKey), JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

export const clearPracticeTourState = (userKey = 'anon') => {
  try {
    localStorage.removeItem(getPracticeTourStorageKey(userKey));
  } catch {
    // ignore storage errors
  }
};

export const hasSeenPracticeTour = (userKey = 'anon') => {
  const state = readPracticeTourState(userKey);
  return !!state;
};
