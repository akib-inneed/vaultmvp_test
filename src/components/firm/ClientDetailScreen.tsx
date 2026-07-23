'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface ClientDetailScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface ClientDetailScreenRoutedProps {
  slug: string;
  clientId: string;
}

const items = [
  { icon: 'ti-diamond', name: 'Sapphire ring', recipient: 'For: Clara Mathers (daughter)', note: '"The one she wore every day. I want Clara to have it."' },
  { icon: 'ti-clock', name: 'Mantel clock', recipient: 'For: Thomas Mathers (son)', note: '"Grandfather brought it from Vienna. Tom always loved it."' },
  { icon: 'ti-book', name: 'Recipe collection', recipient: 'For: Clara Mathers (daughter)', note: '"Three generations of Sunday dinners, in one box."' },
  { icon: 'ti-photo', name: 'Portrait, 1961', recipient: 'For: Margaret Ellis (sister)', note: '"Our mother\'s wedding portrait. Maggie should keep it."' },
];

export const ClientDetailScreen: FC<ClientDetailScreenProps> = ({ onNavigate }) => (
  <div>
    {/* Back */}
    <button
      onClick={() => onNavigate('roster')}
      className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
    >
      <i className="ti ti-arrow-left" /> Back to roster
    </button>

    {/* Client header */}
    <div className="flex items-center gap-3.5 mb-1">
      <div className="w-[52px] h-[52px] rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-lg font-medium text-[var(--fw-coffee)]">
        EM
      </div>
      <div>
        <h2 className="font-['Fraunces',serif] font-light text-[23px] text-[var(--fw-ink)] m-0">
          Eleanor Mathers
        </h2>
        <div className="text-[12.5px] text-[var(--fw-muted)]">
          Shared 2 days ago · 23 items · 6 recipients named
        </div>
      </div>
    </div>

    {/* Read-only pill */}
    <div className="my-[10px] mb-0.5">
      <span className="inline-flex items-center gap-1.5 bg-[var(--fw-cream)] text-[var(--fw-muted)] text-[11px] font-medium px-[11px] py-1 rounded-[20px]">
        <i className="ti ti-eye" /> Read-only · shared by the client
      </span>
    </div>

    {/* Items grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-[18px]">
      {items.map((item) => (
        <div
          key={item.name}
          className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl p-3.5"
        >
          <div className="flex gap-[11px] items-center mb-2.5">
            <div className="w-[42px] h-[42px] rounded-[9px] bg-[var(--fw-cream)] flex items-center justify-center text-[var(--fw-coffee)] text-xl shrink-0">
              <i className={`ti ${item.icon}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--fw-ink)]">{item.name}</div>
              <div className="text-[11.5px] text-[var(--fw-coffee)]">{item.recipient}</div>
            </div>
          </div>
          <div className="text-xs text-[var(--fw-ink-soft)] leading-[1.5] border-t border-[#F0E9DE] pt-[9px]">
            {item.note}
          </div>
        </div>
      ))}
    </div>
  </div >
);

/**
 * Routed version — used by /firm/[slug]/clients/[id] page.
 */
export const ClientDetailScreenRouted: FC<ClientDetailScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'roster') router.push(`/firms/${slug}/clients`);
    else router.push(`/firms/${slug}/clients`);
  }
  return <ClientDetailScreen onNavigate={navigate} />;
};
