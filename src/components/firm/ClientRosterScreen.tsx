'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface ClientRosterScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface ClientRosterScreenRoutedProps {
  slug: string;
}

const clients = [
  { initials: 'EM', name: 'Eleanor Mathers', sub: '23 items documented', status: 'shared', meta: '2 days ago', navigable: true },
  { initials: 'RC', name: 'Robert Chen', sub: '8 items documented', status: 'progress', meta: '5 hours ago', navigable: false },
  { initials: 'SP', name: 'Sofia Petrov', sub: 'Invitation emailed', status: 'invited', meta: 'Sent Jun 24', navigable: false },
  { initials: 'JW', name: 'James Whitaker', sub: '41 items documented', status: 'shared', meta: '1 week ago', navigable: true },
];

const STATUS_BADGE: Record<string, { label: string; icon: string; style: React.CSSProperties }> = {
  shared: {
    label: 'Shared',
    icon: 'ti-check',
    style: { background: 'var(--fw-soft)', color: 'var(--fw-coffee)' },
  },
  progress: {
    label: 'In progress',
    icon: 'ti-progress',
    style: { background: 'var(--fw-sage)', color: 'var(--fw-sage-tx)' },
  },
  invited: {
    label: 'Invited',
    icon: 'ti-mail-check',
    style: { background: 'var(--fw-cream)', color: 'var(--fw-muted)' },
  },
};

export const ClientRosterScreen: FC<ClientRosterScreenProps> = ({ onNavigate }) => (
  <div>
    {/* Eyebrow + heading */}
    <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
      Your clients
    </div>
    <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0">
      Client roster
    </h2>

    {/* Stat tiles */}
    <div className="flex flex-col sm:flex-row gap-3 my-5">
      {[
        { v: '14', l: 'Invited' },
        { v: '6', l: 'In progress' },
        { v: '5', l: 'Shared with you', accent: true },
      ].map(({ v, l, accent }) => (
        <div
          key={l}
          className="flex-1 bg-[var(--fw-cream)] rounded-[10px] px-4 py-3.5"
        >
          <div className={`text-2xl font-medium ${accent ? 'text-[var(--fw-coffee)]' : 'text-[var(--fw-ink)]'}`}>{v}</div>
          <div className="text-[11.5px] text-[var(--fw-ink-soft)] tracking-[0.03em]">{l}</div>
        </div>
      ))}
    </div>

    {/* Toolbar */}
    <div className="flex flex-wrap items-center justify-between mx-1 mt-1.5 mb-3 gap-2">
      <div className="flex items-center gap-2 bg-[var(--fw-linen)] border border-[var(--fw-line)] rounded-lg px-3 py-2 flex-1 max-w-[300px] text-[var(--fw-muted)] text-[13px]">
        <i className="ti ti-search" /> Search clients
      </div>
      <button
        onClick={() => onNavigate('invite')}
        className="flex items-center gap-1.5 border border-[var(--fw-brass)] rounded-lg px-3.5 py-2 text-[13px] text-[var(--fw-coffee)] font-medium cursor-pointer bg-transparent font-sans whitespace-nowrap"
      >
        <i className="ti ti-plus" /> Invite client
      </button>
    </div>

    {/* Table */}
    <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl overflow-hidden mt-4 lg:mt-0">
      {/* Header */}
      <div className="hidden lg:grid grid-cols-[1.7fr_1fr_0.9fr_0.4fr] gap-3 px-[18px] py-[13px] bg-[var(--fw-linen)] border-b border-[var(--fw-line)] items-center">
        {['Client', 'Status', 'Last activity', ''].map((h) => (
          <div key={h} className="text-[10px] tracking-[0.12em] uppercase text-[var(--fw-muted)]">{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {clients.map((c, i) => {
          const badge = STATUS_BADGE[c.status];
          return (
            <div
              key={c.name}
              onClick={() => c.navigable && onNavigate('detail')}
              className={`flex flex-col lg:grid lg:grid-cols-[1.7fr_1fr_0.9fr_0.4fr] gap-3 p-4 lg:px-[18px] lg:py-[13px] ${i < clients.length - 1 ? 'border-b border-[#F0E9DE]' : ''
                } lg:items-center ${c.navigable ? 'cursor-pointer hover:bg-[var(--fw-linen)]' : 'cursor-default'
                } transition-colors relative`}
            >
              {/* Person */}
              <div className="flex items-center gap-[11px]">
                <div className="w-8 h-8 rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-xs font-medium text-[var(--fw-coffee)] shrink-0">
                  {c.initials}
                </div>
                <div>
                  <div className="text-sm text-[var(--fw-ink)] font-medium">{c.name}</div>
                  <div className="text-[11.5px] text-[var(--fw-muted)]">{c.sub}</div>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-2 lg:mt-0">
                <span
                  className="inline-flex items-center gap-1.25 text-[11px] font-medium px-2.5 py-1 rounded-[20px]"
                  style={badge.style}
                >
                  <i className={`ti ${badge.icon} mr-1`} /> {badge.label}
                </span>
              </div>

              {/* Meta */}
              <div className="text-xs text-[var(--fw-ink-soft)] mt-1 lg:mt-0">{c.meta}</div>

              {/* Chevron */}
              <div className={`hidden lg:block text-right text-[17px] ${c.navigable ? 'text-[var(--fw-brass)]' : 'text-[var(--fw-line)]'}`}>
                <i className="ti ti-chevron-right" />
              </div>
              {c.navigable && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 lg:hidden text-[17px] text-[var(--fw-brass)]">
                  <i className="ti ti-chevron-right" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {/* Consent note */}
    <div className="flex items-start lg:items-center gap-1.5 px-1.5 py-3 text-[11.5px] text-[var(--fw-muted)] italic font-['Fraunces',serif]">
      <i className="ti ti-lock mt-0.5 lg:mt-0" /> You can open a client&apos;s items only after they choose to share.
    </div>
  </div>
);

/**
 * Routed version — used by /firm/[slug]/clients page.
 * Navigates via Next.js router instead of the onNavigate callback.
 */
export const ClientRosterScreenRouted: FC<ClientRosterScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'invite') router.push(`/firms/${slug}/invite`);
    else if (view === 'detail') router.push(`/firms/${slug}/clients/eleanor-mathers`);
    else router.push(`/firms/${slug}/clients`);
  }
  return <ClientRosterScreen onNavigate={navigate} />;
};
