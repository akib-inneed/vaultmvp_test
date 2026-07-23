'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createVault(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const name = (formData.get('name') as string)?.trim();
  const type = formData.get('type') as 'family' | 'shared';
  const membersRaw = formData.get('members') as string;

  if (!name || !type) return { error: 'Name and type are required.' };

  const { data: vault, error } = await supabase
    .from('vaults')
    .insert({ owner_id: user.id, name, type })
    .select()
    .single();

  if (error || !vault) return { error: error?.message ?? 'Failed to create vault.' };

  // Insert member emails if any
  const emails: string[] = membersRaw
    ? membersRaw.split(',').map((e) => e.trim()).filter(Boolean)
    : [];

  if (emails.length > 0) {
    await supabase.from('vault_members').insert(
      emails.map((email) => ({ vault_id: vault.id, email }))
    );
  }

  revalidatePath('/vaults');
  redirect(`/vaults/${vault.id}`);
}
