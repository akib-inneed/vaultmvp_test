'use client';

import { useState, useTransition } from 'react';
import { addBeneficiary, removeBeneficiary, resendNotification } from './actions';
import type { Beneficiary, Acknowledgment } from '@/lib/types';

interface BeneficiarySlotProps {
  itemId: string;
  priority: 'primary' | 'secondary';
  beneficiary: Beneficiary | null;
  acknowledgment: Acknowledgment | null;
}

const STATUS_STYLES = {
  pending:  'bg-amber/10 text-amber border-amber/20',
  accepted: 'bg-teal/10 text-teal border-teal/20',
  declined: 'bg-vault-red/10 text-vault-red border-vault-red/20',
};

const STATUS_LABELS = {
  pending:  'Awaiting response',
  accepted: 'Accepted',
  declined: 'Declined',
};

export function BeneficiarySlot({ itemId, priority, beneficiary, acknowledgment }: BeneficiarySlotProps) {
  const [showForm, setShowForm] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'warning' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resentAt, setResentAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const label = priority === 'primary' ? 'Primary beneficiary' : 'Secondary beneficiary';
  const hint = priority === 'primary'
    ? 'First person to receive this item'
    : 'Backup if the primary beneficiary can\'t accept';

  function handleAdd(formData: FormData) {
    if (saving) return;
    setSaving(true);
    startTransition(async () => {
      setMessage(null);
      try {
        const result = await addBeneficiary(formData);
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
          setSaving(false);
        } else if (result.warning) {
          setMessage({ type: 'warning', text: result.warning });
          setSaveSuccess(true);
          setTimeout(() => { setSaving(false); setSaveSuccess(false); setShowForm(false); }, 500);
        } else {
          setSaveSuccess(true);
          setTimeout(() => { setSaving(false); setSaveSuccess(false); setShowForm(false); }, 500);
        }
      } catch {
        setMessage({ type: 'error', text: 'Something went wrong. Try again.' });
        setSaving(false);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      setMessage(null);
      const result = await removeBeneficiary(beneficiary!.id, itemId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      }
      setConfirmRemove(false);
    });
  }

  function handleResend() {
    startTransition(async () => {
      setMessage(null);
      const result = await resendNotification(beneficiary!.id, itemId);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.warning) {
        setMessage({ type: 'warning', text: result.warning });
      } else {
        setResentAt(new Date());
      }
    });
  }

  return (
    <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden">
      {/* Slot header */}
      <div className="px-5 pt-5 pb-4 border-b border-ink/5">
        <p className="text-xs font-mono text-ink/40 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs text-ink/35 font-sans">{hint}</p>
      </div>

      <div className="p-5">
        {/* No beneficiary — show form toggle */}
        {!beneficiary && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-ink/12 hover:border-teal/40 hover:bg-teal/5 transition text-sm text-ink/40 hover:text-teal font-sans group min-h-[44px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            Add {priority} beneficiary
          </button>
        )}

        {/* Add form */}
        {!beneficiary && showForm && (
          <form action={handleAdd} className="space-y-3">
            <input type="hidden" name="item_id" value={itemId} />
            <input type="hidden" name="priority" value={priority} />

            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Full name</label>
              <input
                name="full_name"
                type="text"
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="jane@example.com"
              />
            </div>

            {message && (
              <p className={`text-xs font-sans px-3 py-2 rounded-lg ${
                message.type === 'error' ? 'bg-vault-red/10 text-vault-red' :
                message.type === 'warning' ? 'bg-amber/10 text-amber' :
                'bg-teal/10 text-teal'
              }`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setMessage(null); }}
                className="flex-1 py-2 px-3 text-sm text-ink/50 border border-ink/15 rounded-xl hover:bg-ink/5 font-sans transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || isPending}
                className={`flex-1 py-2 px-3 text-sm rounded-xl font-sans font-medium transition min-h-[44px] flex items-center justify-center gap-1.5 ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : saving
                      ? 'bg-teal/60 text-cream cursor-not-allowed'
                      : 'bg-teal text-cream hover:bg-teal/90'
                } disabled:cursor-not-allowed`}
              >
                {saving && !saveSuccess && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {saveSuccess && (
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M3.5 9L7.5 13L14.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {saving && !saveSuccess ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Assigned beneficiary */}
        {beneficiary && (
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-sans font-medium text-ink text-sm truncate">{beneficiary.full_name}</p>
                <p className="text-xs text-ink/45 font-sans truncate">{beneficiary.email}</p>
              </div>
              {acknowledgment && (
                <span className={`shrink-0 text-xs font-mono px-2 py-1 rounded-lg border ${STATUS_STYLES[acknowledgment.status]}`}>
                  {STATUS_LABELS[acknowledgment.status]}
                </span>
              )}
            </div>

            {acknowledgment?.acknowledged_at && (
              <p className="text-xs text-ink/35 font-mono mb-3">
                {acknowledgment.status === 'accepted' ? 'Accepted' : 'Responded'}{' '}
                {new Date(acknowledgment.acknowledged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}

            {/* Warning: email bounce hint */}
            {message?.type === 'warning' && (
              <p className="text-xs bg-amber/10 text-amber px-3 py-2 rounded-lg font-sans mb-3">
                {message.text}
              </p>
            )}

            {/* Actions */}
            {!confirmRemove ? (
              <div className="flex gap-2">
                {acknowledgment?.status === 'pending' && (
                  <button
                    onClick={handleResend}
                    disabled={isPending || (resentAt !== null && Date.now() - resentAt.getTime() < 60_000)}
                    className="flex-1 py-2 px-3 text-xs text-ink/50 border border-ink/15 rounded-xl hover:bg-ink/5 font-sans transition disabled:opacity-40 min-h-[44px]"
                  >
                    {isPending ? 'Sending…' : resentAt ? 'Sent!' : 'Resend email'}
                  </button>
                )}
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="flex-1 py-2 px-3 text-xs text-ink/40 border border-ink/15 rounded-xl hover:border-vault-red/30 hover:text-vault-red hover:bg-vault-red/5 font-sans transition min-h-[44px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="bg-vault-red/5 border border-vault-red/15 rounded-xl p-3">
                <p className="text-xs text-vault-red font-sans mb-2.5">
                  Remove {beneficiary.full_name}? They will no longer be assigned to this item.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="flex-1 py-1.5 px-3 text-xs text-ink/50 border border-ink/15 rounded-lg hover:bg-ink/5 font-sans transition min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={isPending}
                    className="flex-1 py-1.5 px-3 text-xs bg-vault-red text-white rounded-lg hover:bg-vault-red/90 font-sans transition disabled:opacity-60 min-h-[44px]"
                  >
                    {isPending ? 'Removing…' : 'Yes, remove'}
                  </button>
                </div>
              </div>
            )}

            {message?.type === 'error' && (
              <p className="text-xs bg-vault-red/10 text-vault-red px-3 py-2 rounded-lg font-sans mt-2">
                {message.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
