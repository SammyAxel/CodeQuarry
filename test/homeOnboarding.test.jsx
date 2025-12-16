// @vitest-environment jsdom
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock the onboarding component to inspect props
vi.mock('../src/components/OnboardingTutorial', () => ({
  OnboardingTutorial: (props) => React.createElement('div', { 'data-testid': 'mock-onboarding', 'data-is-open': String(props.isOpen) })
}));

vi.mock('../src/context/UserContext', () => ({
  useUser: () => ({ hasCompletedOnboarding: true })
}));

// Mock language context used by HomePage
vi.mock('../src/context/LanguageContext', () => ({
  useLanguage: () => ({ t: (s) => s })
}));

import HomePage from '../src/pages/HomePage';

describe('HomePage onboarding behavior', () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem('tutorialCompleted');
    sessionStorage.removeItem('tutorialCompleted');
    vi.restoreAllMocks();
  });

  it('marks tutorialCompleted when user hasCompletedOnboarding from context', async () => {
    await act(async () => {
      render(<HomePage courses={[]} onSelectCourse={() => {}} />);
      // wait a tick
      await new Promise(r => setTimeout(r, 0));
    });

    expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    // Ensure the mocked OnboardingTutorial rendered and received isOpen=false
    const node = document.querySelector('[data-testid="mock-onboarding"]');
    expect(node).toBeTruthy();
    expect(node.getAttribute('data-is-open')).toBe('false');
  });
});