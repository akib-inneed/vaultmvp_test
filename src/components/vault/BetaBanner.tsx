'use client';

import { useState, useEffect } from 'react';

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('vault_beta_banner_dismissed')) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem('vault_beta_banner_dismissed', 'true');
    setVisible(false);
  }

  return (
    <div className="bg-teal text-cream rounded-2xl mb-6 px-5 py-4 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-cream/50 hover:text-cream transition p-1"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
      </button>

      <span className="inline-block font-mono text-[9px] tracking-[0.2em] uppercase text-cream/50 mb-2">Beta</span>
      <p className="font-sans text-sm text-cream/90 leading-relaxed pr-6">
        Welcome to the beta. Add items, assign recipients, collect acknowledgments. Questions? We&apos;d love your feedback.
      </p>
    </div>
  );
}
