import { useRef, useEffect } from 'react';
import { driver as Driver } from 'driver.js';

/**
 * useDriverTour hook
 * Encapsulates driver.js initialization, waiting for selectors, starting (drive), and cleanup.
 * Options:
 * - steps: array of driver.js step objects
 * - selectors: array of selectors to wait for (optional)
 * - timeout: ms to wait for selectors (default 2500)
 * - interval: ms poll interval (default 100)
 * - onFailure: callback when driver cannot start
 * - driverClass: override for testing
 */
export const useDriverTour = ({ steps = [], selectors = [], timeout = 2500, interval = 100, onFailure = () => {}, driverClass = Driver, driverOptions = {} } = {}) => {
  const driverRef = useRef(null);
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  const normalizeDriverOptions = (opts) => {
    const normalized = { ...(opts || {}) };

    const getActiveIndexSafe = () => {
      try {
        const d = driverRef.current;
        if (!d) return undefined;
        if (typeof d.getActiveIndex === 'function') return d.getActiveIndex();
        if (typeof d.getState === 'function') {
          const state = d.getState();
          if (state && typeof state.activeIndex === 'number') return state.activeIndex;
        }
      } catch (e) {}
      return undefined;
    };

    // Back-compat for older code that used non-driver.js option names.
    // driver.js v1.x uses: onNextClick/onPrevClick/onCloseClick/onDestroyed
    if (typeof opts?.onDestroy === 'function' && typeof normalized.onDestroyed !== 'function') {
      normalized.onDestroyed = (...args) => opts.onDestroy(...args);
    }
    if (typeof opts?.onNext === 'function' && typeof normalized.onNextClick !== 'function') {
      normalized.onNextClick = (el, step, ...rest) => {
        const idx = getActiveIndexSafe();
        return opts.onNext(el, typeof idx === 'number' ? idx : 0, step, ...rest);
      };
    }
    if (typeof opts?.onPrev === 'function' && typeof normalized.onPrevClick !== 'function') {
      normalized.onPrevClick = (el, step, ...rest) => {
        const idx = getActiveIndexSafe();
        return opts.onPrev(el, typeof idx === 'number' ? idx : 0, step, ...rest);
      };
    }

    return normalized;
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        if (pollRef.current) clearTimeout(pollRef.current);
      } catch (e) {}
      if (driverRef.current) {
        try { driverRef.current.destroy(); } catch (e) {}
        driverRef.current = null;
      }
    };
  }, []);

  const waitForSelectors = (selList, t = timeout, inter = interval) => {
    if (!selList || selList.length === 0) return Promise.resolve(true);
    const start = Date.now();
    return new Promise(resolve => {
      const check = () => {
        if (!mountedRef.current) return resolve(false);
        const allFound = selList.every(s => document.querySelector(s));
        if (allFound) return resolve(true);
        if (Date.now() - start >= t) return resolve(false);
        pollRef.current = window.setTimeout(check, inter);
      };
      check();
    });
  };

  const start = async (startIndex = 0) => {
    // Ensure any existing driver instance is cleaned up before creating a new one
    if (driverRef.current) {
      try { driverRef.current.destroy(); } catch (e) {}
      driverRef.current = null;
    }

    // Create driver instance
    try {
      const options = {
        allowClose: true,
        overlayClickNext: false,
        showProgress: true,
        ...normalizeDriverOptions(driverOptions),
      };
      driverRef.current = new driverClass(options);
    } catch (e) {
      onFailure(e);
      driverRef.current = null;
      return false;
    }

    // Wait for selectors
    const ok = await waitForSelectors(selectors);
    if (!mountedRef.current) return false;

    if (!ok) {
      // destroy and call failure
      try { driverRef.current.destroy(); } catch (e) {}
      driverRef.current = null;
      onFailure(new Error('selectors_not_found'));
      return false;
    }

    try {
      if (steps && steps.length) driverRef.current.setSteps(steps);
      // driver.js here expects `drive(startIndex)` to begin
      if (typeof driverRef.current.drive === 'function') {
        driverRef.current.drive(startIndex);
      } else if (typeof driverRef.current.start === 'function') {
        driverRef.current.start();
      } else {
        throw new Error('driver_missing_start_api');
      }
      return true;
    } catch (e) {
      try { driverRef.current.destroy(); } catch (err) {}
      driverRef.current = null;
      onFailure(e);
      return false;
    }
  };

  const destroy = () => {
    if (driverRef.current) {
      try { driverRef.current.destroy(); } catch (e) {}
      driverRef.current = null;
    }
    if (pollRef.current) {
      try { clearTimeout(pollRef.current); } catch (e) {}
      pollRef.current = null;
    }
  };

  return { start, destroy, driverRef };
};

export default useDriverTour;
