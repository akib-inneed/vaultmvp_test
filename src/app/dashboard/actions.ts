'use server';

import { createClient } from '@/lib/supabase/server';

export async function acceptTerms() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log(user)
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq('id', user.id)
    .select();

  console.log(error)

  if (error) return { error: error.message };
  return { ok: true };
}
