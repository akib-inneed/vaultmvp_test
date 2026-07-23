'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
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
          <p className="font-sans text-sm text-ink/45 mt-1">Set a new password.</p>
        </div>

        {/* Card */}
        <div className="bg-jungle rounded-2xl shadow-sm border border-ink/10 p-8">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-6">Reset your password</h2>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="rp_password" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                New password
              </label>
              <input
                id="rp_password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="rp_confirm" className="block text-sm font-medium text-ink mb-1.5 font-sans">
                Confirm new password
              </label>
              <input
                id="rp_confirm"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                className={inputClass}
                placeholder="Re-enter your new password"
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
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
