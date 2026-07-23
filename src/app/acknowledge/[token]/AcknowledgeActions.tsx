'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { respondToAcknowledgment } from '../actions';

interface AcknowledgeActionsProps {
  token: string;
}

type ActionState = 'idle' | 'saving' | 'success';

export function AcknowledgeActions({ token }: AcknowledgeActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [activeAction, setActiveAction] = useState<'accepted' | 'declined' | null>(null);
  const router = useRouter();

  async function respond(response: 'accepted' | 'declined') {
    if (actionState === 'saving') return;
    setActionState('saving');
    setActiveAction(response);
    setError(null);

    try {
      const result = await respondToAcknowledgment(token, response);

      if (result.error) {
        setError(result.error);
        setActionState('idle');
        setActiveAction(null);
      } else if (result.alreadyResponded || result.success) {
        setActionState('success');
        setTimeout(() => router.push('/dashboard'), 500);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setActionState('idle');
      setActiveAction(null);
    }
  }

  const isSaving = actionState === 'saving';
  const isSuccess = actionState === 'success';

  return (
    <div>
      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm font-sans">{error}</p>
        </div>
      )}

      <button
        onClick={() => respond('accepted')}
        disabled={isSaving || isSuccess}
        className="w-full rounded-full py-3 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: isSuccess && activeAction === 'accepted' ? '#059669' : '#CF9D7B',
          color: '#0C1519',
        }}
        onMouseEnter={(e) => {
          if (!isSaving && !isSuccess) e.currentTarget.style.backgroundColor = '#B8885F';
        }}
        onMouseLeave={(e) => {
          if (!isSaving && !isSuccess) e.currentTarget.style.backgroundColor = '#CF9D7B';
        }}
      >
        {isSaving && activeAction === 'accepted' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {isSaving && activeAction === 'accepted' ? 'Saving...' : isSuccess && activeAction === 'accepted' ? 'Accepted' : 'Accept'}
      </button>

      <p className="text-center mt-4">
        <button
          onClick={() => respond('declined')}
          disabled={isSaving || isSuccess}
          className="text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ color: 'rgba(245,239,232,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(245,239,232,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,239,232,0.4)'; }}
        >
          {isSaving && activeAction === 'declined' ? 'Saving...' : 'Decline'}
        </button>
      </p>
    </div>
  );
}
