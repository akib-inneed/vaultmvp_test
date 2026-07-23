import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';
import { BottomNav } from '@/components/vault/BottomNav';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink/25 shrink-0">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const rowBase = 'w-full flex items-center gap-3.5 px-5 py-4 hover:bg-ink/3 transition text-left';
const rowBorder = 'border-b border-ink/6';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const fullName = profile?.full_name ?? user.email?.split('@')[0] ?? 'You';
  const email = profile?.email ?? user.email ?? '';

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-24">

      {/* Nav */}
      <nav className="border-b border-ink/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <span className="font-serif text-lg font-semibold text-ink">Settings</span>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Heading */}
        <div className="mb-2">
          <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1.5">Your Account</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">Settings</h1>
        </div>

        {/* Profile card */}
        <div className="bg-jungle rounded-2xl border border-ink/10 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center shrink-0">
            <span className="text-white font-mono font-semibold text-lg leading-none">
              {initials(fullName)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-sans font-semibold text-ink text-base truncate">{fullName}</p>
            <p className="font-sans text-sm text-ink/45 truncate">{email}</p>
          </div>
        </div>

        {/* Group 1: Profile, Notifications, Security */}
        <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden">
          <Link href="/settings/profile" className={`${rowBase} ${rowBorder}`}>
            <span className="text-ink/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 9a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="flex-1 font-sans text-sm font-medium text-ink">Edit Profile</span>
            <ChevronRight />
          </Link>

          <div className={`${rowBase} ${rowBorder} opacity-40 cursor-not-allowed`}>
            <span className="text-ink/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2a5 5 0 00-5 5v3l-1.5 2h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="flex-1 font-sans text-sm font-medium text-ink">
              Notifications <span className="text-ink/40 font-normal">(Coming soon)</span>
            </span>
          </div>

          <Link href="/settings/security" className={rowBase}>
            <span className="text-ink/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L2.5 4.5v4.5C2.5 12.9 5.4 16 9 17c3.6-1 6.5-4.1 6.5-8V4.5L9 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="flex-1 font-sans text-sm font-medium text-ink">Security</span>
            <ChevronRight />
          </Link>
        </div>

        {/* Group 2: Document, Legal */}
        <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden">
          <Link href="/document" className={`${rowBase} ${rowBorder}`}>
            <span className="text-ink/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v9M6 8l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="flex-1 font-sans text-sm font-medium text-ink">Download My Document</span>
            <ChevronRight />
          </Link>

          <Link href="/legal" className={rowBase}>
            <span className="text-ink/40 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2.5" y="1.5" width="13" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5.5 6h7M5.5 9h7M5.5 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="flex-1 font-sans text-sm font-medium text-ink">Legal & Privacy</span>
            <ChevronRight />
          </Link>
        </div>

        {/* Sign out */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full bg-jungle rounded-2xl border border-vault-red/20 px-5 py-4 text-left font-sans text-sm font-medium text-vault-red hover:bg-vault-red/5 transition"
          >
            Sign Out
          </button>
        </form>

      </main>

      <BottomNav />
    </div>
  );
}
