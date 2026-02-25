/**
 * BootcampManagePage - Admin page for managing sessions, batches, and payments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Calendar, Clock, Users, Trash2, 
  Radio, Square, Edit3, Save, X, MonitorPlay,
  GraduationCap, CreditCard, CheckCircle2, XCircle,
  Loader2, AlertCircle, Award, Download
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { 
  fetchSessions, createSession, updateSession, deleteSession, 
  goLive, endSession, fetchSessionEnrollments 
} from '../api/bootcampApi';
import {
  fetchBatches, createBatch, updateBatch, deleteBatch,
  fetchPendingEnrollments, approveEnrollment, rejectEnrollment,
  refundEnrollment, fetchBatchEnrollments,
  fetchCertificateTemplate, saveCertificateTemplate,
  fetchEligibleStudents, issueCertificates, fetchBatchCertificates,
  getCertificatePdfUrl,
} from '../api/batchApi';

const IDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function BootcampManagePage() {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [tab, setTab] = useState('sessions'); // 'sessions' | 'batches' | 'payments'

  // â”€â”€ Sessions state â”€â”€
  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [viewEnrollments, setViewEnrollments] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  // â”€â”€ Batches state â”€â”€
  const [batches, setBatches] = useState([]);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);

  // â”€â”€ Payments state â”€â”€
  const [pendingPayments, setPendingPayments] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // ââ Batch enrollees state ââ
  const [viewBatchEnrollees, setViewBatchEnrollees] = useState(null);
  const [batchEnrollees, setBatchEnrollees] = useState([]);
  const [refundingId, setRefundingId] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Shared form state (reused for session & batch create/edit)
  const [sessionForm, setSessionForm] = useState({
    title: '', description: '', scheduledAt: '', durationMinutes: 75,
    maxParticipants: 50, tags: '', batchId: '', recordingUrl: ''
  });
  const [batchForm, setBatchForm] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '',
    maxParticipants: 30, status: 'open', tags: '',
    bankName: '', bankAccount: '', bankAccountName: ''
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') { navigate('/bootcamp'); return; }
    loadTab();
  }, [tab]);

  const loadTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Always fetch batches so the batch-selector dropdown has data
      const batchData = await fetchBatches(true);
      setBatches(batchData);

      if (tab === 'sessions') {
        const data = await fetchSessions();
        setSessions(data);
      } else if (tab === 'payments') {
        const data = await fetchPendingEnrollments();
        setPendingPayments(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€ SESSION HANDLERS â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await createSession({
        ...sessionForm,
        tags: sessionForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        batchId: sessionForm.batchId ? parseInt(sessionForm.batchId) : null,
      });
      setShowCreateSession(false);
      setSessionForm({ title: '', description: '', scheduledAt: '', durationMinutes: 75, maxParticipants: 50, tags: '', batchId: '', recordingUrl: '' });
      loadTab();
    } catch (err) { setActionError(err.message); }
  };

  const handleUpdateSession = async (id) => {
    try {
      setActionError('');
      const data = {
        ...sessionForm,
        tags: typeof sessionForm.tags === 'string' ? sessionForm.tags.split(',').map(t => t.trim()).filter(Boolean) : sessionForm.tags,
        batchId: sessionForm.batchId ? parseInt(sessionForm.batchId) : null,
        recordingUrl: sessionForm.recordingUrl || null,
      };
      await updateSession(id, data);
      setEditingId(null);
      loadTab();
    } catch (err) { setActionError(err.message); }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    try { setActionError(''); await deleteSession(id); loadTab(); } catch (err) { setActionError(err.message); }
  };

  const handleGoLive = async (id) => {
    try { setActionError(''); await goLive(id); loadTab(); } catch (err) { setActionError(err.message); }
  };

  const handleEndSession = async (id) => {
    if (!confirm('End this session?')) return;
    try { setActionError(''); await endSession(id); loadTab(); } catch (err) { setActionError(err.message); }
  };

  const handleViewEnrollments = async (id) => {
    try { setActionError(''); const data = await fetchSessionEnrollments(id); setEnrollments(data); setViewEnrollments(id); } catch (err) { setActionError(err.message); }
  };

  const startEditSession = (s) => {
    setEditingId(s.id);
    setSessionForm({
      title: s.title, description: s.description || '',
      scheduledAt: new Date(s.scheduledAt).toISOString().slice(0, 16),
      durationMinutes: s.durationMinutes, maxParticipants: s.maxParticipants,
      tags: s.tags?.join(', ') || '',
      batchId: s.batchId || '',
      recordingUrl: s.recordingUrl || '',
    });
  };

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€ BATCH HANDLERS â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: batchForm.title,
        description: batchForm.description,
        price: parseFloat(batchForm.price),
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
        maxParticipants: parseInt(batchForm.maxParticipants),
        status: batchForm.status,
        tags: batchForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        bankAccount: batchForm.bankName ? { bank: batchForm.bankName, accountNumber: batchForm.bankAccount, accountName: batchForm.bankAccountName } : null,
      };
      await createBatch(payload);
      setShowCreateBatch(false);
      resetBatchForm();
      loadTab();
    } catch (err) { setActionError(err.message); }
  };

  const handleUpdateBatch = async (id) => {
    try {
      setActionError('');
      const payload = {
        title: batchForm.title, description: batchForm.description,
        price: parseFloat(batchForm.price), startDate: batchForm.startDate, endDate: batchForm.endDate,
        maxParticipants: parseInt(batchForm.maxParticipants), status: batchForm.status,
        tags: typeof batchForm.tags === 'string' ? batchForm.tags.split(',').map(t => t.trim()).filter(Boolean) : batchForm.tags,
        bankAccount: batchForm.bankName ? { bank: batchForm.bankName, accountNumber: batchForm.bankAccount, accountName: batchForm.bankAccountName } : null,
      };
      await updateBatch(id, payload);
      setEditingBatchId(null);
      loadTab();
    } catch (err) { setActionError(err.message); }
  };

  const handleDeleteBatch = async (id) => {
    if (!confirm('Delete this batch? This cannot be undone.')) return;
    try { setActionError(''); await deleteBatch(id); loadTab(); } catch (err) { setActionError(err.message); }
  };

  const startEditBatch = (b) => {
    setEditingBatchId(b.id);
    setBatchForm({
      title: b.title, description: b.description || '',
      price: b.price, startDate: b.startDate ? new Date(b.startDate).toISOString().slice(0,10) : '',
      endDate: b.endDate ? new Date(b.endDate).toISOString().slice(0,10) : '',
      maxParticipants: b.maxParticipants, status: b.status, tags: b.tags?.join(', ') || '',
      bankName: b.bankAccount?.bank || '', bankAccount: b.bankAccount?.accountNumber || '', bankAccountName: b.bankAccount?.accountName || ''
    });
  };

  const resetBatchForm = () => setBatchForm({ title: '', description: '', price: '', startDate: '', endDate: '', maxParticipants: 30, status: 'open', tags: '', bankName: '', bankAccount: '', bankAccountName: '' });

  // ─────────── PAYMENT HANDLERS ───────────
  const handleApprove = async (id) => {
    try { setActionError(''); await approveEnrollment(id); loadTab(); } catch (err) { setActionError(err.message); }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) { setActionError('Please enter a rejection reason.'); return; }
    try { setActionError(''); await rejectEnrollment(id, rejectReason.trim()); setRejectingId(null); setRejectReason(''); loadTab(); } catch (err) { setActionError(err.message); }
  };

  // ─────────── BATCH ENROLLEES HANDLERS ───────────
  const handleViewBatchEnrollees = async (batchId) => {
    try {
      setActionError('');
      const data = await fetchBatchEnrollments(batchId);
      setBatchEnrollees(data);
      setViewBatchEnrollees(batchId);
    } catch (err) { setActionError(err.message); }
  };

  const handleRefund = async (enrollmentId) => {
    if (!refundReason.trim()) { setActionError('Please enter a refund reason.'); return; }
    try {
      setActionError('');
      await refundEnrollment(enrollmentId, refundReason.trim());
      setRefundingId(null);
      setRefundReason('');
      // Refresh the current modal data
      if (viewBatchEnrollees) handleViewBatchEnrollees(viewBatchEnrollees);
      loadTab();
    } catch (err) { setActionError(err.message); }
  };

  // ─────────── CERTIFICATE HANDLERS ───────────
  const handleOpenCertModal = async (batch) => {
    setCertModalBatch(batch);
    setCertTab('template');
    setCertLoading(true);
    try {
      const [tmpl, { eligible }, issued] = await Promise.all([
        fetchCertificateTemplate(batch.id).catch(() => null),
        fetchEligibleStudents(batch.id).catch(() => ({ eligible: [] })),
        fetchBatchCertificates(batch.id).catch(() => []),
      ]);
      setCertTemplate(tmpl);
      if (tmpl) {
        setCertTemplateForm({
          title: tmpl.title || 'Certificate of Completion',
          subtitle: tmpl.subtitle || 'This certifies that',
          bodyText: tmpl.bodyText || '{{studentName}} has successfully completed {{batchTitle}}.',
          instructorName: tmpl.instructorName || '',
          footerText: tmpl.footerText || 'CodeQuarry Online Learning Platform',
          accentColor: tmpl.accentColor || '#7c3aed',
          attendanceThreshold: tmpl.attendanceThreshold ?? 75,
        });
      } else {
        setCertTemplateForm({
          title: 'Certificate of Completion',
          subtitle: 'This certifies that',
          bodyText: '{{studentName}} has successfully completed {{batchTitle}}.',
          instructorName: batch.instructorName || '',
          footerText: 'CodeQuarry Online Learning Platform',
          accentColor: '#7c3aed',
          attendanceThreshold: 75,
        });
      }
      setCertEligible(eligible);
      setCertIssuedList(issued);
    } catch (err) { setActionError(err.message); }
    finally { setCertLoading(false); }
  };

  const handleSaveCertTemplate = async () => {
    setCertSaving(true);
    try {
      const tmpl = await saveCertificateTemplate(certModalBatch.id, certTemplateForm);
      setCertTemplate(tmpl);
      setActionError('');
    } catch (err) { setActionError(err.message); }
    finally { setCertSaving(false); }
  };

  const handleIssueAll = async () => {
    if (!confirm('Issue certificates to all students who meet the attendance threshold?')) return;
    setCertIssuing(true);
    try {
      const res = await issueCertificates(certModalBatch.id);
      const [{ eligible }, issued] = await Promise.all([
        fetchEligibleStudents(certModalBatch.id),
        fetchBatchCertificates(certModalBatch.id),
      ]);
      setCertEligible(eligible);
      setCertIssuedList(issued);
      setActionError('');
      alert(`Issued ${res.issued} certificate(s).`);
    } catch (err) { setActionError(err.message); }
    finally { setCertIssuing(false); }
  };

  const handleIssueSingle = async (userId) => {
    setCertIssuing(true);
    try {
      await issueCertificates(certModalBatch.id, [userId]);
      const [{ eligible }, issued] = await Promise.all([
        fetchEligibleStudents(certModalBatch.id),
        fetchBatchCertificates(certModalBatch.id),
      ]);
      setCertEligible(eligible);
      setCertIssuedList(issued);
    } catch (err) { setActionError(err.message); }
    finally { setCertIssuing(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // â”€â”€ Batch form section (shared for create and edit) â”€â”€
  const BatchFormFields = ({ form, setForm }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="text-xs text-gray-400 font-bold mb-1 block">Title *</label>
        <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. JavaScript Bootcamp Batch 1" />
      </div>
      <div className="col-span-2">
        <label className="text-xs text-gray-400 font-bold mb-1 block">Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 h-16 resize-none" placeholder="What students will learnâ€¦" />
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">Price (IDR) *</label>
        <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min={0}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. 500000" />
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">Max Participants</label>
        <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} min={1}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">Start Date</label>
        <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">End Date</label>
        <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">Status</label>
        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="full">Full</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-400 font-bold mb-1 block">Tags (comma-separated)</label>
        <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="javascript, beginner" />
      </div>
      <div className="col-span-2 border-t border-gray-700 pt-3">
        <div className="text-xs text-gray-400 font-bold mb-2">Bank Account (for manual transfer)</div>
        <div className="grid grid-cols-3 gap-2">
          <input type="text" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Bank (e.g. BCA)" />
          <input type="text" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Account Number" />
          <input type="text" value={form.bankAccountName} onChange={e => setForm({...form, bankAccountName: e.target.value})}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Account Name" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/bootcamp')} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black">Bootcamp Admin</h1>
          </div>

          <div className="flex items-center gap-2">
            {tab === 'sessions' && (
              <button onClick={() => setShowCreateSession(!showCreateSession)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">
                <Plus className="w-4 h-4" /> New Session
              </button>
            )}
            {tab === 'batches' && (
              <button onClick={() => { setShowCreateBatch(!showCreateBatch); setEditingBatchId(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">
                <Plus className="w-4 h-4" /> New Batch
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'sessions',  label: 'Sessions',  Icon: MonitorPlay },
            { key: 'batches',   label: 'Batches',   Icon: GraduationCap },
            { key: 'payments',  label: 'Payments',  Icon: CreditCard },
          ].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Inline action error banner (replaces alert()) */}
        {actionError && (
          <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-sm">
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{actionError}</div>
            <button onClick={() => setActionError('')} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SESSIONS TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {tab === 'sessions' && (
          <>
            {/* Create Session Form */}
            {showCreateSession && (
              <form onSubmit={handleCreateSession} className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 mb-6 space-y-4">
                <h2 className="text-lg font-bold">Create New Session</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Title *</label>
                    <input type="text" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. JavaScript Fundamentals - Session 1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Description</label>
                    <textarea value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Assign to Batch</label>
                    <select value={sessionForm.batchId} onChange={e => setSessionForm({...sessionForm, batchId: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                      <option value="">— No batch (free event) —</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Date & Time *</label>
                    <input type="datetime-local" value={sessionForm.scheduledAt} onChange={e => setSessionForm({...sessionForm, scheduledAt: e.target.value})} required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Duration (min)</label>
                    <input type="number" value={sessionForm.durationMinutes} onChange={e => setSessionForm({...sessionForm, durationMinutes: parseInt(e.target.value)})} min={15} max={180}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Max Participants</label>
                    <input type="number" value={sessionForm.maxParticipants} onChange={e => setSessionForm({...sessionForm, maxParticipants: parseInt(e.target.value)})} min={1} max={200}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1 block">Tags (comma-separated)</label>
                    <input type="text" value={sessionForm.tags} onChange={e => setSessionForm({...sessionForm, tags: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="javascript, beginner" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateSession(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">Create Session</button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16 text-gray-500"><MonitorPlay className="w-12 h-12 mx-auto mb-3 opacity-50" /><div className="font-bold">No sessions yet</div></div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
                    {editingId === session.id ? (
                      <div className="space-y-3">
                        <input type="text" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                        <div className="grid grid-cols-3 gap-3">
                          <input type="datetime-local" value={sessionForm.scheduledAt} onChange={e => setSessionForm({...sessionForm, scheduledAt: e.target.value})}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                          <input type="number" value={sessionForm.durationMinutes} onChange={e => setSessionForm({...sessionForm, durationMinutes: parseInt(e.target.value)})}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                          <input type="number" value={sessionForm.maxParticipants} onChange={e => setSessionForm({...sessionForm, maxParticipants: parseInt(e.target.value)})}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 font-bold mb-1 block">Assign to Batch</label>
                            <select value={sessionForm.batchId} onChange={e => setSessionForm({...sessionForm, batchId: e.target.value})}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                              <option value="">— No batch (free) —</option>
                              {batches.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                            </select>
                          </div>
                          {session.status === 'ended' && (
                            <div>
                              <label className="text-xs text-gray-400 font-bold mb-1 block">Recording URL</label>
                              <input type="url" value={sessionForm.recordingUrl} onChange={e => setSessionForm({...sessionForm, recordingUrl: e.target.value})}
                                placeholder="https://youtube.com/..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleUpdateSession(session.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold"><Save className="w-3.5 h-3.5" /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{session.title}</h3>
                            {session.status === 'live' && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold"><Radio className="w-3 h-3 animate-pulse" />LIVE</span>}
                            {session.status === 'scheduled' && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Scheduled</span>}
                            {session.status === 'ended' && <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 rounded-full text-xs font-bold">Ended</span>}
                            {session.batchId && batches.find(b => b.id === session.batchId) && (
                              <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded-full text-xs font-bold">
                                {batches.find(b => b.id === session.batchId)?.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(session.scheduledAt)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{session.durationMinutes} min</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{session.enrollmentCount || 0}/{session.maxParticipants}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {session.status === 'scheduled' && <button onClick={() => handleGoLive(session.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors"><Radio className="w-3.5 h-3.5" /> Go Live</button>}
                          {session.status === 'live' && (
                            <>
                              <button onClick={() => navigate(`/bootcamp/classroom/${session.id}`)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors"><MonitorPlay className="w-3.5 h-3.5" /> Enter</button>
                              <button onClick={() => handleEndSession(session.id)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors"><Square className="w-3.5 h-3.5" /> End</button>
                            </>
                          )}
                          <button onClick={() => handleViewEnrollments(session.id)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-400 transition-colors"><Users className="w-3.5 h-3.5" /> Students</button>
                          <button onClick={() => startEditSession(session)} className="p-1.5 text-gray-500 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSession(session.id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• BATCHES TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {tab === 'batches' && (
          <>
            {showCreateBatch && !editingBatchId && (
              <form onSubmit={handleCreateBatch} className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 mb-6 space-y-4">
                <h2 className="text-lg font-bold">Create New Batch</h2>
                <BatchFormFields form={batchForm} setForm={setBatchForm} />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => { setShowCreateBatch(false); resetBatchForm(); }} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">Create Batch</button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
            ) : batches.length === 0 ? (
              <div className="text-center py-16 text-gray-500"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" /><div className="font-bold">No batches yet</div></div>
            ) : (
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div key={batch.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
                    {editingBatchId === batch.id ? (
                      <div className="space-y-4">
                        <BatchFormFields form={batchForm} setForm={setBatchForm} />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingBatchId(null)} className="p-1.5 text-gray-400"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleUpdateBatch(batch.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold"><Save className="w-3.5 h-3.5" /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-lg">{batch.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              batch.status === 'open' ? 'bg-green-500/20 text-green-400' :
                              batch.status === 'full' ? 'bg-yellow-500/20 text-yellow-400' :
                              batch.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>{batch.status}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <span className="text-purple-300 font-bold">{IDR(batch.price)}</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{batch.enrollmentCount || 0}/{batch.maxParticipants}</span>
                            {batch.startDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(batch.startDate).toLocaleDateString('id-ID')}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleViewBatchEnrollees(batch.id)} className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-white text-xs"><Users className="w-3.5 h-3.5" /> Enrollees</button>
                          <button onClick={() => handleOpenCertModal(batch)} className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-yellow-400 text-xs"><Award className="w-3.5 h-3.5" /> Certificate</button>
                          <button onClick={() => startEditBatch(batch)} className="p-1.5 text-gray-500 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteBatch(batch.id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PAYMENTS TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {tab === 'payments' && (
          <>
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-500" />
                <div className="font-bold">No pending payments</div>
                <div className="text-sm mt-1">All manual transfers have been reviewed.</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-500 mb-4">{pendingPayments.length} pending transfer{pendingPayments.length > 1 ? 's' : ''} awaiting review</div>
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="bg-gray-900/80 border border-yellow-800/30 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{payment.displayName || payment.username}</span>
                          <span className="text-xs text-gray-500">@{payment.username}</span>
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">Pending</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">Batch: <span className="text-white font-medium">{payment.batchTitle || `#${payment.batchId}`}</span></div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <div className="text-gray-500">Amount: <span className="text-purple-300 font-bold">{IDR(payment.amountPaid || payment.batchPrice)}</span></div>
                          <div className="text-gray-500">Method: <span className="text-white">Manual Transfer</span></div>
                          {payment.paymentRef && <div className="text-gray-500">Ref: <span className="text-white font-mono text-xs">{payment.paymentRef}</span></div>}
                          {payment.transferNotes && <div className="text-gray-500">Notes: <span className="text-white">{payment.transferNotes}</span></div>}
                          <div className="text-gray-500">Submitted: <span className="text-white">{new Date(payment.enrolledAt).toLocaleString('id-ID')}</span></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleApprove(payment.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-colors">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        {rejectingId === payment.id ? (
                          <div className="space-y-2">
                            <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                              placeholder="Reasonâ€¦" autoFocus
                              className="w-48 bg-gray-800 border border-red-800/40 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500" />
                            <div className="flex gap-1">
                              <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                className="flex-1 px-2 py-1 text-gray-400 hover:text-white text-xs"><X className="w-4 h-4 mx-auto" /></button>
                              <button onClick={() => handleReject(payment.id)}
                                className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold">Confirm</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRejectingId(payment.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-600/30 text-gray-400 hover:text-red-400 rounded-lg font-bold text-sm transition-colors">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Enrollments Modal */}
        {viewEnrollments && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setViewEnrollments(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Enrolled Students</h3>
                <button onClick={() => setViewEnrollments(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {enrollments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No enrollments yet</div>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{e.displayName || e.username}</span>
                        <span className="text-xs text-gray-500">@{e.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.attended && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">ATTENDED</span>}
                        <span className="text-xs text-gray-600">{new Date(e.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch Enrollees Modal (with refund) */}
        {viewBatchEnrollees && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setViewBatchEnrollees(null); setRefundingId(null); setRefundReason(''); }}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-xl w-full max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Batch Enrollees</h3>
                <button onClick={() => { setViewBatchEnrollees(null); setRefundingId(null); setRefundReason(''); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {batchEnrollees.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No enrollees yet</div>
              ) : (
                <div className="space-y-2">
                  {batchEnrollees.map((e) => (
                    <div key={e.id} className="px-3 py-2.5 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{e.displayName || e.username}</span>
                          <span className="text-xs text-gray-500">@{e.username}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            e.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            e.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            e.paymentStatus === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{e.paymentStatus?.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{new Date(e.enrolledAt).toLocaleDateString()}</span>
                          {e.paymentStatus === 'paid' && refundingId !== e.id && (
                            <button onClick={() => { setRefundingId(e.id); setRefundReason(''); }}
                              className="text-[10px] px-2 py-0.5 bg-gray-700 hover:bg-red-600/30 text-gray-400 hover:text-red-400 rounded font-bold transition-colors">
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                      {refundingId === e.id && (
                        <div className="mt-2 flex items-center gap-2">
                          <input type="text" value={refundReason} onChange={ev => setRefundReason(ev.target.value)}
                            placeholder="Refund reason…" autoFocus
                            className="flex-1 bg-gray-700 border border-red-800/40 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500" />
                          <button onClick={() => { setRefundingId(null); setRefundReason(''); }}
                            className="p-1.5 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                          <button onClick={() => handleRefund(e.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors">Confirm</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Certificate Template & Issue Modal */}
      {certModalBatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setCertModalBatch(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-lg">Certificate — {certModalBatch.title}</h3>
              </div>
              <button onClick={() => setCertModalBatch(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
              {['template', 'issue'].map(t => (
                <button key={t} onClick={() => setCertTab(t)}
                  className={`px-4 py-3 text-sm font-bold capitalize border-b-2 transition-colors -mb-px ${
                    certTab === t ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}>
                  {t === 'template' ? 'Template' : `Issue (${certIssuedList.length} issued)`}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {certLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
              ) : certTab === 'template' ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Supported variables: <code className="bg-gray-800 px-1 rounded">{'{{studentName}}'}</code> <code className="bg-gray-800 px-1 rounded">{'{{batchTitle}}'}</code> <code className="bg-gray-800 px-1 rounded">{'{{completionDate}}'}</code> <code className="bg-gray-800 px-1 rounded">{'{{instructorName}}'}</code></p>

                  {[['title', 'Certificate Title', 'text'],
                    ['subtitle', 'Subtitle (above student name)', 'text'],
                    ['bodyText', 'Body Text', 'textarea'],
                    ['instructorName', 'Instructor Name (signature)', 'text'],
                    ['footerText', 'Footer Text', 'text'],
                  ].map(([field, label, type]) => (
                    <div key={field}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      {type === 'textarea' ? (
                        <textarea rows={3} value={certTemplateForm[field]}
                          onChange={e => setCertTemplateForm(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none" />
                      ) : (
                        <input type="text" value={certTemplateForm[field]}
                          onChange={e => setCertTemplateForm(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={certTemplateForm.accentColor}
                          onChange={e => setCertTemplateForm(p => ({ ...p, accentColor: e.target.value }))}
                          className="w-10 h-9 rounded cursor-pointer bg-transparent border-0" />
                        <input type="text" value={certTemplateForm.accentColor}
                          onChange={e => setCertTemplateForm(p => ({ ...p, accentColor: e.target.value }))}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Attendance Threshold (%)</label>
                      <input type="number" min={0} max={100} value={certTemplateForm.attendanceThreshold}
                        onChange={e => setCertTemplateForm(p => ({ ...p, attendanceThreshold: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>

                  <button onClick={handleSaveCertTemplate} disabled={certSaving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors">
                    {certSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {certSaving ? 'Saving…' : 'Save Template'}
                  </button>
                  {!certTemplate && <p className="text-xs text-gray-600 text-center">Template must be saved before issuing certificates.</p>}
                </div>
              ) : (
                /* Issue tab */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{certEligible.length} enrolled students · threshold {certTemplateForm.attendanceThreshold}%</span>
                    <button onClick={handleIssueAll} disabled={certIssuing || !certTemplate}
                      className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors">
                      {certIssuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      Issue to All Eligible
                    </button>
                  </div>

                  {certEligible.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No paid enrollees yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {certEligible.map(s => {
                        const issued = certIssuedList.find(c => c.userId === s.userId);
                        return (
                          <div key={s.userId} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-800 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white truncate">{s.displayName}</span>
                                {s.meetsThreshold
                                  ? <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded font-bold shrink-0">ELIGIBLE</span>
                                  : <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-500 rounded font-bold shrink-0">BELOW</span>
                                }
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {s.attendedCount}/{s.sessionCount} sessions ({s.attendancePct}%)
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {issued ? (
                                <>
                                  <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold">ISSUED</span>
                                  <a href={getCertificatePdfUrl(issued.certUuid)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-colors">
                                    <Download className="w-3 h-3" /> PDF
                                  </a>
                                </>
                              ) : (
                                <button onClick={() => handleIssueSingle(s.userId)} disabled={certIssuing || !certTemplate}
                                  className="px-3 py-1 bg-yellow-700/40 hover:bg-yellow-600/50 disabled:opacity-40 text-yellow-300 rounded-lg text-xs font-bold transition-colors">
                                  Issue
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
