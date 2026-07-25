'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface InviteSentScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface InviteSentScreenRoutedProps {
  slug: string;
}

export const InviteSentScreen: FC<InviteSentScreenProps> = ({ onNavigate }) => (
  <div>
    {/* Back */}
    <button
      onClick={() => onNavigate('invite')}
      className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
    >
      <i className="ti ti-arrow-left" /> Back
    </button>

    <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
      Invite sent
    </div>
    <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0">
      Eleanor has been invited
    </h2>

    {/* Sent banner */}
    <div className="flex items-center gap-3 bg-[var(--fw-soft)] rounded-[11px] px-4 py-3.5 max-w-[560px] mt-4 mb-2">
      <div className="w-[34px] h-[34px] rounded-full bg-[var(--fw-coffee)] flex items-center justify-center shrink-0">
        <i className="ti ti-mail-check text-[18px] text-[var(--fw-linen)]" />
      </div>
      <div className="text-[13px] text-[var(--fw-ink)] leading-[1.4]">
        A co-branded invitation was emailed to <strong>eleanor.m@email.com</strong>.
        She&apos;ll show as <strong>Invited</strong> in your roster until she gets started.
      </div>
    </div>

    {/* What Eleanor receives label */}
    <div className="text-[11px] tracking-[0.1em] uppercase text-[var(--fw-muted)] mt-[22px] mb-2.5">
      What Eleanor receives
    </div>

    {/* Email preview card */}
    <div className="max-w-[560px] bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-[14px] overflow-hidden">
      {/* Email meta */}
      <div className="px-[18px] py-3.5 border-b border-[#F0E9DE] text-xs text-[var(--fw-muted)]">
        {[
          { k: 'From', v: <><strong>Whitfield Estate Law</strong> via Heirlo &lt;hello@heirlo.app&gt;</> },
          { k: 'Reply-to', v: 'a.whitfield@firm.com' },
          { k: 'Subject', v: <strong>Whitfield Estate Law invited you to document what matters</strong> },
        ].map(({ k, v }) => (
          <div key={k} className="flex gap-2 mb-[3px] flex-wrap sm:flex-nowrap">
            <span className="w-11 text-[var(--fw-muted)] shrink-0">{k}</span>
            <span className="text-[var(--fw-ink-soft)]">{v}</span>
          </div>
        ))}
      </div>

      {/* Email header */}
      <div className="bg-[var(--fw-ink)] p-5 text-center">
        <div className="inline-flex items-center gap-[9px]">
          <div className="w-7 h-7 rounded-full bg-[var(--fw-coffee)] flex items-center justify-center">
            <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-sm">W</span>
          </div>
          <span className="text-[13px] text-[var(--fw-linen)] font-medium">Whitfield Estate Law</span>
          <span className="text-[#CF9D7B]/40 text-[13px]">×</span>
          <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-sm tracking-[0.04em]">Heirlo</span>
        </div>
      </div>

      {/* Email body */}
      <div className="px-[22px] py-6">
        <h3 className="font-['Fraunces',serif] font-light text-[20px] text-[var(--fw-ink)] mb-3 leading-[1.25]">
          Eleanor, your attorney has a gift of clarity for you
        </h3>
        <p className="text-[13px] text-[var(--fw-ink-soft)] leading-[1.6] mb-3.5">
          Whitfield Estate Law uses Heirlo to help you document your personal belongings, the pieces that carry
          meaning, and note who each should go to. It takes the pressure off the paperwork and makes sure your
          wishes are captured in your own words.
        </p>
        <p className="text-[13px] text-[var(--fw-ink-soft)] leading-[1.6] mb-3.5">
          Your details are already set up. Just tap below to begin, best done on your phone, where you can
          photograph each item as you go.
        </p>
        <div className="bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-[13.5px] font-medium p-3 rounded-md mt-1.5 mb-4">
          Get started with Heirlo
        </div>
        <div className="text-[10.5px] text-[var(--fw-muted)] italic leading-[1.5] border-t border-[#F0E9DE] pt-3">
          [Placeholder for April: this email is co-branded and sent by Heirlo on the firm&apos;s behalf.
          Consent framing, any reference to the attorney-client relationship, and UPC 2-513 / &quot;memorandum&quot; language
          to be reviewed before launch. Includes unsubscribe and sender identification per CAN-SPAM.]
        </div>
      </div>
    </div>
  </div>
);

/**
 * Routed version — used by /firm/[slug]/invite-sent page.
 */
export const InviteSentScreenRouted: FC<InviteSentScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'invite') router.push(`/firms/${slug}/invite`);
    else router.push(`/firms/${slug}/clients`);
  }
  return <InviteSentScreen onNavigate={navigate} />;
};
