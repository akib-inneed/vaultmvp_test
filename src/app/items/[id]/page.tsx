import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { BeneficiarySlot } from './BeneficiarySlot';
import { DeleteItemButton } from './DeleteItemButton';
import { BackButton } from './BackButton';
import { EditableDescription } from './EditableDescription';
import { getItemEvents } from './events';
import { AcknowledgeActions } from '@/app/acknowledge/[token]/AcknowledgeActions';
import { BottomNav } from '@/components/vault/BottomNav';
import { ActivityFeed } from '@/components/vault/ActivityFeed';
import { getItemImageUrl } from '@/lib/items/photos';
import type { Beneficiary, Acknowledgment } from '@/lib/types';

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Try to fetch as owner first
  const { data: ownerItem } = await supabase
    .from('items')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let item = ownerItem;
  let isOwner = !!ownerItem;

  // If not the owner, check if user is a beneficiary on this item
  if (!item) {
    const userEmail = user.email ?? '';
    const { data: benCheck } = userEmail
      ? await svc
          .from('beneficiaries')
          .select('id')
          .eq('item_id', params.id)
          .ilike('email', userEmail)
          .limit(1)
      : { data: [] };

    if (benCheck && benCheck.length > 0) {
      const { data: benItem } = await svc
        .from('items')
        .select('*')
        .eq('id', params.id)
        .single();
      item = benItem;
      isOwner = false;
    }
  }

  if (!item) notFound();

  item = {
    ...item,
    photo_url: await getItemImageUrl(svc, item.photo_url),
  };

  const { data: beneficiaries } = isOwner
    ? await supabase
        .from('beneficiaries')
        .select('*')
        .eq('item_id', item.id)
        .order('priority', { ascending: true })
    : { data: [] };

  const { data: acknowledgments } = await svc
    .from('acknowledgments')
    .select('*')
    .eq('item_id', item.id);

  const bens = (beneficiaries ?? []) as Beneficiary[];
  const acks = (acknowledgments ?? []) as Acknowledgment[];

  // For recipient view: find their specific acknowledgment
  let recipientAck: Acknowledgment | null = null;
  if (!isOwner) {
    const userEmail = user.email ?? '';
    const { data: myBen } = await svc
      .from('beneficiaries')
      .select('id')
      .eq('item_id', item.id)
      .ilike('email', userEmail)
      .limit(1);
    if (myBen && myBen.length > 0) {
      recipientAck = acks.find((a) => a.beneficiary_id === myBen[0].id) ?? null;
    }
  }

  const primary = bens.find((b) => b.priority === 'primary') ?? null;
  const secondary = bens.find((b) => b.priority === 'secondary') ?? null;

  function ackFor(ben: Beneficiary | null): Acknowledgment | null {
    if (!ben) return null;
    return acks.find((a) => a.beneficiary_id === ben.id) ?? null;
  }

  const primaryAck = ackFor(primary);
  const secondaryAck = ackFor(secondary);

  // Fetch profile and events for activity feed
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const currentUserName = userProfile?.full_name ?? user.email ?? 'Unknown';
  const initialEvents = await getItemEvents(item.id);

  // canMessage: owner or authenticated beneficiary
  const canMessage = isOwner || !!recipientAck;
  const hasAcceptedAcknowledgment = acks.some((a) => a.status === 'accepted');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0C1519' }}>
     <div className="max-w-lg mx-auto">

      {/* ── HERO SECTION ── */}
      <div className="relative" style={{ height: 260 }}>
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#162127' }}>
            <span className="text-5xl opacity-20">📦</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1519] via-[#0C1519]/40 to-transparent" />

        {/* Back arrow */}
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>

        {/* Item name overlay */}
        <div className="absolute bottom-5 left-4 right-4 z-10">
          <h1 className="font-serif text-xl font-semibold" style={{ color: '#F5EFE8' }}>
            {item.name}
          </h1>
          {primary && (
            <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: '#CF9D7B' }}>
              Assigned to {primary.full_name}
            </p>
          )}
        </div>
      </div>

      {/* ── SHEET SECTION ── */}
      <div
        className="relative rounded-t-2xl -mt-3 overflow-y-auto"
        style={{ backgroundColor: '#162127', minHeight: 'calc(100vh - 248px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 mb-3">
          <div className="w-8 h-[3px] rounded-full" style={{ backgroundColor: 'rgba(245,239,232,0.15)' }} />
        </div>

        <div className="px-4 pb-24 space-y-5">

          {/* Description */}
          {(item.description || isOwner) && (
            <EditableDescription
              itemId={item.id}
              description={item.description ?? ''}
              isOwner={isOwner}
            />
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-2" style={{ backgroundColor: '#0C1519' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(245,239,232,0.35)' }}>
                Estimated Value
              </p>
              <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
                {item.estimated_value != null
                  ? `$${item.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                  : '—'}
              </p>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: '#0C1519' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(245,239,232,0.35)' }}>
                Date Added
              </p>
              <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Recipient view — actions or dashboard link */}
          {!isOwner && recipientAck?.status === 'pending' && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#0C1519' }}>
              <AcknowledgeActions token={recipientAck.token} />
            </div>
          )}
          {!isOwner && recipientAck?.status !== 'pending' && (
            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 font-sans font-medium py-3 px-6 rounded-xl transition text-sm w-full"
                style={{ backgroundColor: '#CF9D7B', color: '#0C1519' }}
              >
                View all items assigned to me
              </Link>
              <p className="text-xs font-sans mt-2.5" style={{ color: 'rgba(245,239,232,0.4)' }}>
                This item will appear in your Assigned to Me section on your dashboard.
              </p>
            </div>
          )}

          {/* Beneficiaries — owner only */}
          {isOwner && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(245,239,232,0.35)' }}>
                Beneficiaries
              </p>

              <div className="space-y-3">
                {/* Primary */}
                {primary ? (
                  <RecipientCard
                    label="Primary beneficiary"
                    name={primary.full_name}
                    email={primary.email}
                    status={primaryAck?.status ?? null}
                    itemId={item.id}
                    priority="primary"
                    beneficiary={primary}
                    acknowledgment={primaryAck}
                  />
                ) : (
                  <BeneficiarySlot
                    itemId={item.id}
                    priority="primary"
                    beneficiary={null}
                    acknowledgment={null}
                  />
                )}

                {/* Secondary */}
                {secondary ? (
                  <RecipientCard
                    label="Secondary beneficiary"
                    name={secondary.full_name}
                    email={secondary.email}
                    status={secondaryAck?.status ?? null}
                    itemId={item.id}
                    priority="secondary"
                    beneficiary={secondary}
                    acknowledgment={secondaryAck}
                  />
                ) : primary ? (
                  <BeneficiarySlot
                    itemId={item.id}
                    priority="secondary"
                    beneficiary={null}
                    acknowledgment={null}
                  />
                ) : null}
              </div>
            </div>
          )}

          {/* Activity feed — only after first acceptance */}
          {hasAcceptedAcknowledgment && (
            <div className="border-t mt-6 pt-6" style={{ borderColor: 'rgba(245,239,232,0.06)' }}>
              <ActivityFeed
                itemId={item.id}
                initialEvents={initialEvents}
                currentUserId={user.id}
                currentUserName={currentUserName}
                isOwner={isOwner}
                canMessage={canMessage}
              />
            </div>
          )}

          {/* Delete — owner only */}
          {isOwner && (
            <div className="pt-4">
              <DeleteItemButton itemId={item.id} itemName={item.name} />
            </div>
          )}

        </div>
      </div>

     </div>
      <BottomNav />
    </div>
  );
}

function RecipientCard({
  label,
  name,
  email,
  status,
  itemId,
  priority,
  beneficiary,
  acknowledgment,
}: {
  label: string;
  name: string;
  email: string;
  status: string | null;
  itemId: string;
  priority: 'primary' | 'secondary';
  beneficiary: Beneficiary;
  acknowledgment: Acknowledgment | null;
}) {
  const isAccepted = status === 'accepted';

  return (
    <div className={`rounded-xl p-3 ${isAccepted ? 'bg-emerald-900/20 border border-emerald-800/30' : ''}`} style={!isAccepted ? { backgroundColor: '#0C1519' } : undefined}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(245,239,232,0.35)' }}>
          {label}
        </p>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>{name}</p>
      <p className="text-xs" style={{ color: 'rgba(245,239,232,0.4)' }}>{email}</p>
      {isAccepted ? (
        <p className="text-[10px] text-emerald-400/60 font-mono mt-1">
          Accepted {acknowledgment?.acknowledged_at
            ? new Date(acknowledgment.acknowledged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : ''}
        </p>
      ) : (
        <div className="mt-2">
          <BeneficiarySlot
            itemId={itemId}
            priority={priority}
            beneficiary={beneficiary}
            acknowledgment={acknowledgment}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    accepted: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40',
    pending: 'bg-[#CF9D7B]/10 text-[#CF9D7B] border border-[#CF9D7B]/20',
    declined: 'bg-red-900/40 text-red-400 border border-red-800/40',
  };

  const labels: Record<string, string> = {
    accepted: 'Accepted',
    pending: 'Pending',
    declined: 'Declined',
  };

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}
