'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteItemWithCheck } from './actions';

interface DeleteItemButtonProps {
  itemId: string;
  itemName: string;
}

export function DeleteItemButton({ itemId, itemName }: DeleteItemButtonProps) {
  const [state, setState] = useState<'idle' | 'confirm' | 'pendingWarn'>('idle');
  const [isPending, startTransition] = useTransition();
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  function handleDeleteClick(force = false) {
    startTransition(async () => {
      const result = await deleteItemWithCheck(itemId, force);

      if (result.hasPending) {
        setPendingCount(result.pendingCount ?? 0);
        setState('pendingWarn');
      } else if (result.deleted) {
        router.push('/dashboard');
      } else if (result.error) {
        setState('idle');
      }
    });
  }

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('confirm')}
        className="w-full py-3 text-sm font-medium bg-red-900/40 hover:bg-red-900/70 text-red-400 hover:text-red-300 border border-red-800/40 rounded-xl font-sans transition-colors"
      >
        Delete this item
      </button>
    );
  }

  if (state === 'confirm') {
    return (
      <div className="bg-vault-red/5 border border-vault-red/15 rounded-2xl p-5">
        <p className="font-sans text-sm font-medium text-vault-red mb-1">Delete &ldquo;{itemName}&rdquo;?</p>
        <p className="font-sans text-xs text-ink/50 mb-4">This will permanently remove the item and all assignments.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setState('idle')}
            className="flex-1 py-2 px-3 text-sm text-ink/50 border border-ink/15 rounded-xl hover:bg-ink/5 font-sans transition min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteClick()}
            disabled={isPending}
            className="flex-1 py-2 px-3 text-sm bg-vault-red text-white rounded-xl hover:bg-vault-red/90 font-sans transition disabled:opacity-60 min-h-[44px]"
          >
            {isPending ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </div>
    );
  }

  // pendingWarn state
  return (
    <div className="bg-vault-red/5 border border-vault-red/15 rounded-2xl p-5">
      <p className="font-sans text-sm font-medium text-vault-red mb-1">This item has pending acknowledgments</p>
      <p className="font-sans text-xs text-ink/55 mb-4">
        {pendingCount} recipient{pendingCount !== 1 ? 's are' : ' is'} waiting to acknowledge this item.
        They will be notified by email that it has been removed.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setState('idle')}
          className="flex-1 py-2 px-3 text-sm text-ink/50 border border-ink/15 rounded-xl hover:bg-ink/5 font-sans transition min-h-[44px]"
        >
          Keep item
        </button>
        <button
          onClick={() => handleDeleteClick(true)}
          disabled={isPending}
          className="flex-1 py-2 px-3 text-sm bg-vault-red text-white rounded-xl hover:bg-vault-red/90 font-sans transition disabled:opacity-60 min-h-[44px]"
        >
          {isPending ? 'Deleting…' : `Delete and notify recipient${pendingCount !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
