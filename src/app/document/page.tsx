import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { BottomNav } from '@/components/vault/BottomNav';
import { DocumentActions } from './DocumentActions';
import { getItemImageUrl } from '@/lib/items/photos';
import type { PDFItemData, PDFPetData, VaultDocumentData } from '@/lib/pdf/VaultDocument';
import type { Beneficiary, Acknowledgment } from '@/lib/types';

export default async function DocumentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  const itemIds = (items ?? []).map((i: { id: string }) => i.id);

  const { data: beneficiaries } = itemIds.length > 0
    ? await supabase.from('beneficiaries').select('*').in('item_id', itemIds)
    : { data: [] };

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: acknowledgments } = itemIds.length > 0
    ? await svc.from('acknowledgments').select('*').in('item_id', itemIds)
    : { data: [] };

  const bens = (beneficiaries ?? []) as Beneficiary[];
  const acks = (acknowledgments ?? []) as Acknowledgment[];

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

  const ownerName = profile?.full_name ?? user.email ?? 'Unknown';
  const hasItems = (items?.length ?? 0) > 0;
  const hasPets = pdfPets.length > 0;
  const hasContent = hasItems || hasPets;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Build PDF data
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

  const documentData: VaultDocumentData = {
    ownerName,
    generatedAt: new Date().toISOString(),
    items: pdfItems,
    pets: pdfPets,
  };

  return (
    <div className="min-h-screen flex flex-col pb-16" style={{ backgroundColor: '#0C1519' }}>

      {/* Top header */}
      {hasContent ? (
        <div className="shrink-0 sticky top-0 z-10" style={{ backgroundColor: '#0C1519' }}>
          <DocumentActions data={documentData} />
        </div>
      ) : (
        <nav className="border-b shrink-0 sticky top-0 z-10" style={{ borderColor: 'rgba(245,239,232,0.08)', backgroundColor: '#0C1519' }}>
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
            <Link href="/settings" className="transition p-1 -ml-1" style={{ color: 'rgba(245,239,232,0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <h1 className="flex-1 text-center font-serif text-lg font-semibold" style={{ color: '#F5EFE8' }}>
              Your Document
            </h1>
            <div className="w-7" />
          </div>
        </nav>
      )}

      {!hasContent ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16">
          <p className="font-serif text-xl mb-2" style={{ color: '#F5EFE8' }}>Nothing to document yet</p>
          <p className="text-sm mb-6" style={{ color: 'rgba(245,239,232,0.45)' }}>
            Add items or pets and assign recipients before generating a memorandum.
          </p>
          <Link
            href="/items/new"
            className="inline-block text-sm font-semibold py-3 px-6 rounded-full transition"
            style={{ backgroundColor: '#CF9D7B', color: '#0C1519' }}
          >
            Add your first item
          </Link>
        </div>
      ) : (
        <>
          {/* Scrollable preview */}
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="mx-4 my-6 bg-white rounded-xl p-6">

              {/* Header */}
              <h2 className="font-serif text-xl font-semibold text-gray-900 mb-1">
                Personal Property Memorandum
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Prepared by {ownerName} &middot; {today}
              </p>
              <div className="h-0.5 mb-6" style={{ backgroundColor: '#CF9D7B' }} />

              {/* Statement of intent */}
              <div className="bg-gray-50 border-l-2 rounded-r-lg px-4 py-3 mb-6" style={{ borderColor: '#CF9D7B' }}>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  &ldquo;I, {ownerName}, intend for the personal property listed in this memorandum
                  to be distributed to the named recipients upon my death. This document is
                  created with testamentary intent and is intended to supplement, not replace,
                  any will or trust I may have in effect.&rdquo;
                </p>
              </div>

              {/* Assigned Items heading */}
              <h3 className="font-serif text-base font-semibold text-gray-900 mb-4">
                Assigned Items ({pdfItems.length})
              </h3>

              {/* Item cards */}
              {pdfItems.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl overflow-hidden mb-4">
                  {/* Top: photo + details */}
                  <div className="flex items-start gap-4 p-4">
                    {item.photo_url ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden relative shrink-0">
                        <Image
                          src={item.photo_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-2xl opacity-30">📦</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      {item.estimated_value != null && (
                        <p className="text-xs text-gray-400 mt-1">
                          Est. value: ${item.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom: recipients */}
                  <div className="border-t border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
                    {[
                      { label: 'Primary recipient', recipient: item.primary },
                      { label: 'Secondary recipient', recipient: item.secondary },
                    ].map(({ label, recipient }) => (
                      <div key={label} className="p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
                        {recipient ? (
                          <>
                            <p className="text-xs font-semibold text-gray-900">{recipient.full_name}</p>
                            <p className="text-[11px] text-gray-400 mb-1.5">{recipient.email}</p>
                            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              recipient.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-700'
                                : recipient.status === 'declined'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-100 text-amber-700'
                            }`}>
                              {recipient.status === 'accepted' ? 'Accepted' : recipient.status === 'declined' ? 'Declined' : 'Pending'}
                            </span>
                          </>
                        ) : (
                          <span className="inline-block text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-md">
                            Not assigned
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Assigned Pets */}
              {hasPets && (
                <>
                  <h3 className="font-serif text-base font-semibold text-gray-900 mb-4">
                    Assigned Pets ({pdfPets.length})
                  </h3>

                  {pdfPets.map((pet, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl overflow-hidden mb-4">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-2xl opacity-30">🐾</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{pet.name}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Assigned caregiver</p>
                        <p className="text-xs font-semibold text-gray-900">{pet.caregiver_name}</p>
                        {pet.caregiver_email && (
                          <p className="text-[11px] text-gray-400">{pet.caregiver_email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Signature line */}
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex gap-6">
                  <div className="flex-[2]">
                    <div className="border-b border-gray-900 h-8 mb-1" />
                    <p className="text-[10px] text-gray-400">Signature of {ownerName}</p>
                  </div>
                  <div className="flex-1">
                    <div className="border-b border-gray-900 h-8 mb-1" />
                    <p className="text-[10px] text-gray-400">Date</p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-gray-400 leading-relaxed">
                This document is a personal record of intent. It is not a substitute for
                legal advice. Heirlo is a documentation platform, not a law firm. Consult a
                licensed estate attorney in your state for legally binding estate planning.
              </p>
            </div>
          </div>

</>
      )}

      <BottomNav />
    </div>
  );
}
