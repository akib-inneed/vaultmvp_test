'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SignOutButtonProps {
  recipientEmail: string;
  token: string;
}

export function SignOutButton({ recipientEmail, token }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/auth/login?email=${encodeURIComponent(recipientEmail)}&redirect=${encodeURIComponent(`/acknowledge/${token}`)}`);
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full rounded-full py-3 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ backgroundColor: '#CF9D7B', color: '#0C1519' }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#B8885F'; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#CF9D7B'; }}
    >
      {loading ? 'Signing out...' : 'Sign out and continue'}
    </button>
  );
}
