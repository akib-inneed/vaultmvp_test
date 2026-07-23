import { NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { VaultDocument } from '@/lib/pdf/VaultDocument';
import { getItemImageUrl } from '@/lib/items/photos';
import type { PDFItemData, PDFPetData, VaultDocumentData } from '@/lib/pdf/VaultDocument';
import type { Beneficiary, Acknowledgment } from '@/lib/types';

export async function GET(request: Request) {
  // Resolve user: JWT Bearer token (mobile) or cookie session (web)
  let user: { id: string; email?: string } | null = null;

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) {
      user = data.user;
    }
  }

  if (!user) {
    const supabase = await createClient();
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    user = cookieUser;
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role for all data queries (user already authenticated above)
  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch profile
  const { data: profile } = await svc
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch all items
  const { data: items } = await svc
    .from('items')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  const itemIds = (items ?? []).map((i: { id: string }) => i.id);

  // Fetch all beneficiaries for these items
  const { data: beneficiaries } = itemIds.length > 0
    ? await svc.from('beneficiaries').select('*').in('item_id', itemIds)
    : { data: [] };

  // Fetch all acknowledgments
  const { data: acknowledgments } = itemIds.length > 0
    ? await svc.from('acknowledgments').select('*').in('item_id', itemIds)
    : { data: [] };

  const bens = (beneficiaries ?? []) as Beneficiary[];
  const acks = (acknowledgments ?? []) as Acknowledgment[];

  // Build per-item data
  const pdfItems: PDFItemData[] = await Promise.all((items ?? []).map(async (item) => {
    const itemBens = bens.filter((b) => b.item_id === item.id);
    const primary = itemBens.find((b) => b.priority === 'primary') ?? null;
    const secondary = itemBens.find((b) => b.priority === 'secondary') ?? null;

    function toRecipient(ben: Beneficiary | null) {
      if (!ben) return null;
      const ack = acks.find((a) => a.beneficiary_id === ben.id);
      return {
        full_name: ben.full_name,
        email: ben.email,
        status: (ack?.status ?? 'pending') as 'pending' | 'accepted' | 'declined',
      };
    }

    return {
      name: item.name,
      description: item.description ?? '',
      estimated_value: item.estimated_value,
      photo_url: await getItemImageUrl(svc, item.photo_url),
      primary: toRecipient(primary),
      secondary: toRecipient(secondary),
    };
  }));

  // Fetch pets with assigned caregivers
  const { data: petsWithCaregivers } = await svc
    .from('pets')
    .select('id, name, pet_caregivers(full_name, email)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  const pdfPets: PDFPetData[] = (petsWithCaregivers ?? [])
    .filter((p: { pet_caregivers: unknown }) => {
      const cgs = p.pet_caregivers as { full_name: string; email: string }[];
      return cgs && cgs.length > 0;
    })
    .map((p: { name: string; pet_caregivers: unknown }) => {
      const cg = (p.pet_caregivers as { full_name: string; email: string }[])[0];
      return {
        name: p.name,
        caregiver_name: cg.full_name,
        caregiver_email: cg.email ?? null,
      };
    });

  if (pdfItems.length === 0 && pdfPets.length === 0) {
    return NextResponse.json({ error: 'No items or pets to generate a document for.' }, { status: 400 });
  }

  const documentData: VaultDocumentData = {
    ownerName: profile?.full_name ?? user.email ?? 'Unknown',
    generatedAt: new Date().toISOString(),
    items: pdfItems,
    pets: pdfPets,
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      // @ts-expect-error react-pdf's renderToBuffer expects its own ReactElement type
      React.createElement(VaultDocument, { data: documentData })
    );
  } catch (err) {
    console.error('[PDF] renderToBuffer failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF render failed' },
      { status: 500 }
    );
  }

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-store',
    },
  });
}
