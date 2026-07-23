import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/vault/BottomNav';
import type { VaultWithMembers } from '@/lib/types';

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-teal',
  'bg-amber',
  'bg-ink/30',
];

export default async function VaultDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: vault } = await supabase
    .from('vaults')
    .select('*, vault_members(*)')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  if (!vault) notFound();

  const v = vault as VaultWithMembers;

  return (
    <div className="min-h-screen bg-cream pb-24">

      {/* Nav */}
      <nav className="border-b border-ink/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/vaults" className="text-ink/40 hover:text-ink transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className="font-serif text-lg font-semibold text-ink truncate">{v.name}</span>
          {/* Settings gear — placeholder */}
          <button type="button" className="ml-auto text-ink/30 hover:text-ink transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M3.93 3.93l1.07 1.07M15 15l1.07 1.07M3.93 16.07l1.07-1.07M15 5l1.07-1.07"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Heading */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              v.type === 'family'
                ? 'bg-teal/8 text-teal border-teal/15'
                : 'bg-amber/8 text-amber border-amber/15'
            }`}>
              {v.type === 'family' ? 'Family Vault' : 'Shared Vault'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">{v.name}</h1>
        </div>

        {/* Members */}
        <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-ink/6 flex items-center justify-between">
            <p className="font-sans text-sm font-semibold text-ink">Members</p>
            <span className="font-mono text-xs text-ink/35">{v.vault_members.length}</span>
          </div>
          {v.vault_members.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="font-sans text-sm text-ink/40">No members added yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/6">
              {v.vault_members.map((member, i) => (
                <div key={member.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    <span className="text-white text-[10px] font-mono font-semibold leading-none">
                      {initials(member.email)}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-ink">{member.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items — placeholder */}
        <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-ink/6">
            <p className="font-sans text-sm font-semibold text-ink">Items</p>
          </div>
          <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-ink/20">
                <rect x="2" y="5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 5V3.5A2.5 2.5 0 0115 3.5V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="11" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="font-sans text-sm text-ink/40 leading-relaxed max-w-xs">
              Items shared in this vault will appear here.
            </p>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
