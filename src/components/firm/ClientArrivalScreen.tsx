import type { FC } from 'react';

/**
 * Screen 4 — Client arrival (co-branded landing page shown to the client,
 * rendered standalone without the firm app chrome).
 */
export const ClientArrivalScreen: FC = () => (
  <div className="max-w-[440px] mx-auto w-full px-4 sm:px-0">
    <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-2xl overflow-hidden shadow-sm">
      {/* Top — dark co-branded header */}
      <div className="bg-[var(--fw-ink)] p-5 text-center sm:p-[22px]">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--fw-coffee)] flex items-center justify-center">
            <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-[15px]">W</span>
          </div>
          <div className="text-sm text-[var(--fw-linen)] font-medium">Whitfield Estate Law</div>
        </div>
        <div className="text-[11px] text-[#EDE5DB]/60 mt-2">
          invited you to Heirlo
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-[22px] sm:px-6">
        <h3 className="font-['Fraunces',serif] font-light text-[22px] text-[var(--fw-ink)] leading-[1.2] mb-1.5 text-center">
          Welcome, Eleanor
        </h3>
        <div className="text-[13px] text-[var(--fw-ink-soft)] text-center leading-[1.55] mb-5">
          Your attorney set this up for you. Please confirm your details are right, then you can begin.
        </div>

        {/* Confirm block */}
        <div className="bg-[var(--fw-linen)] rounded-[11px] p-4 mb-4.5">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--fw-muted)] mb-3">
            Is this you?
          </div>
          {[
            { icon: 'ti-user', label: 'Name', value: 'Eleanor Mathers' },
            { icon: 'ti-mail', label: 'Email', value: 'eleanor.m@email.com' },
            { icon: 'ti-phone', label: 'Phone', value: '(404) 555-0173' },
          ].map(({ icon, label, value }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-[11px] py-2 ${i < arr.length - 1 ? 'border-b border-[#F0E9DE]' : 'border-none'
                }`}
            >
              <i className={`ti ${icon} text-[var(--fw-coffee)] text-[17px] w-[18px]`} />
              <span className="text-[11px] text-[var(--fw-muted)] w-[52px]">{label}</span>
              <span className="text-[13.5px] text-[var(--fw-ink)] font-medium break-all">{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-sm font-medium p-3 rounded-[10px] cursor-pointer mb-2.5 transition active:scale-[0.98]">
          <i className="ti ti-check mr-1.5" />
          Yes, this is me. Get started
        </div>

        {/* Alt action */}
        <div className="text-center text-[12.5px] text-[var(--fw-coffee)] p-1.5 cursor-pointer">
          Something looks wrong? Tell Whitfield Estate Law
        </div>

        {/* Legal placeholder */}
        <div className="text-[10.5px] text-[var(--fw-muted)] italic text-center leading-[1.5] mt-3.5 px-2">
          [Placeholder for April: consent and terms language shown here at first sign-in,
          referencing UPC 2-513 and advising the client to consult a licensed estate attorney.]
        </div>
      </div>
    </div>
  </div>
);
