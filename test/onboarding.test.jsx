// @vitest-environment jsdom
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('../src/context/UserContext', () => ({
  useUser: () => ({
    markOnboardingCompleted: vi.fn().mockResolvedValue({ success: true })
  })
}));

import { OnboardingTutorial } from '../src/components/OnboardingTutorial';

class FakeDriver {
  constructor(options) {
    this.options = options;
    this.setSteps = vi.fn();
    this.drive = (startIndex) => {
      // Simulate driving to last step (index 5)
      if (this.options && typeof this.options.onNext === 'function') {
        this.options.onNext(null, 5);
      }
    };
    this.destroy = vi.fn();
  }
}

describe('OnboardingTutorial', () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem('tutorialCompleted');
    sessionStorage.removeItem('tutorialCompleted');
    vi.restoreAllMocks();
  });

  it('sets tutorialCompleted and calls markOnboardingCompleted on finish', async () => {
    const onClose = vi.fn();

    // create required selectors so driver can start
    const title = document.createElement('div'); title.id = 'site-title'; document.body.appendChild(title);
    const search = document.createElement('input'); search.id = 'home-search'; document.body.appendChild(search);
    const course = document.createElement('div'); course.className = 'course-card'; document.body.appendChild(course);
    const help = document.createElement('button'); help.id = 'help-tutorial-btn'; document.body.appendChild(help);

    await act(async () => {
      render(<OnboardingTutorial isOpen={true} onClose={onClose} driverClass={FakeDriver} />);
      // wait a tick for start promise to resolve
      await new Promise(r => setTimeout(r, 10));
    });

    expect(localStorage.getItem('tutorialCompleted')).toBe('true');
    expect(sessionStorage.getItem('tutorialCompleted')).toBe('true');
    expect(onClose).toHaveBeenCalled();
  });
});
