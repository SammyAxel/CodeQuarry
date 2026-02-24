/**
 * BatchDetailPage — Session list for enrolled (paid) users of a batch
 * Route: /bootcamp/batch/:id
 *
 * Shows all sessions belonging to the batch with:
 *   - Join Live button for live sessions
 *   - Watch Recording for ended sessions with a recordingUrl
 *   - Schedule overview (date, time, duration)
 *   - Redirects to /bootcamp if user is not a paid enrollee
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, Radio, MonitorPlay,
  PlayCircle, CheckCircle2, Loader2, AlertCircle, GraduationCap,
  Lock, Video
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { fetchBatch, fetchBatchEnrollment, fetchBatchAttendance } from '../api/batchApi';

const IDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function BatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [batch, setBatch] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadBatch();
  }, [id]);

  const loadBatch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [batchData, enrollmentData] = await Promise.all([
        fetchBatch(parseInt(id)),
        currentUser ? fetchBatchEnrollment(parseInt(id)) : Promise.resolve(null),
      ]);

      setBatch(batchData);
      setEnrollment(enrollmentData);

      // If not admin and not paid, redirect
      if (!isAdmin && enrollmentData?.paymentStatus !== 'paid') {
        navigate('/bootcamp', { replace: true });
        return;
      }

      // Fetch attendance for paid users
      if (currentUser && enrollmentData?.paymentStatus === 'paid') {
        try {
          const att = await fetchBatchAttendance(parseInt(id));
          const map = {};
          att.forEach(a => { map[a.sessionId] = a; });
          setAttendanceMap(map);
        } catch { /* non-critical */ }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser, isAdmin, navigate]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status) => {
    const map = {
      live: (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
          <Radio className="w-3 h-3 animate-pulse" /> LIVE
        </span>
      ),
      scheduled: (
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Upcoming</span>
      ),
      ended: (
        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold">Ended</span>
      ),
      cancelled: (
        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Cancelled</span>
      ),
    };
    return map[status] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900 rounded-xl border border-red-500/30 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <div className="text-red-400 text-lg font-bold mb-2">
            {error || 'Batch not found'}
          </div>
          <button
            onClick={() => navigate('/bootcamp')}
            className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
          >
            Back to Bootcamp
          </button>
        </div>
      </div>
    );
  }

  const sessions = batch.sessions || [];
  const liveSessions = sessions.filter((s) => s.status === 'live');
  const upcomingSessions = sessions.filter((s) => s.status === 'scheduled');
  const endedSessions = sessions.filter((s) => s.status === 'ended');
  const nextSession = upcomingSessions[0];

  // Attendance summary
  const endedOrLiveCount = sessions.filter(s => s.status === 'ended' || s.status === 'live').length;
  const attendedCount = Object.values(attendanceMap).filter(a => a.attended).length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20" />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate('/bootcamp')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Bootcamp
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black mb-1">{batch.title}</h1>
              {batch.description && (
                <p className="text-gray-400 text-sm mb-3">{batch.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {batch.instructorName && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {batch.instructorName}
                  </span>
                )}
                {batch.startDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(batch.startDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    {batch.endDate && ` – ${new Date(batch.endDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MonitorPlay className="w-3.5 h-3.5" /> {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </span>
                <span className="text-purple-300 font-bold">{IDR(batch.price)}</span>
                {endedOrLiveCount > 0 && (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {attendedCount}/{endedOrLiveCount} attended
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Next session callout */}
          {nextSession && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
              <div className="text-xs text-blue-400 font-bold mb-1">NEXT SESSION</div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-white">{nextSession.title}</span>
                  <span className="text-gray-400 text-sm ml-3">
                    {formatDate(nextSession.scheduled_at)} · {formatTime(nextSession.scheduled_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live session banner */}
          {liveSessions.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-xl animate-pulse">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <Radio className="w-4 h-4" /> LIVE NOW
              </div>
              {liveSessions.map((ls) => (
                <div key={ls.id} className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-white">{ls.title}</span>
                  <button
                    onClick={() => navigate(`/bootcamp/classroom/${ls.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Radio className="w-4 h-4" /> Join Live Class
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {sessions.length === 0 ? (
          <div className="text-center py-20">
            <MonitorPlay className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <div className="text-gray-400 text-lg font-bold mb-1">No sessions yet</div>
            <div className="text-gray-600 text-sm">
              The instructor hasn't scheduled any sessions for this batch yet.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-300 mb-4">
              All Sessions ({sessions.length})
            </h2>
            {sessions.map((session, idx) => {
              const isLive = session.status === 'live';
              const isEnded = session.status === 'ended';
              const isScheduled = session.status === 'scheduled';
              const hasRecording = isEnded && session.recording_url;
              const attended = attendanceMap[session.id]?.attended;

              return (
                <div
                  key={session.id}
                  className={`bg-gray-900/80 border rounded-xl p-5 transition-all ${
                    isLive
                      ? 'border-red-500/30 shadow-lg shadow-red-500/10'
                      : 'border-gray-800 hover:border-purple-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-600 font-bold w-7">#{idx + 1}</span>
                        <h3 className="font-bold text-white">{session.title}</h3>
                        {getStatusBadge(session.status)}
                        {attended && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Attended
                          </span>
                        )}
                      </div>
                      {session.description && (
                        <p className="text-gray-500 text-sm mb-2 ml-9">{session.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 ml-9">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(session.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(session.scheduled_at)} · {session.duration_minutes} min
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isLive && (
                        <button
                          onClick={() => navigate(`/bootcamp/classroom/${session.id}`)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition-colors"
                        >
                          <Radio className="w-4 h-4 animate-pulse" /> Join Live
                        </button>
                      )}
                      {hasRecording && (
                        <a
                          href={session.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg font-bold text-sm transition-colors"
                        >
                          <Video className="w-4 h-4" /> Watch Recording
                        </a>
                      )}
                      {isEnded && !hasRecording && (
                        <span className="text-xs text-gray-600 font-bold">Completed</span>
                      )}
                      {isScheduled && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-400/60 font-bold">
                          <Clock className="w-3.5 h-3.5" /> Scheduled
                        </span>
                      )}
                    </div>
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
