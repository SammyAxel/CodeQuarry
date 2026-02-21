/**
 * 100ms Video Provider
 * Uses @100mslive/react-sdk for high-quality video conferencing.
 * 
 * Requirements:
 *   - VITE_100MS_TEMPLATE_ID in .env (from 100ms dashboard)
 *   - Backend endpoint to generate auth tokens via 100ms Server API
 * 
 * Free tier: 10,000 participant-minutes/month
 */

import React, { useEffect, useState } from 'react';
import {
  HMSRoomProvider,
  useHMSStore,
  useHMSActions,
  useHMSNotifications,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectLocalPeer,
  selectDominantSpeaker,
  HMSNotificationTypes
} from '@100mslive/react-sdk';

const HMS_TEMPLATE_ID = import.meta.env.VITE_100MS_TEMPLATE_ID || '';

/**
 * Inner component that uses HMS hooks (must be inside HMSRoomProvider)
 */
function HMSRoom({ roomId, displayName, isInstructor, onLeave, sessionTitle }) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const localPeer = useHMSStore(selectLocalPeer);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);

  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState(null);
  const notification = useHMSNotifications();

  // Listen for HMS error notifications
  useEffect(() => {
    if (!notification) return;
    if (notification.type === HMSNotificationTypes.ERROR) {
      const msg = notification.data?.message || notification.data?.description || 'Connection error';
      console.error('100ms notification error:', notification.data);
      setError(msg);
      setIsJoining(false);
    }
  }, [notification]);

  // Set connected once HMS reports connected
  useEffect(() => {
    if (isConnected) {
      setIsJoining(false);
    }
  }, [isConnected]);

  // Join on mount
  useEffect(() => {
    let timeout;
    const join = async () => {
      try {
        // Get auth token from our backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/api/bootcamp/100ms/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-user-token': token } : {})
          },
          body: JSON.stringify({
            roomId,
            role: isInstructor ? 'host' : 'guest',
            userName: displayName
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to get token');
        }

        const { authToken } = await res.json();

        // 20 second timeout — HMS errors come via notifications, not rejections
        timeout = setTimeout(() => {
          setError('Connection timed out. Check your 100ms credentials or room config.');
          setIsJoining(false);
        }, 20000);

        await hmsActions.join({
          authToken,
          userName: displayName || 'Student',
          settings: {
            isAudioMuted: !isInstructor,
            isVideoMuted: !isInstructor
          }
        });

        clearTimeout(timeout);
        setIsJoining(false);
      } catch (err) {
        clearTimeout(timeout);
        console.error('100ms join error:', err);
        setError(err.message);
        setIsJoining(false);
      }
    };

    join();

    return () => {
      clearTimeout(timeout);
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, []);

  const handleLeave = async () => {
    await hmsActions.leave();
    onLeave?.();
  };

  const toggleAudio = () => hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  const toggleVideo = () => hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  const toggleScreenShare = () => {
    hmsActions.setScreenShareEnabled(true).catch(console.error);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl border border-red-500/30">
        <div className="text-center p-6">
          <div className="text-red-400 text-lg font-bold mb-2">Failed to join class</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-purple-400 font-bold">Connecting to class...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-xl overflow-hidden border border-purple-500/20">
      {/* Main Host Video */}
      <div className="flex-1 relative overflow-hidden">
        {(() => {
          const hostPeer = peers.find(p => p.roleName === 'host' || p.roleName === 'broadcaster');
          const guestPeers = peers.filter(p => p.roleName !== 'host' && p.roleName !== 'broadcaster');
          
          return (
            <>
              {/* Host takes full stage */}
              {hostPeer ? (
                <div className="w-full h-full">
                  <PeerTile
                    peer={hostPeer}
                    isLocal={hostPeer.id === localPeer?.id}
                    isDominant={true}
                    isLarge={true}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-gray-500 text-sm">Waiting for instructor...</div>
                </div>
              )}

              {/* Participant thumbnails strip (host sees all, participants hidden from each other) */}
              {isInstructor && guestPeers.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {guestPeers.map((peer) => (
                    <div key={peer.id} className="w-28 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-700/50 shadow-lg">
                      <PeerTile
                        peer={peer}
                        isLocal={peer.id === localPeer?.id}
                        isDominant={dominantSpeaker?.id === peer.id}
                        isLarge={false}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Self-view for participants (small corner) */}
              {!isInstructor && localPeer && (
                <div className="absolute bottom-2 right-2 w-36 h-24 rounded-lg overflow-hidden border border-purple-500/30 shadow-lg">
                  <PeerTile
                    peer={localPeer}
                    isLocal={true}
                    isDominant={false}
                    isLarge={false}
                  />
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Controls Bar */}
      <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-3 px-4 shrink-0">
        <button
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isLocalAudioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={isLocalAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isLocalAudioEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isLocalVideoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={isLocalVideoEnabled ? 'Camera off' : 'Camera on'}
        >
          {isLocalVideoEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          )}
        </button>

        {isInstructor && (
          <button
            onClick={toggleScreenShare}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
            title="Share screen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
        )}

        <div className="w-px h-8 bg-gray-700 mx-1"></div>

        <button
          onClick={handleLeave}
          className="px-4 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Leave
        </button>
      </div>
    </div>
  );
}

/**
 * Individual peer video tile
 */
function PeerTile({ peer, isLocal, isDominant, isLarge = true }) {
  const videoRef = React.useRef(null);
  const hmsActions = useHMSActions();

  useEffect(() => {
    if (videoRef.current && peer.videoTrack) {
      hmsActions.attachVideo(peer.videoTrack, videoRef.current);
    }
    return () => {
      if (videoRef.current && peer.videoTrack) {
        hmsActions.detachVideo(peer.videoTrack, videoRef.current);
      }
    };
  }, [peer.videoTrack, hmsActions]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden border transition-all ${
      isDominant ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-800'
    }`}>
      {peer.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`${isLarge ? 'w-16 h-16 text-2xl' : 'w-8 h-8 text-sm'} rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-purple-300`}>
            {(peer.name || '?')[0].toUpperCase()}
          </div>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <span className={`px-1.5 py-0.5 bg-black/60 rounded ${isLarge ? 'text-xs' : 'text-[10px]'} text-white font-medium truncate`}>
          {peer.name}{isLocal ? ' (You)' : ''}
          {(peer.roleName === 'host' || peer.roleName === 'broadcaster') && ' ★'}
        </span>
        <div className="flex gap-1">
          {!peer.isAudioEnabled && (
            <span className="w-5 h-5 bg-red-600/80 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component with HMSRoomProvider
 */
function HundredMsVideoComponent(props) {
  return (
    <HMSRoomProvider>
      <HMSRoom {...props} />
    </HMSRoomProvider>
  );
}

/**
 * Exported provider object
 */
export const HundredMsProvider = {
  name: '100ms',
  VideoComponent: HundredMsVideoComponent,
  generateRoomName: (sessionId) => `cq-bootcamp-${sessionId}`,
};
