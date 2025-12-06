import { useState, useRef, useEffect, useCallback } from 'react';
import { logSecurityEvent } from '../utils/securityUtils';

/**
 * Hook for running JavaScript code in a Web Worker sandbox
 * Provides isolated execution environment with timeout protection
 * 
 * @returns {Object} { executeInWorker, isWorkerReady, terminateWorker }
 */
export const useCodeWorker = () => {
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const workerRef = useRef(null);
  const pendingCallsRef = useRef({});
  const callIdRef = useRef(0);

  /**
   * Initialize the Web Worker
   */
  useEffect(() => {
    try {
      // Create worker from the worker file
      workerRef.current = new Worker(
        new URL('../workers/codeExecutor.js', import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      workerRef.current.onmessage = (event) => {
        const { id, type, ...result } = event.data;

        // Worker ready signal
        if (type === 'ready') {
          setIsWorkerReady(true);
          logSecurityEvent('worker_initialized', {
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Resolve pending promise
        if (id && pendingCallsRef.current[id]) {
          const { resolve, timeoutId } = pendingCallsRef.current[id];
          clearTimeout(timeoutId);
          delete pendingCallsRef.current[id];
          resolve(result);
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('[WORKER ERROR]', error);
        logSecurityEvent('worker_error', {
          message: error.message,
          timestamp: new Date().toISOString()
        });
      };

    } catch (error) {
      console.error('[WORKER INIT ERROR]', error);
      logSecurityEvent('worker_init_failed', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  /**
   * Execute code in the Web Worker sandbox
   * @param {string} code - JavaScript code to execute
   * @param {Object} options - { timeout, expectedOutput }
   * @returns {Promise<Object>} Execution result
   */
  const executeInWorker = useCallback((code, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = ++callIdRef.current;
      const timeout = options.timeout || parseInt(import.meta.env.VITE_CODE_EXEC_TIMEOUT) || 5000;

      // Set up timeout for the promise (backup in case worker doesn't respond)
      const timeoutId = setTimeout(() => {
        if (pendingCallsRef.current[id]) {
          delete pendingCallsRef.current[id];
          logSecurityEvent('worker_timeout', {
            id,
            timeout,
            timestamp: new Date().toISOString()
          });
          resolve({
            success: false,
            logs: [{ type: 'error', message: `❌ Worker timeout after ${timeout}ms` }],
            error: 'Worker timeout',
            timedOut: true,
          });
        }
      }, timeout + 1000); // Add 1s buffer for worker response

      // Store pending call
      pendingCallsRef.current[id] = { resolve, reject, timeoutId };

      // Send code to worker
      workerRef.current.postMessage({
        id,
        code,
        timeout,
        expectedOutput: options.expectedOutput,
      });
    });
  }, []);

  /**
   * Terminate the worker (for cleanup or restart)
   */
  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsWorkerReady(false);
      
      logSecurityEvent('worker_terminated', {
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return {
    executeInWorker,
    isWorkerReady,
    terminateWorker,
  };
};
