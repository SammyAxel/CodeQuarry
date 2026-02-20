/**
 * BootcampSchedulePage - Browse and register for upcoming bootcamp sessions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, Radio, ArrowRight, 
  Plus, CheckCircle2, XCircle, Tag, UserCheck, 
  Gem, MonitorPlay 
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { fetchSessions, enrollInSession, unenrollFromSession, fetchMyEnrollments } from '../api/bootcampApi';

export default function BootcampSchedulePage() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';

  const [sessions, setSessions] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'live', 'ended'

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, enrollmentsData] = await Promise.all([
        fetchSessions(filter === 'upcoming' ? null : filter),
        currentUser ? fetchMyEnrollments() : Promise.resolve([])
      ]);
      setSessions(sessionsData);
      setMyEnrollments(new Set(enrollmentsData.map(e => e.id)));
    } catch (err) {
      console.error('Error loading bootcamp data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (sessionId) => {
    try {
      await enrollInSession(sessionId);
      setMyEnrollments(prev => new Set([...prev, sessionId]));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnenroll = async (sessionId) => {
    try {
      await unenrollFromSession(sessionId);
      setMyEnrollments(prev => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleJoinClass = (sessionId) => {
    navigate(`/bootcamp/classroom/${sessionId}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold"><Radio className="w-3 h-3 animate-pulse" /> LIVE</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Scheduled</span>;
      case 'ended':
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold">Ended</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">CodeQuarry Bootcamp</h1>
              <p className="text-gray-400 text-sm">Live classes with real instructors. Learn interactively.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {['upcoming', 'live', 'ended'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {f === 'upcoming' ? 'Upcoming' : f === 'live' ? 'Live Now' : 'Past Sessions'}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/bootcamp/manage')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Manage Sessions
            </button>
          )}
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <MonitorPlay className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <div className="text-gray-400 text-lg font-bold mb-1">No sessions found</div>
            <div className="text-gray-600 text-sm">
              {filter === 'upcoming' ? 'Check back soon for new classes!' : 'No sessions match this filter.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => {
              const isEnrolled = myEnrollments.has(session.id);
              const isFull = session.enrollmentCount >= session.maxParticipants;
              const isLive = session.status === 'live';
              const isUpcoming = session.status === 'scheduled';

              return (
                <div
                  key={session.id}
                  className={`bg-gray-900/80 border rounded-xl p-5 flex flex-col transition-all hover:border-purple-500/30 ${
                    isLive ? 'border-red-500/30 shadow-lg shadow-red-500/10' : 'border-gray-800'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight flex-1 mr-2">{session.title}</h3>
                    {getStatusBadge(session.status)}
                  </div>

                  {/* Description */}
                  {session.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{session.description}</p>
                  )}

                  {/* Meta */}
                  <div className="space-y-1.5 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(session.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(session.scheduledAt)} • {session.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{session.instructorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{session.enrollmentCount || 0} / {session.maxParticipants} enrolled</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {session.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {session.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-gray-800">
                    {isLive && isEnrolled && (
                      <button
                        onClick={() => handleJoinClass(session.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition-colors animate-pulse"
                      >
                        <Radio className="w-4 h-4" /> Join Live Class
                      </button>
                    )}
                    {isUpcoming && !isEnrolled && !isFull && (
                      <button
                        onClick={() => handleEnroll(session.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Enroll
                      </button>
                    )}
                    {isUpcoming && isEnrolled && (
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600/20 text-green-400 rounded-lg font-bold text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Enrolled
                        </button>
                        <button
                          onClick={() => handleUnenroll(session.id)}
                          className="px-3 py-2.5 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg text-sm transition-colors"
                          title="Unenroll"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {isFull && !isEnrolled && (
                      <div className="text-center text-gray-500 text-sm font-bold py-2">Session Full</div>
                    )}
                    {session.status === 'ended' && session.recordingUrl && (
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-sm transition-colors text-gray-300"
                      >
                        <MonitorPlay className="w-4 h-4" /> Watch Recording
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
