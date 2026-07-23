'use client';

import { useState } from 'react';

export function DownloadButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/document');
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Failed to generate PDF.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Heirlo_PPM.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'items-stretch' : 'items-end'}`}>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 bg-teal text-cream font-sans font-medium py-2.5 px-5 rounded-xl hover:bg-teal/90 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed ${fullWidth ? 'w-full py-3.5' : 'shrink-0'}`}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10"/>
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </>
        )}
      </button>
      {error && <p className="text-xs text-vault-red font-sans">{error}</p>}
    </div>
  );
}
