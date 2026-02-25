/**
 * Reusable Suspense fallback — replaces the 8+ identical loading divs
 * that were scattered across App.jsx.
 */
export default function SuspenseFallback({ text = 'Loading...', color = 'text-purple-400' }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className={`animate-pulse text-2xl ${color}`}>{text}</div>
    </div>
  );
}
