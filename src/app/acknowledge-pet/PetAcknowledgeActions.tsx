'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PetAcknowledgeActionsProps {
  acknowledgmentId: string;
  petName: string;
}

type ActionState = 'idle' | 'saving' | 'success';

export function PetAcknowledgeActions({ acknowledgmentId, petName }: PetAcknowledgeActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [activeAction, setActiveAction] = useState<'accepted' | 'declined' | null>(null);

  async function respond(action: 'accepted' | 'declined') {
    if (actionState === 'saving') return;
    setActionState('saving');
    setActiveAction(action);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Your session has expired. Please sign in again.');
        setActionState('idle');
        setActiveAction(null);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/acknowledge-pet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ acknowledgment_id: acknowledgmentId, action }),
        }
      );

      const body = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setError('This assignment is for a different email address. Please sign in with the correct account.');
        } else if (res.status === 409) {
          // Already responded, treat as success
          setActionState('success');
          return;
        } else {
          setError(body?.error ?? 'Something went wrong. Please try again.');
        }
        setActionState('idle');
        setActiveAction(null);
        return;
      }

      setActionState('success');
    } catch {
      setError('Something went wrong. Please try again.');
      setActionState('idle');
      setActiveAction(null);
    }
  }

  const isSaving = actionState === 'saving';
  const isSuccess = actionState === 'success';

  if (isSuccess) {
    return (
      <div className="text-center">
        {activeAction === 'accepted' ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg" style={{ color: '#3DB87A' }}>&#10003;</span>
            <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
              You&apos;ve accepted care of {petName}
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
            You&apos;ve declined this assignment.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="border rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: 'rgba(142,44,44,0.15)', borderColor: 'rgba(142,44,44,0.3)' }}>
          <p className="text-sm font-sans" style={{ color: '#E8341A' }}>{error}</p>
        </div>
      )}

      <button
        onClick={() => respond('accepted')}
        disabled={isSaving}
        className="w-full rounded-full py-3 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: '#CF9D7B',
          color: '#0C1519',
        }}
        onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = '#B8885F'; }}
        onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = '#CF9D7B'; }}
      >
        {isSaving && activeAction === 'accepted' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {isSaving && activeAction === 'accepted' ? 'Saving...' : 'Accept'}
      </button>

      <p className="text-center mt-4">
        <button
          onClick={() => respond('declined')}
          disabled={isSaving}
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
