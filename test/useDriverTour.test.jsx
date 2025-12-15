// @vitest-environment jsdom
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import useDriverTour from '../src/hooks/useDriverTour';

function SetupComponent({ hookProps }) {
  const { start, destroy } = useDriverTour(hookProps);
  // expose to tests via window (simple approach)
  React.useEffect(() => {
    window.__testDriver = { start, destroy };
    return () => { window.__testDriver = null; };
  }, [start, destroy]);
  return null;
}

describe('useDriverTour', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('starts driver when selectors are present and calls drive', async () => {
    // create selectors
    const title = document.createElement('div'); title.id = 'site-title'; document.body.appendChild(title);
    const search = document.createElement('input'); search.id = 'home-search'; document.body.appendChild(search);
    const course = document.createElement('div'); course.className = 'course-card'; document.body.appendChild(course);
    const help = document.createElement('button'); help.id = 'help-tutorial-btn'; document.body.appendChild(help);

    // mock driver class: class with methods
    const driveMock = vi.fn();
    const destroyMock = vi.fn();
    const setStepsMock = vi.fn();

    class FakeDriver {
      constructor() {
        this.setSteps = setStepsMock;
        this.drive = driveMock;
        this.destroy = destroyMock;
      }
    }

    render(<SetupComponent hookProps={{ driverClass: FakeDriver, selectors: ['#site-title', '#home-search'], steps: [{}, {}], timeout: 500 }} />);

    // ensure the setup effect has run and component mounted
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });

    let res;
    await act(async () => {
      res = await window.__testDriver.start(0);
    });

    expect(res).toBe(true);
    expect(setStepsMock).toHaveBeenCalled();
    expect(driveMock).toHaveBeenCalledWith(0);

    // cleanup
    act(() => { window.__testDriver.destroy(); });
    expect(destroyMock).toHaveBeenCalled();
  });

  it('fails to start when selectors missing and calls onFailure', async () => {
    const onFailure = vi.fn();

    render(<SetupComponent hookProps={{ selectors: ['#nope'], onFailure, driverClass: function() {} }} />);

    let res;
    await act(async () => {
      res = await window.__testDriver.start(0);
    });

    expect(res).toBe(false);
    expect(onFailure).toHaveBeenCalled();
  });
});
