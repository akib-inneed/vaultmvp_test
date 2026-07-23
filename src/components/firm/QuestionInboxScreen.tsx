'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import type { FirmView } from './types';

interface QuestionInboxScreenProps {
  onNavigate: (view: FirmView) => void;
}

interface QuestionInboxScreenRoutedProps {
  slug: string;
}

const questions = [
  {
    initials: 'CM',
    name: 'Clara Mathers',
    sub: 'Recipient · Eleanor\'s daughter',
    excerpt: '"My mother left me her ring and her recipes. Do I need to do anything now, or..."',
    time: '3 hours ago',
    unread: true,
    navigable: true,
  },
  {
    initials: 'TM',
    name: 'Thomas Mathers',
    sub: 'Recipient · Eleanor\'s son',
    excerpt: '"Is the clock considered part of the estate, or separate since it was assigned to..."',
    time: 'Yesterday',
    unread: true,
    navigable: false,
  },
  {
    initials: 'RC',
    name: 'Robert Chen',
    sub: 'Client',
    excerpt: '"I want to add my brother as a second recipient on the watch. How do I..."',
    time: 'Jun 28',
    unread: false,
    navigable: false,
  },
];

export const QuestionInboxScreen: FC<QuestionInboxScreenProps> = ({ onNavigate }) => (
  <div>
    <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
      Reached you through Heirlo
    </div>
    <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0">
      Questions
    </h2>
    <p className="text-[13px] text-[var(--fw-ink-soft)] mx-1 mt-2 mb-0 max-w-[620px]">
      People a client named as a recipient, or the client themselves, who chose to send you a question.
      You are their default because they came in through your firm.
    </p>

    {/* Table */}
    <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl overflow-hidden mt-[18px]">
      {/* Header */}
      <div className="hidden lg:grid grid-cols-[1.6fr_1.5fr_0.9fr_0.4fr] gap-3 px-[18px] py-[13px] bg-[var(--fw-linen)] border-b border-[var(--fw-line)] items-center">
        {['From', 'Question', 'Received', ''].map((h) => (
          <div key={h} className="text-[10px] tracking-[0.12em] uppercase text-[var(--fw-muted)]">{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {questions.map((q, i) => (
          <div
            key={q.name}
            onClick={() => q.navigable && onNavigate('question')}
            className={`flex flex-col lg:grid lg:grid-cols-[1.6fr_1.5fr_0.9fr_0.4fr] gap-3 p-4 lg:px-[18px] lg:py-[13px] ${i < questions.length - 1 ? 'border-b border-[#F0E9DE]' : 'border-none'
              } lg:items-center ${q.navigable ? 'cursor-pointer hover:bg-[var(--fw-linen)]' : 'cursor-default'
              } transition-colors relative`}
          >
            {/* From person */}
            <div className="flex items-center gap-[11px]">
              <div className="w-8 h-8 rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-xs font-medium text-[var(--fw-coffee)] shrink-0">
                {q.initials}
              </div>
              <div>
                <div className="text-sm text-[var(--fw-ink)] font-medium flex items-center gap-1.5">
                  {q.name}
                  {q.unread && (
                    <span className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--fw-red)]" />
                  )}
                </div>
                <div className="text-[11.5px] text-[var(--fw-muted)]">{q.sub}</div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="text-[12.5px] text-[var(--fw-ink-soft)] leading-[1.4] line-clamp-2 md:line-clamp-none">{q.excerpt}</div>

            {/* Time */}
            <div className="text-xs text-[var(--fw-ink-soft)] mt-1 lg:mt-0">{q.time}</div>

            {/* Chevron */}
            <div className={`hidden lg:block text-right text-[17px] ${q.navigable ? 'text-[var(--fw-brass)]' : 'text-[var(--fw-line)]'}`}>
              <i className="ti ti-chevron-right" />
            </div>
            {q.navigable && (
              <div className="absolute top-1/2 right-4 -translate-y-1/2 lg:hidden text-[17px] text-[var(--fw-brass)]">
                <i className="ti ti-chevron-right" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Routed version — used by /firm/[slug]/questions page.
 */
export const QuestionInboxScreenRouted: FC<QuestionInboxScreenRoutedProps> = ({ slug }) => {
  const router = useRouter();
  function navigate(view: FirmView) {
    if (view === 'question') router.push(`/firms/${slug}/questions/clara-mathers`);
    else router.push(`/firms/${slug}/questions`);
  }
  return <QuestionInboxScreen onNavigate={navigate} />;
};
