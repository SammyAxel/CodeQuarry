/**
 * BootcampSchedulePage - Browse and register for bootcamp programs & free events
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, Radio, Plus, CheckCircle2, XCircle,
  UserCheck, MonitorPlay, BookOpen, Star, Loader2, AlertCircle,
  GraduationCap, Layers
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { fetchSessions, enrollInSession, unenrollFromSession, fetchMyEnrollments } from '../api/bootcampApi';
import { fetchBatches, fetchMyBatchEnrollments } from '../api/batchApi';
import { EnrollModal } from '../components/EnrollModal';

const IDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function BootcampSchedulePage() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';

  const [tab, setTab] = useState('programs'); // 'programs' | 'free-events' | 'my-classes'

  // â”€â”€ Programs (batch) state â”€â”€
  const [batches, setBatches] = useState([]);
  const [batchEnrollments, setBatchEnrollments] = useState({}); // batchId â†’ enrollment object
  const [selectedBatch, setSelectedBatch] = useState(null); // open EnrollModal

  // â”€â”€ Free Events (session) state â”€â”€
  const [sessions, setSessions] = useState([]);
  const [mySessionEnrollments, setMySessionEnrollments] = useState(new Set());
  const [sessionFilter, setSessionFilter] = useState('upcoming');

  // â”€â”€ My Classes state â”€â”€
  const [myBatchEnrollments, setMyBatchEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data whenever tab or filter changes
  useEffect(() => {
    loadTabData();
  }, [tab, sessionFilter]);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'programs') {
        const [batchData, myEnrollData] = await Promise.all([
          fetchBatches(),
          currentUser ? fetchMyBatchEnrollments() : Promise.resolve([])
        ]);
        setBatches(batchData);
        const map = {};
        myEnrollData.forEach(e => { map[e.batchId] = e; });
        setBatchEnrollments(map);
      } else if (tab === 'free-events') {
        const [sessionsData, enrollmentsData] = await Promise.all([
          fetchSessions(sessionFilter === 'upcoming' ? null : sessionFilter),
          currentUser ? fetchMyEnrollments() : Promise.resolve([])
        ]);
        setSessions(sessionsData);
        setMySessionEnrollments(new Set(enrollmentsData.map(e => e.id)));
      } else if (tab === 'my-classes') {
        const data = currentUser ? await fetchMyBatchEnrollments() : [];
        setMyBatchEnrollments(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, sessionFilter, currentUser]);

  // â”€â”€ Session handlers â”€â”€
  const handleEnrollSession = async (sessionId) => {
    try {
      await enrollInSession(sessionId);
      setMySessionEnrollments(prev => new Set([...prev, sessionId]));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnenrollSession = async (sessionId) => {
    try {
      await unenrollFromSession(sessionId);
      setMySessionEnrollments(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
    } catch (err) {
      alert(err.message);
    }
  };

  // â”€â”€ Helpers â”€â”€
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status) => {
    const map = {
      live:      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold"><Radio className="w-3 h-3 animate-pulse" />LIVE</span>,
      scheduled: <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Scheduled</span>,
      ended:     <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold">Ended</span>,
      cancelled: <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Cancelled</span>,
    };
    return map[status] || null;
  };

  const getBatchStatusBadge = (status) => {
    const map = {
      open:      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Open</span>,
      closed:    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold">Closed</span>,
      full:      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">Full</span>,
      cancelled: <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Cancelled</span>,
    };
    return map[status] || null;
  };

  const getPaymentBadge = (status) => {
    const map = {
      paid:     <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Enrolled âœ“</span>,
      pending:  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">Pending â³</span>,
      rejected: <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Rejected</span>,
    };
    return map[status] || null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">CodeQuarry Bootcamp</h1>
              <p className="text-gray-400 text-sm">Structured programs and live interactive classes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Tabs + toolbar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
            {[
              { key: 'programs',    label: 'Programs',    Icon: GraduationCap },
              { key: 'free-events', label: 'Free Events', Icon: Calendar },
              { key: 'my-classes',  label: 'My Classes',  Icon: BookOpen },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            {/* Session filter â€” only visible on free events tab */}
            {tab === 'free-events' && ['upcoming','live','ended'].map((f) => (
              <button
                key={f}
                onClick={() => setSessionFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sessionFilter === f ? 'bg-purple-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {f === 'upcoming' ? 'Upcoming' : f === 'live' ? 'Live' : 'Past'}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate('/bootcamp/manage')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-bold transition-colors"
              >
                <Plus className="w-4 h-4" /> Manage
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* â”€â”€ PROGRAMS TAB â”€â”€ */}
            {tab === 'programs' && (
              <>
                {batches.length === 0 ? (
                  <div className="text-center py-20">
                    <GraduationCap className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg font-bold mb-1">No programs available yet</div>
                    <div className="text-gray-600 text-sm">Check back soon for upcoming batches!</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {batches.map((batch) => {
                      const enrollment = batchEnrollments[batch.id];
                      const paymentStatus = enrollment?.paymentStatus;
                      const canEnroll = !paymentStatus && batch.status === 'open';

                      return (
                        <div
                          key={batch.id}
                          className={`bg-gray-900/80 border rounded-xl p-5 flex flex-col transition-all hover:border-purple-500/40 ${
                            paymentStatus === 'paid' ? 'border-green-600/30' : 'border-gray-800'
                          }`}
                        >
                          {/* Top */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 mr-2">
                              <h3 className="font-black text-white text-lg leading-tight mb-1">{batch.title}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getBatchStatusBadge(batch.status)}
                                {paymentStatus && getPaymentBadge(paymentStatus)}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xl font-black text-purple-300">{IDR(batch.price)}</div>
                            </div>
                          </div>

                          {batch.description && (
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{batch.description}</p>
                          )}

                          {/* Meta */}
                          <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                            {batch.instructorName && (
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{batch.instructorName}</span>
                              </div>
                            )}
                            {batch.startDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(batch.startDate)}{batch.endDate ? ` â€“ ${formatDate(batch.endDate)}` : ''}</span>
                              </div>
                            )}
                            {batch.sessionCount > 0 && (
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{batch.sessionCount} sessions</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" />
                              <span>{batch.enrollmentCount || 0} / {batch.maxParticipants} enrolled</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {batch.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {batch.tags.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-xs">{t}</span>
                              ))}
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-auto pt-3 border-t border-gray-800">
                            {paymentStatus === 'paid' && (
                              <button
                                onClick={() => navigate(`/bootcamp/batch/${batch.id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-colors"
                              >
                                <MonitorPlay className="w-4 h-4" /> View My Sessions
                              </button>
                            )}
                            {paymentStatus === 'pending' && (
                              <div className="text-center py-2 text-yellow-400 text-sm font-bold">
                                Awaiting payment confirmationâ€¦
                              </div>
                            )}
                            {paymentStatus === 'rejected' && (
                              <button
                                onClick={() => setSelectedBatch(batch)}
                                className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
                              >
                                Try Again
                              </button>
                            )}
                            {canEnroll && (
                              <button
                                onClick={() => setSelectedBatch(batch)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
                              >
                                <Star className="w-4 h-4" /> Enroll Now
                              </button>
                            )}
                            {!canEnroll && !paymentStatus && batch.status !== 'open' && (
                              <div className="text-center py-2 text-gray-500 text-sm font-bold">Enrollment Closed</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* â”€â”€ FREE EVENTS TAB â”€â”€ */}
            {tab === 'free-events' && (
              <>
                {sessions.length === 0 ? (
                  <div className="text-center py-20">
                    <MonitorPlay className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg font-bold mb-1">No sessions found</div>
                    <div className="text-gray-600 text-sm">
                      {sessionFilter === 'upcoming' ? 'Check back for new free events!' : 'No sessions match this filter.'}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session) => {
                      const isEnrolled = mySessionEnrollments.has(session.id);
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
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-white text-lg leading-tight flex-1 mr-2">{session.title}</h3>
                            {getStatusBadge(session.status)}
                          </div>
                          {session.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{session.description}</p>
                          )}
                          <div className="space-y-1.5 mb-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /><span>{formatDate(session.scheduledAt)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>{formatTime(session.scheduledAt)} Â· {session.durationMinutes} min</span></div>
                            {session.instructorName && <div className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5" /><span>{session.instructorName}</span></div>}
                            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /><span>{session.enrollmentCount || 0} / {session.maxParticipants}</span></div>
                          </div>
                          {session.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {session.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-xs">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="mt-auto pt-3 border-t border-gray-800">
                            {isLive && isEnrolled && (
                              <button onClick={() => navigate(`/bootcamp/classroom/${session.id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition-colors animate-pulse">
                                <Radio className="w-4 h-4" /> Join Live Class
                              </button>
                            )}
                            {isUpcoming && !isEnrolled && !isFull && (
                              <button onClick={() => handleEnrollSession(session.id)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">
                                <Plus className="w-4 h-4" /> Enroll (Free)
                              </button>
                            )}
                            {isUpcoming && isEnrolled && (
                              <div className="flex gap-2">
                                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600/20 text-green-400 rounded-lg font-bold text-sm">
                                  <CheckCircle2 className="w-4 h-4" /> Enrolled
                                </div>
                                <button onClick={() => handleUnenrollSession(session.id)}
                                  className="px-3 py-2.5 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" title="Unenroll">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {isFull && !isEnrolled && (
                              <div className="text-center text-gray-500 text-sm font-bold py-2">Session Full</div>
                            )}
                            {session.status === 'ended' && session.recordingUrl && (
                              <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-sm transition-colors text-gray-300">
                                <MonitorPlay className="w-4 h-4" /> Watch Recording
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* â”€â”€ MY CLASSES TAB â”€â”€ */}
            {tab === 'my-classes' && (
              <>
                {!currentUser ? (
                  <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg font-bold mb-1">Sign in to see your classes</div>
                  </div>
                ) : myBatchEnrollments.length === 0 ? (
                  <div className="text-center py-20">
                    <GraduationCap className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg font-bold mb-1">No enrollments yet</div>
                    <div className="text-gray-600 text-sm">Enroll in a program to see it here.</div>
                    <button onClick={() => setTab('programs')}
                      className="mt-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold transition-colors">
                      Browse Programs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBatchEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-white text-lg">{enrollment.batchTitle || `Batch #${enrollment.batchId}`}</span>
                            {getPaymentBadge(enrollment.paymentStatus)}
                          </div>
                          {/* Extra batch info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            {enrollment.batchInstructor && (
                              <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> {enrollment.batchInstructor}</span>
                            )}
                            {enrollment.batchStartDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(enrollment.batchStartDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                {enrollment.batchEndDate && ` – ${new Date(enrollment.batchEndDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                              </span>
                            )}
                            {enrollment.sessionCount > 0 && (
                              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {enrollment.sessionCount} session{enrollment.sessionCount !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                          {/* Next session callout */}
                          {enrollment.paymentStatus === 'paid' && enrollment.nextSessionAt && (
                            <div className="mt-2 text-xs text-blue-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Next: {new Date(enrollment.nextSessionAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} at {new Date(enrollment.nextSessionAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 mt-1.5">
                            Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {enrollment.paymentMethod === 'manual' && <span className="ml-2">· Bank Transfer</span>}
                          </div>
                          {enrollment.paymentStatus === 'rejected' && enrollment.rejectedReason && (
                            <div className="mt-1 text-xs text-red-400">Reason: {enrollment.rejectedReason}</div>
                          )}
                          {enrollment.batchTags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {enrollment.batchTags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded text-xs">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {enrollment.paymentStatus === 'paid' && (
                            <button
                              onClick={() => navigate(`/bootcamp/batch/${enrollment.batchId}`)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
                            >
                              <MonitorPlay className="w-4 h-4" /> My Sessions
                            </button>
                          )}
                          {enrollment.paymentStatus === 'pending' && (
                            <div className="text-sm text-yellow-400 font-bold">Waiting for confirmation…</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Enroll Modal */}
      {selectedBatch && (
        <EnrollModal
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onEnrolled={() => {
            setSelectedBatch(null);
            loadTabData();
          }}
        />
      )}
    </div>
  );
}

// â”€â”€ end of file â”€â”€
