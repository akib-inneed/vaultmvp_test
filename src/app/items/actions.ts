'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ITEM_IMAGE_BUCKET } from '@/lib/items/photos';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export async function createItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() ?? '';
  const estimatedValueRaw = formData.get('estimated_value') as string;
  const photo = formData.get('photo') as File | null;
  const requestedItemType = (formData.get('item_type') as string) || 'item';
  const item_type = requestedItemType === 'pet' ? 'pet' : 'item';
  const pet_details_raw = formData.get('pet_details') as string | null;

  if (!name) {
    return { error: 'Item name is required.' };
  }

  const estimated_value =
    estimatedValueRaw && estimatedValueRaw !== ''
      ? parseFloat(estimatedValueRaw)
      : null;

  if (estimated_value !== null && (isNaN(estimated_value) || estimated_value < 0)) {
    return { error: 'Estimated value must be a positive number.' };
  }

  let photo_url: string | null = null;

  // Upload photo if provided
  if (photo && photo.size > 0) {
    if (photo.size > 10 * 1024 * 1024) {
      return { error: 'Photo must be under 10 MB.' };
    }

    if (!ALLOWED_IMAGE_TYPES.has(photo.type)) {
      return { error: 'Photo must be a JPEG, PNG, WebP, HEIC, or HEIF image.' };
    }

    const ext = IMAGE_EXTENSIONS[photo.type] ?? 'jpg';
    const filename = `${user.id}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(ITEM_IMAGE_BUCKET)
      .upload(filename, photo, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Photo upload failed: ${uploadError.message}` };
    }

    photo_url = filename;
  }

  // Parse pet details if present
  let pet_details = null;
  if (item_type === 'pet' && pet_details_raw) {
    try {
      pet_details = JSON.parse(pet_details_raw);
    } catch {
      // Ignore parse errors, pet_details stays null
    }
  }

  // Create the item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .insert({
      owner_id: user.id,
      name,
      description,
      estimated_value,
      photo_url,
      item_type,
      pet_details,
    })
    .select()
    .single();

  if (itemError) {
    if (photo_url) {
      await supabase.storage.from(ITEM_IMAGE_BUCKET).remove([photo_url]);
    }
    return { error: itemError.message };
  }

  revalidatePath('/dashboard');
  return { success: true, itemId: item.id };
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check for pending acknowledgments first
  const { data: pendingAcks } = await supabase
    .from('acknowledgments')
    .select('id')
    .eq('item_id', itemId)
    .eq('status', 'pending');

  if (pendingAcks && pendingAcks.length > 0) {
    return { hasPendingAcknowledgments: true };
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('owner_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteItemConfirmed(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('owner_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
