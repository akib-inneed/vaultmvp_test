'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { sendDeclineNotificationEmail } from '@/lib/email';
import { insertSystemEvent } from '@/app/items/[id]/events';

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function respondToAcknowledgment(
  token: string,
  response: 'accepted' | 'declined'
) {
  const supabase = svc();

  const { data: ack, error } = await supabase
    .from('acknowledgments')
    .select('id, status')
    .eq('token', token)
    .single();

  if (error || !ack) {
    return { error: 'This link is invalid or has expired.' };
  }

  if (ack.status !== 'pending') {
    return { alreadyResponded: true, status: ack.status as 'accepted' | 'declined' };
  }

  const { error: updateError } = await supabase
    .from('acknowledgments')
    .update({ status: response, acknowledged_at: new Date().toISOString() })
    .eq('token', token);

  if (updateError) {
    return { error: updateError.message };
  }

  // Fetch ack details for event logging and decline notification
  const { data: fullAck } = await supabase
    .from('acknowledgments')
    .select('beneficiary_id, item_id')
    .eq('token', token)
    .single();

  if (fullAck) {
    const { data: ben } = await supabase
      .from('beneficiaries')
      .select('full_name')
      .eq('id', fullAck.beneficiary_id)
      .single();
    const recipientFirst = (ben?.full_name ?? 'Recipient').split(' ')[0];
    const eventType = response === 'accepted' ? 'accepted' as const : 'declined' as const;
    void insertSystemEvent(
      fullAck.item_id,
      eventType,
      `${recipientFirst} ${response}`
    );
  }

  if (response === 'declined') {
    if (fullAck) {
      const [{ data: beneficiary }, { data: item }] = await Promise.all([
        supabase.from('beneficiaries').select('full_name').eq('id', fullAck.beneficiary_id).single(),
        supabase.from('items').select('name, owner_id').eq('id', fullAck.item_id).single(),
      ]);

      if (beneficiary && item) {
        const { data: owner } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', item.owner_id)
          .single();

        if (owner?.email) {
          await sendDeclineNotificationEmail({
            ownerEmail: owner.email,
            ownerName: owner.full_name ?? 'there',
            beneficiaryName: beneficiary.full_name,
            itemName: item.name,
          });
        }
      }
    }
  }

  return { success: true, status: response };
}
