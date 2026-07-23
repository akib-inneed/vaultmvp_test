'use client';

import { useState } from 'react';
import { acceptTerms } from '@/app/dashboard/actions';

export function TermsModal() {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleAgree() {
    if (!checked) return;
    setLoading(true);
    setError(null);
    const result = await acceptTerms();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDismissed(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Dark overlay — not clickable to dismiss */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-jungle rounded-t-3xl sm:rounded-3xl px-6 pt-8 pb-10 sm:mx-4 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center mb-6">
          <span className="font-display text-lg font-black tracking-tight" style={{ color: '#CF9D7B' }}>HEIR<span style={{ color: '#724B39' }}>L</span>O</span>
        </div>

        {/* Heading */}
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-5">
          Before you begin
        </h2>

        {/* Body */}
        <div className="space-y-4 mb-7">
          <p className="font-sans text-sm text-ink/65 leading-relaxed">
            Heirlo is a personal property documentation platform, not a law firm. Nothing in this app constitutes legal advice.
          </p>
          <p className="font-sans text-sm text-ink/65 leading-relaxed">
            Documents created in Heirlo are expressions of personal intent. They are designed to supplement — not replace — a legally executed will or trust.
          </p>
          <p className="font-sans text-sm text-ink/65 leading-relaxed">
            By continuing, you acknowledge that Heirlo operates under UPC §2-513 as a memorandum of intent, and that you should consult a licensed estate attorney for binding estate planning.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                checked ? 'bg-teal border-teal' : 'border-ink/25 group-hover:border-teal/50'
              }`}
            >
              {checked && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="font-sans text-sm text-ink/70 leading-snug select-none">
            I understand and agree to the{' '}
            <span className="text-ink font-medium">Terms of Use and Disclaimer</span>
          </span>
        </label>

        {error && (
          <p className="text-vault-red text-xs font-sans mb-4">{error}</p>
        )}

        {/* CTA */}
        <button
          type="button"
          disabled={!checked || loading}
          onClick={handleAgree}
          className="w-full font-sans font-semibold text-sm text-cream py-3.5 rounded-2xl transition disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#CF9D7B', color: '#0C1519' }}
        >
          {loading ? 'Saving…' : 'Continue to Heirlo'}
        </button>

      </div>
    </div>
  );
}
