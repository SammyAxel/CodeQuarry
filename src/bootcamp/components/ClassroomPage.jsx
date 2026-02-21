/**
 * ClassroomPage - Live Bootcamp Session View
 * Combines video (Jitsi), chat, and interactive panels (quiz/code editor)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Users, MessageSquare, MonitorPlay, 
  Code2, HelpCircle, Radio, WifiOff, X, 
  ChevronRight, ChevronLeft, Send, ClipboardList, Heart
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { VideoProvider } from '../providers/index.js';
import { useBootcampSocket } from '../hooks/useBootcampSocket';
import { fetchSession, joinSession } from '../api/bootcampApi';
import { ClassroomChat } from './ClassroomChat';
import { ClassroomInteraction } from './ClassroomInteraction';
import { InstructorControls } from './InstructorControls';
import { ResponsesPanel } from './ResponsesPanel';

export default function ClassroomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.pathname.split('/').pop();
  const { currentUser } = useUser();
  
  const [session, setSession] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidePanel, setSidePanel] = useState('chat'); // 'chat', 'participants', 'interaction', 'responses', null
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [responses, setResponses] = useState([]); // real-time responses for host

  const isAdmin = currentUser?.role === 'admin';

  // WebSocket connection
  const {
    isConnected,
    participants,
    chatMessages,
    activeInteraction,
    typingUsers,
    sendChat,
    triggerInteraction,
    closeInteraction,
    submitResponse,
    sendTyping,
    sendSessionStatus
  } = useBootcampSocket(sessionId, currentUser, isAdmin);

  // Load session and join
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const sess = await fetchSession(sessionId);
        setSession(sess);

        // Join the session
        const room = await joinSession(sessionId);
        setRoomInfo(room);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [sessionId]);

  // Auto-open interaction panel when admin triggers one
  useEffect(() => {
    if (activeInteraction) {
      setSidePanel('interaction');
      setIsPanelOpen(true);
      // Clear old responses when a new interaction starts
      setResponses([]);
    }
  }, [activeInteraction]);

  // Listen for student responses (host only)
  useEffect(() => {
    if (!isAdmin) return;
    const handleResponse = (e) => {
      const resp = e.detail;
      setResponses(prev => [...prev, resp]);
    };
    window.addEventListener('bootcamp:response', handleResponse);
    return () => window.removeEventListener('bootcamp:response', handleResponse);
  }, [isAdmin]);

  // Listen for session ended (participants get kicked)
  useEffect(() => {
    const handleSessionStatus = (e) => {
      if (e.detail?.status === 'ended') {
        setSessionEnded(true);
      }
    };
    window.addEventListener('bootcamp:session_status', handleSessionStatus);
    return () => window.removeEventListener('bootcamp:session_status', handleSessionStatus);
  }, []);

  const handleLeaveClass = useCallback(() => {
    navigate('/bootcamp');
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-purple-400 font-bold text-lg">Joining class...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900 rounded-xl border border-red-500/30 max-w-md">
          <div className="text-red-400 text-xl font-bold mb-2">Cannot join class</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => navigate('/bootcamp')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  // Session ended screen for participants (host stays to see results)
  if (sessionEnded && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center p-10 bg-gray-900 rounded-2xl border border-purple-500/30 max-w-md">
          <Heart className="w-14 h-14 text-purple-400 mx-auto mb-4" />
          <div className="text-2xl font-bold text-white mb-2">Session Ended</div>
          <div className="text-gray-400 mb-2">Thank you for attending!</div>
          <div className="text-gray-600 text-sm mb-6">{session?.title}</div>
          <button
            onClick={() => navigate('/bootcamp')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors text-white"
          >
            Back to Bootcamp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d1117] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-purple-500/20 bg-gradient-to-r from-[#0d1117] via-purple-950/20 to-[#0d1117] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveClass}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Leave class"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${session?.status === 'live' ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
            <span className="font-bold text-sm truncate max-w-[300px]">{session?.title}</span>
          </div>
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-full">
            {session?.instructorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          {isConnected ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span> Live
            </span>
          ) : (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Reconnecting...
            </span>
          )}

          <div className="w-px h-6 bg-gray-700 mx-1"></div>

          {/* Panel toggles */}
          <button
            onClick={() => { setSidePanel('participants'); setIsPanelOpen(true); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sidePanel === 'participants' && isPanelOpen ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> {participants.length}
          </button>
          <button
            onClick={() => { setSidePanel('chat'); setIsPanelOpen(true); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sidePanel === 'chat' && isPanelOpen ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
          {activeInteraction && (
            <button
              onClick={() => { setSidePanel('interaction'); setIsPanelOpen(true); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors animate-pulse ${
                sidePanel === 'interaction' && isPanelOpen ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-900/30'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Activity
            </button>
          )}
          {/* Responses tab - host only */}
          {isAdmin && (
            <button
              onClick={() => { setSidePanel('responses'); setIsPanelOpen(true); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                sidePanel === 'responses' && isPanelOpen ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Responses {responses.length > 0 ? `(${responses.length})` : ''}
            </button>
          )}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            {isPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 flex flex-col p-3 gap-3 transition-all ${isPanelOpen ? '' : ''}`}>
          {/* Video Feed */}
          <div className="flex-1 rounded-xl overflow-hidden">
            {roomInfo && (
              <VideoProvider.VideoComponent
                roomId={roomInfo.roomId}
                displayName={currentUser?.displayName || currentUser?.username}
                isInstructor={isAdmin}
                onLeave={handleLeaveClass}
                sessionTitle={session?.title}
              />
            )}
          </div>

          {/* Instructor Controls (admin only) */}
          {isAdmin && (
            <InstructorControls
              sessionId={parseInt(sessionId)}
              session={session}
              setSession={setSession}
              triggerInteraction={triggerInteraction}
              closeInteraction={closeInteraction}
              activeInteraction={activeInteraction}
              sendSessionStatus={sendSessionStatus}
            />
          )}
        </div>

        {/* Side Panel */}
        {isPanelOpen && (
          <div className="w-[360px] border-l border-purple-500/20 bg-gray-900/50 flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="h-10 border-b border-gray-800 px-3 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold text-gray-300 capitalize">{sidePanel}</span>
              <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {sidePanel === 'chat' && (
                <ClassroomChat
                  messages={chatMessages}
                  onSend={sendChat}
                  onTyping={sendTyping}
                  typingUsers={typingUsers}
                  currentUserId={currentUser?.id}
                />
              )}
              {sidePanel === 'participants' && (
                <div className="p-3 space-y-1 overflow-y-auto h-full">
                  {participants.map((p) => (
                    <div key={p.userId} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/50">
                      <div className={`w-2 h-2 rounded-full ${p.role === 'admin' ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                      <span className="text-sm text-gray-300">{p.username}</span>
                      {p.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">INSTRUCTOR</span>
                      )}
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">No participants yet</div>
                  )}
                </div>
              )}
              {sidePanel === 'interaction' && activeInteraction && (
                <ClassroomInteraction
                  interaction={activeInteraction}
                  onSubmit={submitResponse}
                  isAdmin={isAdmin}
                  onClose={() => closeInteraction(activeInteraction.id)}
                />
              )}
              {sidePanel === 'responses' && isAdmin && (
                <ResponsesPanel
                  responses={responses}
                  activeInteraction={activeInteraction}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
