import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function CertificateVerifyPage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid' | 'error'
  const [cert, setCert] = useState(null);

  useEffect(() => {
    // Extract UUID from the URL path: /verify/<uuid>
    const parts = window.location.pathname.split('/');
    const certUuid = parts[parts.length - 1];

    if (!certUuid || certUuid === 'verify') {
      setStatus('invalid');
      return;
    }

    fetch(`${API_BASE}/api/batches/cert/${certUuid}/verify`)
      .then((r) => {
        if (r.status === 404) {
          setStatus('invalid');
          return null;
        }
        if (!r.ok) throw new Error('Server error');
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setCert(data);
        setStatus('valid');
      })
      .catch(() => setStatus('error'));
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Header bar */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
          <Award className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-wide">CodeQuarry</span>
        </div>
        <p className="text-gray-400 text-sm">Certificate Verification Portal</p>
      </div>

      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
            <p className="text-gray-400">Verifying certificate…</p>
          </div>
        )}

        {/* Valid */}
        {status === 'valid' && cert && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-green-400">Certificate Verified</h2>
                <p className="text-gray-400 text-sm">This certificate is authentic and was issued by CodeQuarry.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              <Row label="Recipient" value={cert.studentName} highlight />
              <Row label="Program / Batch" value={cert.batchTitle} />
              <Row label="Instructor" value={cert.instructorName || '—'} />
              <Row label="Completion Date" value={formatDate(cert.completionDate)} />
              <Row label="Issued On" value={formatDate(cert.issuedAt)} />
              <Row label="Certificate ID" value={cert.certUuid} mono />
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              This is a <strong className="text-gray-400">Certificate of Completion</strong> issued by
              CodeQuarry. It is not an accredited qualification. Verify the certificate ID above
              against the printed certificate to confirm authenticity.
            </p>
          </>
        )}

        {/* Not found */}
        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <XCircle className="w-10 h-10 text-red-400" />
            <h2 className="text-xl font-bold text-red-400">Certificate Not Found</h2>
            <p className="text-gray-400 text-sm">
              No certificate matches this ID. The link may be incorrect or the certificate may have
              been revoked.
            </p>
          </div>
        )}

        {/* Server error */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <XCircle className="w-10 h-10 text-yellow-400" />
            <h2 className="text-xl font-bold text-yellow-400">Verification Unavailable</h2>
            <p className="text-gray-400 text-sm">
              We could not reach the verification service. Please try again later.
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center">
        © {new Date().getFullYear()} CodeQuarry · All rights reserved
      </p>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function Row({ label, value, highlight, mono }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs text-gray-500 uppercase tracking-wider sm:w-36 shrink-0">{label}</span>
      <span
        className={[
          'text-sm break-all',
          highlight ? 'text-white font-semibold text-base' : 'text-gray-300',
          mono ? 'font-mono text-xs text-gray-400' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

export default CertificateVerifyPage;
