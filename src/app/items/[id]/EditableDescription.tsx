'use client';

import { useState, useTransition } from 'react';
import { updateItemDescription } from './actions';

interface EditableDescriptionProps {
  itemId: string;
  description: string;
  isOwner: boolean;
}

export function EditableDescription({ itemId, description, isOwner }: EditableDescriptionProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [saved, setSaved] = useState(description);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setText(saved);
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateItemDescription(itemId, text);
      if (result.success) {
        setSaved(text.trim());
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(245,239,232,0.35)' }}>
            The Story
          </p>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs transition"
              style={{ color: 'rgba(207,157,123,0.6)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#CF9D7B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(207,157,123,0.6)'; }}
            >
              Edit
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed mb-3" style={{ color: saved ? 'rgba(245,239,232,0.7)' : 'rgba(245,239,232,0.3)' }}>
          {saved || 'Add a story...'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(245,239,232,0.35)' }}>
          The Story
        </p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Add a story..."
        className="w-full bg-[#0C1519] border border-[#CF9D7B]/20 rounded-xl px-3 py-2 text-sm text-[#F5EFE8] placeholder:text-[#F5EFE8]/30 resize-none focus:outline-none focus:border-[#CF9D7B]/50"
      />
      <div className="flex items-center mt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-xs bg-[#CF9D7B] text-[#0C1519] px-4 py-1.5 rounded-full font-medium disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs ml-3 transition"
          style={{ color: 'rgba(245,239,232,0.4)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(245,239,232,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,239,232,0.4)'; }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
