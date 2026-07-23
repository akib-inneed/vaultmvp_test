import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/vault/BottomNav';
import type { Item, Acknowledgment } from '@/lib/types';

interface BeneficiaryRow {
  id: string;
  item_id: string;
  full_name: string;
  email: string;
  priority: 'primary' | 'secondary';
  items: Item;
  acknowledgments: Acknowledgment[];
}

interface RecipientGroup {
  full_name: string;
  email: string;
  assignments: {
    beneficiary_id: string;
    item: Item;
    ack_status: 'pending' | 'accepted' | 'declined' | null;
  }[];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' | null }) {
  if (!status) return null;
  const map = {
    pending:  { label: 'Awaiting',  bg: 'rgba(217,119,6,0.10)',  color: '#D97706', border: 'rgba(217,119,6,0.20)'  },
    accepted: { label: 'Accepted',  bg: 'rgba(207,157,123,0.08)',   color: '#CF9D7B', border: 'rgba(207,157,123,0.18)'   },
    declined: { label: 'Declined',  bg: 'rgba(232,52,26,0.08)',  color: '#E8341A', border: 'rgba(232,52,26,0.18)'  },
  };
  const s = map[status];
  return (
    <span
      className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-md border whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

export default async function AssignedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: rows } = await supabase
    .from('beneficiaries')
    .select('id, item_id, full_name, email, priority, items(*), acknowledgments(*)')
    .eq('owner_id', user.id)
    .order('full_name', { ascending: true });

  const beneficiaries = (rows ?? []) as unknown as BeneficiaryRow[];

  // Group by recipient email
  const groupMap = new Map<string, RecipientGroup>();
  for (const b of beneficiaries) {
    const key = b.email.toLowerCase();
    if (!groupMap.has(key)) {
      groupMap.set(key, { full_name: b.full_name, email: b.email, assignments: [] });
    }
    const ack = b.acknowledgments?.[0] ?? null;
    groupMap.get(key)!.assignments.push({
      beneficiary_id: b.id,
      item: b.items,
      ack_status: ack?.status ?? null,
    });
  }
  const groups = Array.from(groupMap.values());

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#0C1519' }}>

      {/* ── Dark green hero ── */}
      <div
        className="relative flex flex-col justify-end px-5 pb-10"
        style={{
          backgroundColor: '#0C1519',
          minHeight: '180px',
          maxHeight: '220px',
          paddingTop: '32px',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="max-w-2xl mx-auto w-full relative">
          <p
            className="font-mono uppercase tracking-[0.25em] mb-3"
            style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}
          >
            Your Assignments
          </p>
          <h1
            className="font-serif font-semibold leading-none mb-4"
            style={{ fontSize: 'clamp(48px, 12vw, 76px)', color: '#ffffff' }}
          >
            Assigned
          </h1>
          {groups.length > 0 && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {groups.length} recipient{groups.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '32px', overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 400 32" preserveAspectRatio="none" style={{ width: '100%', height: '32px', display: 'block' }}>
            <path d="M0,32 Q200,0 400,32 L400,32 L0,32 Z" fill="#0C1519"/>
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-24">

        {/* ── EMPTY STATE ── */}
        {groups.length === 0 && (
          <div className="pt-8">
            <div className="bg-jungle rounded-2xl border border-ink/10 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal">
                  <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-ink mb-3">You haven&apos;t assigned any items yet</h2>
              <p className="font-sans text-sm text-ink/50 leading-relaxed mb-6 max-w-sm mx-auto">
                When you assign an item to a recipient, it will appear here.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-jungle text-ink/60 border border-ink/15 font-sans font-medium py-3 px-6 rounded-xl hover:bg-ink/5 transition text-sm"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        )}

        {/* ── RECIPIENT GROUPS ── */}
        {groups.length > 0 && (
          <div className="space-y-8 pt-2">
            {groups.map((group) => (
              <div key={group.email}>
                {/* Recipient header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#CF9D7B' }}
                  >
                    <span className="font-mono font-semibold text-white" style={{ fontSize: '11px' }}>
                      {initials(group.full_name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-semibold text-sm truncate" style={{ color: '#E8E0D4' }}>
                      {group.full_name}
                    </p>
                    <p className="font-sans text-xs truncate" style={{ color: 'rgba(232,224,212,0.4)' }}>
                      {group.email}
                    </p>
                  </div>
                  <span
                    className="ml-auto shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: 'rgba(207,157,123,0.07)', color: 'rgba(207,157,123,0.55)' }}
                  >
                    {group.assignments.length} item{group.assignments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Item cards */}
                <div className="space-y-2 ml-0">
                  {group.assignments.map(({ beneficiary_id, item, ack_status }) => (
                    <Link
                      key={beneficiary_id}
                      href={`/items/${item.id}`}
                      className="flex items-center gap-3 bg-jungle rounded-2xl border px-3 py-3 hover:shadow-sm transition group"
                      style={{ borderColor: 'rgba(232,224,212,0.08)' }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-16 h-16 rounded-xl shrink-0 overflow-hidden relative"
                        style={{ backgroundColor: '#2A3038' }}
                      >
                        {item.photo_url ? (
                          <Image
                            src={item.photo_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: 'rgba(232,224,212,0.15)' }}>
                              <path d="M2 16L8 9l4 5 3-4 5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
                              <rect x="1" y="1" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-sans font-medium text-sm truncate"
                          style={{ color: '#E8E0D4' }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p
                            className="font-sans text-xs truncate mt-0.5"
                            style={{ color: 'rgba(232,224,212,0.4)' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <StatusBadge status={ack_status} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
