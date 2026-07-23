'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signup } from '../actions';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const redirectTo = searchParams.get('redirect') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const result = await signup(formData, redirectTo || undefined);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const loginHref = redirectTo
    ? `/auth/login?email=${encodeURIComponent(prefillEmail)}&redirect=${encodeURIComponent(redirectTo)}`
    : '/auth/login';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight mb-2" style={{ color: '#CF9D7B' }}>HEIR<span style={{ color: '#724B39' }}>L</span>O</h1>
          <p className="text-ink/60 font-sans">Create your personal account</p>
        </div>

        <div className="bg-jungle rounded-2xl shadow-sm border border-ink/10 p-8">
          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="Your full legal name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={prefillEmail}
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                Confirm password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="••••••••"
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
              {loading ? 'Creating account…' : 'Create your account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/60 mt-6 font-sans">
          Already have an account?{' '}
          <Link href={loginHref} className="text-teal hover:text-teal/80 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
