// @vitest-environment jsdom
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('driver.js', () => {
  class FakeDriver {
    constructor(options) {
      this.options = options;
      this.setSteps = () => {};
      this.destroy = () => {};
      this.getActiveIndex = () => 5;
      this.drive = () => {
        if (typeof this.options?.onNextClick === 'function') {
          this.options.onNextClick(null, null);
        }
      };
    }
  }
  return { driver: FakeDriver };
});

vi.mock('../src/context/UserContext', () => ({
  useUser: () => ({
    currentUser: { username: 'alice' },
    markPracticeVisited: vi.fn().mockResolvedValue({ success: true }),
  })
}));

import { PracticeTutorial } from '../src/components/PracticeTutorial';
import { readPracticeTourState, getPracticeTourStorageKey } from '../src/utils/practiceTourState';

describe('PracticeTutorial persistence', () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(getPracticeTourStorageKey('alice'));
    vi.restoreAllMocks();
  });

  it('persists completed state on finish', async () => {
    const onClose = vi.fn();

    const field = document.createElement('button'); field.id = 'field-guide-tab'; document.body.appendChild(field);
    const bounty = document.createElement('button'); bounty.id = 'bounty-tab'; document.body.appendChild(bounty);
    const editor = document.createElement('div'); editor.className = 'code-editor-wrapper'; document.body.appendChild(editor);

    await act(async () => {
      render(<PracticeTutorial isOpen={true} onClose={onClose} />);
      await new Promise(r => setTimeout(r, 10));
    });

    const state = readPracticeTourState('alice');
    expect(state?.status).toBe('completed');
    expect(onClose).toHaveBeenCalled();
  });
});
