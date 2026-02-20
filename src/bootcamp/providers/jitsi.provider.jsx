/**
 * Jitsi Meet Video Provider
 * Free, no API key required. Uses public meet.jit.si servers.
 * 
 * Upgrade path:
 * - Self-host Jitsi on a VPS for branding + reliability
 * - Or switch to 100ms/Daily by swapping the provider export
 */

import React, { useEffect, useRef, useState } from 'react';

const JITSI_DOMAIN = 'meet.jit.si';

/**
 * Jitsi video component — embeds the Jitsi Meet iframe via their External API
 * 
 * Props:
 *   roomId       - Unique room identifier
 *   displayName  - User's display name
 *   isInstructor - Whether the user is the instructor/admin
 *   onLeave      - Callback when user leaves the call
 *   sessionTitle - Title shown in the Jitsi toolbar
 */
function JitsiVideoComponent({ roomId, displayName, isInstructor, onLeave, sessionTitle }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load the Jitsi External API script dynamically
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = `https://${JITSI_DOMAIN}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!containerRef.current) return;

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: `CodeQuarry_${roomId}`,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: !isInstructor,
            startWithVideoMuted: !isInstructor,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            toolbarButtons: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'tileview', 'fullscreen',
              ...(isInstructor ? ['mute-everyone', 'recording'] : []),
            ],
            subject: sessionTitle || 'CodeQuarry Bootcamp',
            hideConferenceSubject: false,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#0d1117',
            TOOLBAR_ALWAYS_VISIBLE: true,
            FILM_STRIP_MAX_HEIGHT: 120,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
          },
          userInfo: {
            displayName: displayName || 'Student',
          },
        });

        apiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          setIsLoading(false);
        });

        api.addEventListener('videoConferenceLeft', () => {
          onLeave?.();
        });

        api.addEventListener('readyToClose', () => {
          onLeave?.();
        });

      } catch (err) {
        console.error('Jitsi initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomId, displayName, isInstructor, sessionTitle]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl border border-red-500/30">
        <div className="text-center p-6">
          <div className="text-red-400 text-lg font-bold mb-2">Failed to load video</div>
          <div className="text-gray-400 text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/20">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-purple-400 font-bold">Connecting to class...</div>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

/**
 * Exported provider object
 */
export const JitsiProvider = {
  name: 'jitsi',
  VideoComponent: JitsiVideoComponent,
  generateRoomName: (sessionId) => `cq-bootcamp-${sessionId}-${Date.now()}`,
};
