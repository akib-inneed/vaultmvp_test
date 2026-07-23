'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface QuestionDetailScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface QuestionDetailScreenRoutedProps {
  slug: string;
  questionId: string;
}

export const QuestionDetailScreen: FC<QuestionDetailScreenProps> = ({ onNavigate }) => (
  <div>
    {/* Back */}
    <button
      onClick={() => onNavigate('inbox')}
      className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
    >
      <i className="ti ti-arrow-left" /> Back to questions
    </button>

    {/* Person header */}
    <div className="flex items-center gap-3.5 mb-1">
      <div className="w-[52px] h-[52px] rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-lg font-medium text-[var(--fw-coffee)]">
        CM
      </div>
      <div>
        <h2 className="font-['Fraunces',serif] font-light text-[23px] text-[var(--fw-ink)] m-0">
          Clara Mathers
        </h2>
        <div className="text-[12.5px] text-[var(--fw-muted)]">
          Recipient · named by Eleanor Mathers, your client
        </div>
      </div>
    </div>

    {/* Question card */}
    <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-[14px] p-4 sm:p-[22px] mt-4">
      {/* Meta row */}
      <div className="flex gap-5 flex-wrap py-3.5 border-b border-[#F0E9DE] mb-4">
        {[
          { label: 'From', value: 'Clara Mathers', style: {} },
          { label: 'Email', value: 'clara.m@email.com', style: { color: 'var(--fw-coffee)' } },
          { label: 'Relationship', value: 'Recipient (daughter)', style: {} },
          { label: 'Received', value: '3 hours ago', style: {} },
        ].map(({ label, value, style }) => (
          <div key={label} className="text-[12.5px]">
            <b className="block text-[10.5px] tracking-[0.08em] uppercase text-[var(--fw-muted)] mb-[3px] font-medium">
              {label}
            </b>
            <span className="text-[var(--fw-ink)] font-medium" style={style}>{value}</span>
          </div>
        ))}
      </div>

      {/* Question text */}
      <div className="text-[14.5px] text-[var(--fw-ink)] leading-[1.65] font-['Fraunces',serif] font-light bg-[var(--fw-linen)] rounded-[10px] py-4 px-[18px] mb-2">
        "My mother, Eleanor, left me her sapphire ring and her recipe collection through Heirlo.
        I accepted them. Do I need to do anything now to make it official, or does that happen later?
        And should I be thinking about my own planning too?"
      </div>

      {/* Context strip */}
      <div className="flex items-center gap-2.5 bg-[var(--fw-soft)] rounded-[10px] py-3 px-3.5 my-3.5">
        <i className="ti ti-link text-[var(--fw-coffee)] text-lg" />
        <div className="text-[12.5px] text-[var(--fw-ink-soft)] leading-[1.5]">
          Clara arrived through <strong>Eleanor Mathers</strong>, your existing client.
          She was named as a recipient of 2 items. She has not started her own Heirlo plan yet.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 mt-[18px]">
        <button
          className="flex-1 bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-sm font-medium p-3 rounded-[10px] cursor-pointer border-none font-sans flex items-center justify-center gap-1.5"
        >
          <i className="ti ti-mail" /> Reply to Clara
        </button>
        <button
          className="flex-1 border border-[var(--fw-line)] text-[var(--fw-coffee)] text-center text-sm p-3 rounded-[10px] cursor-pointer bg-transparent font-sans"
        >
          Mark as handled
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 items-start mt-4 text-[11px] text-[var(--fw-muted)] italic leading-[1.5]">
        <i className="ti ti-info-circle mt-[1px]" />
        Clara reached you through Heirlo. Contacting her does not by itself create an attorney-client
        relationship. Heirlo does not provide legal advice.
      </div>
    </div>
  </div>
);

/**
 * Routed version — used by /firm/[slug]/questions/[id] page.
 */
export const QuestionDetailScreenRouted: FC<QuestionDetailScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'inbox') router.push(`/firms/${slug}/questions`);
    else router.push(`/firms/${slug}/questions`);
  }
  return <QuestionDetailScreen onNavigate={navigate} />;
};
