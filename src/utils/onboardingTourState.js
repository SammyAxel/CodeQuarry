const ONBOARDING_TOUR_VERSION = 1;
const ONBOARDING_TOUR_PREFIX = `cq:onboardingTour:v${ONBOARDING_TOUR_VERSION}`;

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getOnboardingTourStorageKey = (userKey = 'anon') => {
  const normalized = userKey ? String(userKey) : 'anon';
  return `${ONBOARDING_TOUR_PREFIX}:${normalized}`;
};

export const readOnboardingTourState = (userKey = 'anon') => {
  try {
    const raw = localStorage.getItem(getOnboardingTourStorageKey(userKey));
    if (!raw) return null;
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== ONBOARDING_TOUR_VERSION) return null;
    if (parsed.status !== 'completed' && parsed.status !== 'dismissed') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeOnboardingTourState = (userKey = 'anon', status, meta = {}) => {
  if (status !== 'completed' && status !== 'dismissed') return;
  const payload = {
    version: ONBOARDING_TOUR_VERSION,
    status,
    updatedAt: new Date().toISOString(),
    ...meta,
  };

  try {
    localStorage.setItem(getOnboardingTourStorageKey(userKey), JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

export const clearOnboardingTourState = (userKey = 'anon') => {
  try {
    localStorage.removeItem(getOnboardingTourStorageKey(userKey));
  } catch {
    // ignore storage errors
  }
};

export const hasSeenOnboardingTour = (userKey = 'anon') => {
  const state = readOnboardingTourState(userKey);
  return !!state;
};
