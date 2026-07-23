'use client';

import { useState } from 'react';
import type { FirmView } from './types';
import { FirmTopBar } from './FirmTopBar';
import { FirmTabs } from './FirmTabs';
import { ClientRosterScreen } from './ClientRosterScreen';
import { InviteClientScreen } from './InviteClientScreen';
import { InviteSentScreen } from './InviteSentScreen';
import { ClientArrivalScreen } from './ClientArrivalScreen';
import { ClientDetailScreen } from './ClientDetailScreen';
import { QuestionInboxScreen } from './QuestionInboxScreen';
import { QuestionDetailScreen } from './QuestionDetailScreen';

interface FirmDashboardProps {
  firmName?: string;
  firmEmail?: string;
}

// Views that belong to the "clients" tab group
const CLIENT_TAB_VIEWS: FirmView[] = ['roster', 'invite', 'link', 'detail'];
// Views that show WITHOUT the app chrome (client-facing)
const CHROMELESS_VIEWS: FirmView[] = ['arrival'];

export function FirmDashboard({ firmName = 'Whitfield Estate Law', firmEmail = 'a.whitfield@firm.com' }: FirmDashboardProps) {
  const [view, setView] = useState<FirmView>('roster');

  const activeTab = CLIENT_TAB_VIEWS.includes(view) ? 'clients' : 'questions';
  const isChromeless = CHROMELESS_VIEWS.includes(view);

  function navigate(next: FirmView) {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderScreen() {
    switch (view) {
      case 'roster': return <ClientRosterScreen onNavigate={navigate} />;
      case 'invite': return <InviteClientScreen onNavigate={navigate} />;
      case 'link': return <InviteSentScreen onNavigate={navigate} />;
      case 'arrival': return <ClientArrivalScreen />;
      case 'detail': return <ClientDetailScreen onNavigate={navigate} />;
      case 'inbox': return <QuestionInboxScreen onNavigate={navigate} />;
      case 'question': return <QuestionDetailScreen onNavigate={navigate} />;
    }
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 font-sans">
      {/* ── Screen animation wrapper ── */}
      <div key={view} className="animate-[fw-fade_0.3s_ease]">
        {isChromeless ? (
          /* Arrival — chromeless (client-facing, no firm app chrome) */
          <div className="pt-2">
            {renderScreen()}
          </div>
        ) : (
          /* Standard firm app chrome */
          <div className="bg-[var(--fw-linen)] border border-[var(--fw-line)] rounded-[18px] overflow-hidden">
            <FirmTopBar firmName={firmName} firmEmail={firmEmail} />
            <FirmTabs
              activeTab={activeTab}
              questionCount={2}
              onTabChange={() => { }}
              onNavigate={navigate}
            />
            <div className="p-4 sm:p-[26px]">
              {renderScreen()}
            </div>
          </div>
        )}
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes fw-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
