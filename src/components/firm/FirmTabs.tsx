'use client';

import type { FC } from 'react';
import type { FirmView } from './types';

interface FirmTabsProps {
  activeTab: 'clients' | 'questions';
  questionCount?: number;
  onTabChange: (tab: 'clients' | 'questions') => void;
  onNavigate: (view: FirmView) => void;
}

function tabStyle(active: boolean): string {
  return `px-4 py-3.5 text-[13.5px] font-sans flex items-center gap-[7px] cursor-pointer bg-transparent border-none transition-colors ${active
      ? 'text-[var(--fw-ink)] font-medium border-b-2 border-b-[var(--fw-coffee)]'
      : 'text-[var(--fw-muted)] font-normal border-b-2 border-b-transparent'
    }`;
}

export const FirmTabs: FC<FirmTabsProps> = ({
  activeTab,
  questionCount = 2,
  onTabChange,
  onNavigate,
}) => {
  function handleClients() {
    onTabChange('clients');
    onNavigate('roster');
  }

  function handleQuestions() {
    onTabChange('questions');
    onNavigate('inbox');
  }

  return (
    <div className="bg-[var(--fw-card)] border-b border-[var(--fw-line)] flex px-4 sm:px-[26px] gap-1 overflow-x-auto">
      {/* Clients tab */}
      <button onClick={handleClients} className={tabStyle(activeTab === 'clients')}>
        <i className="ti ti-users" />
        Clients
      </button>

      {/* Questions tab */}
      <button onClick={handleQuestions} className={tabStyle(activeTab === 'questions')}>
        <i className="ti ti-messages" />
        Questions
        {questionCount > 0 && (
          <span className="bg-[var(--fw-red)] text-[var(--fw-linen)] text-[10px] font-bold rounded-[10px] px-[7px] py-[1px] ml-0.5">
            {questionCount}
          </span>
        )}
      </button>
    </div>
  );
};
