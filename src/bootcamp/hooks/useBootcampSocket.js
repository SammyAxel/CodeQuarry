/**
 * Bootcamp WebSocket Hook
 * Manages WebSocket connection for live bootcamp sessions
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useBootcampSocket(sessionId, user, isAdmin = false) {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const connect = useCallback(() => {
    if (!sessionId || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsHost = API_URL.replace(/^https?:\/\//, '');
    const wsUrl = `${protocol}//${wsHost}/ws/bootcamp?sessionId=${sessionId}&userId=${user.id}&username=${encodeURIComponent(user.displayName || user.username)}&role=${isAdmin ? 'admin' : 'student'}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, WS_RECONNECT_DELAY);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [sessionId, user, isAdmin]);

  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'participants_list':
        setParticipants(message.participants);
        break;

      case 'participant_joined':
        setParticipants(prev => {
          if (prev.find(p => p.userId === message.userId)) return prev;
          return [...prev, { userId: message.userId, username: message.username, role: message.role }];
        });
        break;

      case 'participant_left':
        setParticipants(prev => prev.filter(p => p.userId !== message.userId));
        break;

      case 'chat':
        setChatMessages(prev => [...prev, {
          userId: message.userId,
          username: message.username,
          role: message.role,
          text: message.text,
          timestamp: message.timestamp
        }]);
        break;

      case 'interaction_triggered':
        setActiveInteraction(message.interaction);
        break;

      case 'interaction_closed':
        setActiveInteraction(null);
        break;

      case 'response_received':
        // Admin receives student responses — emit custom event for listeners
        window.dispatchEvent(new CustomEvent('bootcamp:response', { detail: message }));
        break;

      case 'typing':
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== message.userId);
          return [...filtered, { userId: message.userId, username: message.username }];
        });
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== message.userId));
        }, 3000);
        break;

      case 'session_status':
        window.dispatchEvent(new CustomEvent('bootcamp:session_status', { detail: message }));
        break;
    }
  }, []);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Convenience methods
  const sendChat = useCallback((text) => {
    sendMessage({ type: 'chat', text });
  }, [sendMessage]);

  const triggerInteraction = useCallback((interaction) => {
    sendMessage({ type: 'trigger_interaction', interaction });
  }, [sendMessage]);

  const closeInteraction = useCallback((interactionId) => {
    sendMessage({ type: 'close_interaction', interactionId });
  }, [sendMessage]);

  const submitResponse = useCallback((interactionId, response) => {
    sendMessage({ type: 'submit_response', interactionId, response });
  }, [sendMessage]);

  const sendTyping = useCallback(() => {
    sendMessage({ type: 'typing' });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    participants,
    chatMessages,
    activeInteraction,
    typingUsers,
    sendChat,
    triggerInteraction,
    closeInteraction,
    submitResponse,
    sendTyping
  };
}
