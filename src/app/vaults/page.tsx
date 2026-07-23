import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/vault/BottomNav';

export default async function VaultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: '#0C1519' }}>

      {/* ── FULL dark green hero ── */}
      <div
        className="relative flex flex-col justify-end px-5 pb-10"
        style={{
          backgroundColor: '#0C1519',
          minHeight: '180px',
          maxHeight: '220px',
          paddingTop: '32px',
        }}
      >
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* faint circular glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '320px', height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
            top: '-60px', right: '-60px',
          }}
        />

        <div className="max-w-2xl mx-auto w-full relative">
          <p
            className="font-mono uppercase tracking-[0.25em] mb-3"
            style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}
          >
            Your Vault
          </p>
          <h1
            className="font-serif font-semibold leading-none mb-4"
            style={{ fontSize: 'clamp(52px, 13vw, 80px)', color: '#ffffff' }}
          >
            Vault
          </h1>
        </div>

        {/* curved bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '32px', overflow: 'hidden', lineHeight: 0 }}
        >
          <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={{ width: '100%', height: '32px', display: 'block' }}>
            <path d="M0,32 Q200,0 400,32 L400,32 L0,32 Z" fill="#0C1519"/>
          </svg>
        </div>
      </div>

      {/* ── Coming Soon content ── */}
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-8">
        <div className="bg-jungle rounded-2xl border border-ink/10 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal">
              <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M19.5 18c1.5-.8 2.5-2.2 2.5-3.8 0-2-1.8-3.7-4-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-3">Coming Soon</h2>
          <p className="font-sans text-sm text-ink/50 leading-relaxed mb-6 max-w-sm mx-auto">
            Shared vaults are on the roadmap. For now, your personal vault is the place to catalog and assign your belongings.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 transition text-sm"
          >
            Go to my vault
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
