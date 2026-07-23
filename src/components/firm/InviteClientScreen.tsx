'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface InviteClientScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface InviteClientScreenRoutedProps {
  slug: string;
}

const fields = [
  { label: 'Full name', icon: 'ti-user', value: 'Eleanor Mathers', hint: null, required: true },
  { label: 'Email', icon: 'ti-mail', value: 'eleanor.m@email.com', hint: 'Used to confirm identity and as her account login.', required: true },
  { label: 'Phone', icon: 'ti-phone', value: '(404) 555-0173', hint: 'A second point of confirmation, and how she can be reached.', required: true },
];

export const InviteClientScreen: FC<InviteClientScreenProps> = ({ onNavigate }) => (
  <div>
    {/* Back */}
    <button
      onClick={() => onNavigate('roster')}
      className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
    >
      <i className="ti ti-arrow-left" /> Back to roster
    </button>

    <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
      Add a client
    </div>
    <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0 mb-5">
      Invite a client
    </h2>

    <div className="max-w-[520px]">
      <p className="text-[13.5px] text-[var(--fw-ink-soft)] leading-[1.6] my-1.5 mb-5 max-w-[480px]">
        Enter your client's details. Heirlo emails them a co-branded invitation right away, from your firm,
        and sets up their account so they can start documenting. Their name, phone, and email pre-fill their profile.
      </p>

      {/* Fields */}
      {fields.map((f) => (
        <div key={f.label} className="mb-4">
          <label className="block text-xs font-medium text-[var(--fw-ink)] mb-1.5 tracking-[0.02em]">
            {f.label} {f.required && <span className="text-[var(--fw-coffee)]">*</span>}
          </label>
          <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-[9px] px-[13px] py-[11px] text-sm text-[var(--fw-ink)] flex items-center gap-[9px]">
            <i className={`ti ${f.icon} text-[var(--fw-muted)] text-base`} />
            <span>{f.value}</span>
          </div>
          {f.hint && (
            <div className="text-[11px] text-[var(--fw-muted)] mt-[5px] leading-[1.4]">
              {f.hint}
            </div>
          )}
        </div>
      ))}

      {/* Shield note */}
      <div className="bg-[var(--fw-soft)] rounded-[10px] px-[15px] py-[13px] flex gap-2.5 items-start mt-2">
        <i className="ti ti-shield-check text-[var(--fw-coffee)] text-[17px] mt-[1px]" />
        <div className="text-xs text-[var(--fw-ink-soft)] leading-[1.5]">
          Heirlo emails Eleanor a co-branded invitation the moment you send. Her details are bound to the
          invite, so her record is set up and confirmed as your client's when she opens it.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 mt-[22px]">
        <button
          onClick={() => onNavigate('link')}
          className="flex-1 bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-sm font-medium p-3 rounded-[10px] cursor-pointer border-none font-sans flex items-center justify-center gap-1.5"
        >
          <i className="ti ti-send" /> Send invitation
        </button>
        <button
          onClick={() => onNavigate('roster')}
          className="flex-none sm:basis-[120px] border border-[var(--fw-line)] text-[var(--fw-coffee)] text-center text-sm p-3 rounded-[10px] cursor-pointer bg-transparent font-sans"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

/**
 * Routed version — used by /firm/[slug]/invite page.
 */
export const InviteClientScreenRouted: FC<InviteClientScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'roster') router.push(`/firms/${slug}/clients`);
    else if (view === 'link') router.push(`/firms/${slug}/invite-sent`);
    else router.push(`/firms/${slug}/clients`);
  }
  return <InviteClientScreen onNavigate={navigate} />;
};
