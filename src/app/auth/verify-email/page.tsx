'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const COOLDOWN_SECS = 60;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
      setCooldown(COOLDOWN_SECS);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* Logo */}
        <div className="flex items-center mb-8">
          <span className="font-display text-xl font-black tracking-tight" style={{ color: '#CF9D7B' }}>HEIR<span style={{ color: '#724B39' }}>L</span>O</span>
        </div>

        {/* Envelope illustration */}
        <div className="w-20 h-20 rounded-full bg-teal/8 flex items-center justify-center mb-8">
          <svg width="36" height="30" viewBox="0 0 36 30" fill="none" className="text-teal">
            <rect x="1.5" y="1.5" width="33" height="27" rx="3" stroke="currentColor" strokeWidth="1.75"/>
            <path d="M1.5 6l16.5 11L34.5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mb-4">
          Check your email
        </h1>

        {/* Subtext */}
        <p className="font-sans text-sm text-ink/55 leading-relaxed mb-8">
          We sent a verification link to{' '}
          {email ? (
            <span className="font-medium text-ink">{email}</span>
          ) : (
            'your email address'
          )}
          . Click the link to activate your account and get started.
        </p>

        {/* Resend */}
        <div className="mb-10">
          {status === 'sent' ? (
            <p className="font-sans text-sm text-teal font-medium">Email resent!</p>
          ) : status === 'error' ? (
            <p className="font-sans text-sm text-vault-red">Something went wrong. Try again.</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={!email || cooldown > 0 || status === 'sending'}
              className="font-sans text-sm text-ink/45 hover:text-teal transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'sending'
                ? 'Sending…'
                : cooldown > 0
                ? `Resend email (${cooldown}s)`
                : 'Resend email'}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-ink/8 mb-8" />

        {/* Sign in link */}
        <p className="font-sans text-sm text-ink/45">
          Already verified?{' '}
          <Link href="/auth/login" className="text-teal hover:text-teal/80 font-medium transition">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
