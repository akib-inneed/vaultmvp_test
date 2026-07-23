'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setFullName(profile?.full_name ?? '');
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
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
          <span className="font-serif text-lg font-semibold text-ink">Edit Profile</span>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-ink/40 font-sans">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-jungle rounded-2xl border border-ink/10 p-5">
              <label htmlFor="full_name" className="block text-sm font-medium text-ink mb-2 font-sans">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="Your full name"
              />
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
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
