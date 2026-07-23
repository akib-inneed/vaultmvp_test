'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SecurityPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated.' });
      setPassword('');
      setConfirm('');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-24">
      <nav className="border-b border-ink/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/settings" className="text-ink/40 hover:text-ink transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className="font-serif text-lg font-semibold text-ink">Security</span>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-jungle rounded-2xl border border-ink/10 p-5 space-y-4">
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-ink mb-2 font-sans">
                New password
              </label>
              <input
                id="new_password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-ink mb-2 font-sans">
                Confirm password
              </label>
              <input
                id="confirm_password"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 ${
              message.type === 'success'
                ? 'bg-teal/10 border border-teal/20'
                : 'bg-vault-red/10 border border-vault-red/20'
            }`}>
              <p className={`text-sm font-sans ${
                message.type === 'success' ? 'text-teal' : 'text-vault-red'
              }`}>{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </main>
    </div>
  );
}
