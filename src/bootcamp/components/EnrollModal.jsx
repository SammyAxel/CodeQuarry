/**
 * EnrollModal — Batch enrollment with hybrid payment
 * Pay Online (Midtrans Snap) or Manual Bank Transfer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, Building2, CheckCircle2, Copy, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { enrollOnline, enrollManual } from '../api/batchApi';

const IDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Load Midtrans Snap.js once per session
function loadSnapScript(clientKey) {
  if (document.getElementById('midtrans-snap')) return;
  const script = document.createElement('script');
  script.id = 'midtrans-snap';
  script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
  script.setAttribute('data-client-key', clientKey || '');
  document.head.appendChild(script);
}

export function EnrollModal({ batch, onClose, onEnrolled }) {
  const [method, setMethod] = useState(null); // null | 'online' | 'manual'
  const [step, setStep] = useState('choose'); // choose | manual-form | success | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [copied, setCopied] = useState('');

  const bank = batch?.bankAccount || {};
  const hasBankAccount = bank.accountNumber?.trim();

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  // ── Pay Online via Midtrans Snap ──
  const handlePayOnline = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { snapToken, clientKey } = await enrollOnline(batch.id);
      loadSnapScript(clientKey);

      // Wait for script if not yet loaded
      let attempts = 0;
      while (!window.snap && attempts < 20) {
        await new Promise(r => setTimeout(r, 200));
        attempts++;
      }
      if (!window.snap) {
        throw new Error('Payment widget failed to load. Check your connection and try again.');
      }

      window.snap.pay(snapToken, {
        onSuccess: () => { setStep('success'); onEnrolled?.(); },
        onPending: () => { setStep('success'); }, // bank transfer pending
        onError: (result) => { setError(result?.status_message || 'Payment failed'); },
        onClose: () => { /* user dismissed snap — keep modal open */ },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [batch, onEnrolled]);

  // ── Manual Transfer submit ──
  const handleManualSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!transferRef.trim()) {
      setError('Please enter your transfer reference number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await enrollManual(batch.id, transferRef.trim(), transferNotes.trim());
      setStep('success');
      onEnrolled?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [batch, transferRef, transferNotes, onEnrolled]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Enroll in Batch</div>
            <h2 className="text-xl font-black text-white">{batch.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="text-2xl font-black text-purple-300">{IDR(batch.price)}</span>
              <span>·</span>
              <span>{batch.sessionCount || '?'} sessions</span>
              {batch.startDate && (
                <>
                  <span>·</span>
                  <span>Starts {new Date(batch.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ── Success screen ── */}
          {step === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              {method === 'manual' ? (
                <>
                  <div className="text-xl font-black text-white mb-2">Transfer Submitted!</div>
                  <p className="text-gray-400 text-sm">Your transfer reference has been recorded. Our team will verify payment within 1×24 hours and activate your access.</p>
                </>
              ) : (
                <>
                  <div className="text-xl font-black text-white mb-2">Payment Received!</div>
                  <p className="text-gray-400 text-sm">You are now enrolled. You'll be able to join class sessions when they go live.</p>
                </>
              )}
              <button onClick={onClose} className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors">
                Done
              </button>
            </div>
          )}

          {/* ── Payment method choice ── */}
          {step === 'choose' && (
            <>
              <p className="text-sm text-gray-400 mb-5">Choose how you'd like to pay for this batch:</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => { setMethod('online'); handlePayOnline(); }}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-5 border border-gray-700 hover:border-purple-500 rounded-xl transition-all group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 group-hover:bg-purple-600/40 flex items-center justify-center transition-colors">
                    {loading && method === 'online'
                      ? <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                      : <CreditCard className="w-6 h-6 text-purple-400" />
                    }
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Pay Online</div>
                    <div className="text-xs text-gray-500 mt-0.5">GoPay · OVO · Bank · QRIS</div>
                  </div>
                </button>

                <button
                  onClick={() => { setMethod('manual'); setStep('manual-form'); }}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-5 border border-gray-700 hover:border-green-500 rounded-xl transition-all group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 group-hover:bg-green-600/40 flex items-center justify-center transition-colors">
                    <Building2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Bank Transfer</div>
                    <div className="text-xs text-gray-500 mt-0.5">BCA · BRI · BNI · Mandiri</div>
                  </div>
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </>
          )}

          {/* ── Manual transfer form ── */}
          {step === 'manual-form' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Bank account info */}
              {hasBankAccount ? (
                <div className="p-4 bg-green-900/10 border border-green-800/30 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-green-400 uppercase tracking-wider">Transfer to this account</div>
                  {bank.bank && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Bank</span>
                      <span className="font-bold text-white">{bank.bank}</span>
                    </div>
                  )}
                  {bank.accountNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Account No.</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{bank.accountNumber}</span>
                        <button type="button" onClick={() => copyToClipboard(bank.accountNumber, 'acc')}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                          {copied === 'acc' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {bank.accountName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Account Name</span>
                      <span className="font-bold text-white">{bank.accountName}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-green-800/30 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Amount</span>
                    <span className="text-lg font-black text-purple-300">{IDR(batch.price)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-900/10 border border-yellow-800/30 rounded-xl text-sm text-yellow-300">
                  Bank Account details not yet set. Contact the instructor for transfer information.
                </div>
              )}

              {/* Transfer ref input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Transfer Reference Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={e => setTransferRef(e.target.value)}
                  placeholder="e.g. 20250223123456"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">The unique code shown on your transfer receipt or mobile banking screen.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="e.g. Transferred via BCA mobile at 14:30"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 text-sm resize-none focus:outline-none focus:border-purple-500"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/40 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep('choose'); setError(''); }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold text-gray-300 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl text-sm font-bold text-white transition-colors">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="w-4 h-4" /> Submit Transfer Proof</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
