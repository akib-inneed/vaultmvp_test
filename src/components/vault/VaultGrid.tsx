'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BenAck {
  status: string;
}

interface Beneficiary {
  id: string;
  priority: 'primary' | 'secondary';
  acknowledgments: BenAck[];
}

interface VaultItem {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  estimated_value: number | null;
  created_at: string;
  beneficiaries: Beneficiary[];
}

type SortOrder = 'newest' | 'oldest';

const BADGE_STYLES: Record<string, { label: string; className: string }> = {
  accepted: { label: 'Accepted', className: 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/40' },
  pending:  { label: 'Awaiting', className: 'bg-[#CF9D7B]/10 text-[#CF9D7B] border border-[#CF9D7B]/20' },
  declined: { label: 'Declined', className: 'bg-red-900/40 text-red-400 border border-red-800/40' },
};

export function VaultGrid({ items }: { items: VaultItem[] }) {
  const [sort, setSort] = useState<SortOrder>('newest');

  const sorted = [...items].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sort === 'newest' ? db - da : da - db;
  });

  return (
    <>
      {/* Sort pills */}
      <div className="flex items-center justify-end gap-1.5 mb-3">
        <button
          onClick={() => setSort('newest')}
          className={`text-xs font-sans px-3 py-1 rounded-full transition ${
            sort === 'newest'
              ? 'text-cream font-medium'
              : 'text-ink/35 border border-ink/12 hover:text-ink/50'
          }`}
          style={sort === 'newest' ? { backgroundColor: '#8B6F4E' } : undefined}
        >
          Newest
        </button>
        <button
          onClick={() => setSort('oldest')}
          className={`text-xs font-sans px-3 py-1 rounded-full transition ${
            sort === 'oldest'
              ? 'text-cream font-medium'
              : 'text-ink/35 border border-ink/12 hover:text-ink/50'
          }`}
          style={sort === 'oldest' ? { backgroundColor: '#8B6F4E' } : undefined}
        >
          Oldest
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Add item card */}
        <Link
          href="/items/new"
          className="group block bg-jungle rounded-2xl border border-dashed border-ink/15 overflow-hidden hover:border-teal/40 hover:shadow-md transition-all duration-200"
        >
          <div className="aspect-[3/4] relative flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-teal/20 transition">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-sans text-sm text-ink/40 group-hover:text-teal transition">Add item</p>
            </div>
          </div>
        </Link>

        {sorted.map((item) => {
          const primary = (item.beneficiaries ?? []).find((b) => b.priority === 'primary');
          const primaryStatus = primary?.acknowledgments?.[0]?.status ?? (primary ? 'pending' : null);
          const badge = primaryStatus ? BADGE_STYLES[primaryStatus] ?? BADGE_STYLES.pending : null;

          return (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group block bg-jungle rounded-2xl border border-ink/10 overflow-hidden hover:border-teal/40 hover:shadow-md transition-all duration-200"
            >
              {/* Photo */}
              <div className="aspect-[3/4] relative bg-jet overflow-hidden">
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-teal/30">
                      <rect x="6" y="4" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M13 14h14M13 20h14M13 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                {/* Status badge — top-left */}
                {badge && (
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 h-[76px] sm:h-[80px] flex flex-col justify-start">
                <h3 className="font-sans font-medium text-ink text-sm leading-snug truncate group-hover:text-teal transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-ink/40 font-sans mt-1 truncate leading-snug min-h-[16px]">
                  {item.description || '\u00A0'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
