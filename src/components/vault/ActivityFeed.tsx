'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { insertMessage } from '@/app/items/[id]/events';
import type { ItemEvent, ItemEventType } from '@/app/items/[id]/events';

interface ActivityFeedProps {
  itemId: string;
  initialEvents: ItemEvent[];
  currentUserId: string;
  currentUserName: string;
  isOwner: boolean;
  canMessage: boolean;
}

const DOT_COLORS: Record<ItemEventType, string> = {
  assigned: '#CF9D7B',
  story_edited: '#CF9D7B',
  notified: '#93c5fd',
  accepted: '#34d399',
  declined: '#f87171',
  message: '#CF9D7B',
  removed: '#f87171',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ActivityFeed({
  itemId,
  initialEvents,
  currentUserId,
  currentUserName,
  isOwner,
  canMessage,
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ItemEvent[]>(initialEvents);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`item-events-${itemId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'item_events',
        filter: `item_id=eq.${itemId}`,
      }, (payload) => {
        setEvents((prev) => {
          if (prev.find((e) => e.id === (payload.new as ItemEvent).id)) return prev;
          return [...prev, payload.new as ItemEvent];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [itemId]);

  // Scroll to bottom on new events
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  function handleSend() {
    const body = message.trim();
    if (!body) return;

    // Optimistic insert
    const optimistic: ItemEvent = {
      id: `opt-${Date.now()}`,
      item_id: itemId,
      actor_id: currentUserId,
      actor_name: currentUserName,
      actor_role: isOwner ? 'owner' : 'recipient',
      type: 'message',
      body,
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, optimistic]);
    setMessage('');

    startTransition(async () => {
      const result = await insertMessage(itemId, body);
      if (result) {
        // Replace optimistic with real
        setEvents((prev) =>
          prev.map((e) => e.id === optimistic.id ? result : e)
        );
      }
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(245,239,232,0.35)' }}>
        Activity
      </p>

      <div className="space-y-3 mb-4">
        {events.map((event) => {
          if (event.type === 'message') {
            const isMe = event.actor_id === currentUserId;
            const isOwnerMsg = isMe && isOwner;
            return (
              <div key={event.id} className={`flex ${isOwnerMsg ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-3 py-2 max-w-[220px] border ${
                    isOwnerMsg
                      ? 'bg-[#CF9D7B]/15 border-[#CF9D7B]/20 rounded-[14px_14px_4px_14px]'
                      : 'bg-[#0C1519] border-[#F5EFE8]/[0.08] rounded-[14px_14px_14px_4px]'
                  }`}
                >
                  <p className="text-[12px] leading-relaxed" style={{ color: '#F5EFE8' }}>
                    {event.body}
                  </p>
                  <p className="text-[9px] font-mono mt-1" style={{ color: 'rgba(245,239,232,0.2)' }}>
                    {event.actor_name.split(' ')[0]} · {formatTime(event.created_at)}
                  </p>
                </div>
              </div>
            );
          }

          // System event
          return (
            <div key={event.id} className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: DOT_COLORS[event.type] ?? '#CF9D7B' }}
              />
              <div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(245,239,232,0.45)' }}>
                  {event.body}
                </p>
                <p className="text-[9px] font-mono mt-1" style={{ color: 'rgba(245,239,232,0.2)' }}>
                  {formatTime(event.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      {canMessage && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Write a message..."
            className="flex-1 bg-[#0C1519] border border-[#CF9D7B]/20 rounded-full px-4 py-2 text-sm text-[#F5EFE8] placeholder:text-[#F5EFE8]/25 focus:outline-none focus:border-[#CF9D7B]/50"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: '#CF9D7B' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h10M8 4l3 3-3 3" stroke="#0C1519" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
