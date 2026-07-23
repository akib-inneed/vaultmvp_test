'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) { setError('Please enter your email address.'); return; }

    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-1">
            <span className="font-display text-2xl font-black tracking-tight" style={{ color: '#CF9D7B' }}>HEIR<span style={{ color: '#724B39' }}>L</span>O</span>
          </div>
          <p className="font-sans text-sm text-ink/45 mt-1">Reset your password.</p>
        </div>

        {/* Card */}
        <div className="bg-jungle rounded-2xl shadow-sm border border-ink/10 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal">
                  <path d="M5 13L10.5 18.5L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-serif text-xl font-semibold text-ink mb-2">Check your email</h2>
              <p className="font-sans text-sm text-ink/50 leading-relaxed">
                If an account exists with that email, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Forgot password</h2>
              <p className="font-sans text-sm text-ink/45 mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form action={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fp_email" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                    Email address
                  </label>
                  <input
                    id="fp_email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-3">
                    <p className="text-vault-red text-sm font-sans">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to login */}
        <p className="text-center text-sm text-ink/55 mt-6 font-sans">
          <Link href="/auth/login" className="text-teal hover:text-teal/80 font-medium transition">
            Back to sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
