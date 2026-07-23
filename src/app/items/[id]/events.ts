'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type ItemEventType =
  | 'assigned'
  | 'notified'
  | 'accepted'
  | 'declined'
  | 'story_edited'
  | 'message'
  | 'removed';

export interface ItemEvent {
  id: string;
  item_id: string;
  actor_id: string | null;
  actor_name: string;
  actor_role: 'owner' | 'recipient' | 'system';
  type: ItemEventType;
  body: string;
  created_at: string;
}

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function insertSystemEvent(
  itemId: string,
  type: ItemEventType,
  body: string,
  actorName = 'Heirlo'
): Promise<void> {
  try {
    const { error } = await svc()
      .from('item_events')
      .insert({
        item_id: itemId,
        actor_id: null,
        actor_name: actorName,
        actor_role: 'system',
        type,
        body,
      });
    if (error) {
      console.error('[events] insertSystemEvent failed:', error.message);
    }
  } catch (err) {
    console.error('[events] insertSystemEvent threw:', err);
  }
}

export async function insertMessage(
  itemId: string,
  body: string
): Promise<ItemEvent | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Determine actor role
  const { data: item } = await svc()
    .from('items')
    .select('owner_id')
    .eq('id', itemId)
    .single();

  if (!item) return null;

  const isOwner = item.owner_id === user.id;

  // Get actor name
  const { data: profile } = await svc()
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const actorName = profile?.full_name ?? user.email ?? 'Unknown';

  const { data: event, error } = await svc()
    .from('item_events')
    .insert({
      item_id: itemId,
      actor_id: user.id,
      actor_name: actorName,
      actor_role: isOwner ? 'owner' : 'recipient',
      type: 'message',
      body: body.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('[events] insertMessage failed:', error.message);
    return null;
  }

  return event as ItemEvent;
}

export async function getItemEvents(itemId: string): Promise<ItemEvent[]> {
  const admin = svc();

  // Get the timestamp of the first accepted acknowledgment
  const { data: firstAccepted } = await admin
    .from('acknowledgments')
    .select('acknowledged_at')
    .eq('item_id', itemId)
    .eq('status', 'accepted')
    .order('acknowledged_at', { ascending: true })
    .limit(1)
    .single();

  let query = admin
    .from('item_events')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (firstAccepted?.acknowledged_at) {
    query = query.gte('created_at', firstAccepted.acknowledged_at);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[events] getItemEvents failed:', error.message);
    return [];
  }

  return (data ?? []) as ItemEvent[];
}
