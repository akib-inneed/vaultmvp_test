'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface LeftForMeItem {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  item_description: string | null;
  owner_id: string;
  owner_email: string;
  ownerFullName: string;
  ownerFirstName: string;
  ackStatus: 'pending' | 'accepted' | 'declined';
}

export interface LeftForMeGroup {
  owner_id: string;
  owner_full_name: string;
  owner_email: string;
  items: LeftForMeItem[];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function OwnerAvatar({ name }: { name: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: 'rgba(207,157,123,0.2)' }}
    >
      <span className="text-xs font-semibold" style={{ color: '#CF9D7B' }}>
        {initials(name)}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' }) {
  if (status === 'accepted') {
    return (
      <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
        Accepted
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">
        Declined
      </span>
    );
  }
  return (
    <span
      className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ backgroundColor: 'rgba(207,157,123,0.1)', color: '#CF9D7B', borderColor: 'rgba(207,157,123,0.2)' }}
    >
      Awaiting
    </span>
  );
}

function LeftForMeGroupSection({ group }: { group: LeftForMeGroup }) {
  return (
    <div className="mb-6">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <OwnerAvatar name={group.owner_full_name} />
        <div className="min-w-0 flex-1">
          <p className="font-sans font-semibold text-sm truncate" style={{ color: '#F5EFE8' }}>
            {group.owner_full_name}
          </p>
          <p className="font-sans text-xs truncate" style={{ color: 'rgba(245,239,232,0.35)' }}>
            {group.owner_email}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs" style={{ color: 'rgba(245,239,232,0.3)' }}>
          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Item rows */}
      <div className="space-y-2">
        {group.items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition group"
            style={{ backgroundColor: '#162127' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1c2a32'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#162127'; }}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden relative" style={{ backgroundColor: '#2A3038' }}>
              {item.photo_url ? (
                <Image
                  src={item.photo_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20 text-xl">
                  📦
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium text-sm truncate" style={{ color: '#F5EFE8' }}>
                {item.name}
              </p>
              {item.item_description && (
                <p className="font-sans text-xs truncate mt-0.5" style={{ color: 'rgba(245,239,232,0.4)' }}>
                  {item.item_description}
                </p>
              )}
            </div>

            {/* Status badge */}
            <StatusBadge status={item.ackStatus} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LeftForMeList({ groups }: { groups: LeftForMeGroup[] }) {
  return (
    <div>
      {groups.map((group) => (
        <LeftForMeGroupSection key={group.owner_id} group={group} />
      ))}
    </div>
  );
}
