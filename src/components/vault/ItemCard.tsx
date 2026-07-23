import Image from 'next/image';
import Link from 'next/link';
import type { ItemWithBeneficiaries } from '@/lib/types';

interface ItemCardProps {
  item: ItemWithBeneficiaries;
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function ItemCard({ item }: ItemCardProps) {
  const primary = (item.beneficiaries ?? []).find((b) => b.priority === 'primary') ?? null;
  const totalCount = (item.beneficiaries ?? []).length;

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-jungle rounded-2xl border border-ink/10 overflow-hidden hover:border-teal/40 hover:shadow-md transition-all duration-200"
    >
      {item.photo_url ? (
        <>
          {/* Square photo */}
          <div className="aspect-[3/4] relative bg-jet overflow-hidden">
            <Image
              src={item.photo_url}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {/* Pet badge — top-left */}
            {item.item_type === 'pet' && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center bg-cream/90 backdrop-blur-sm text-teal text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-sm border border-teal/20 gap-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 2C4.67 2 4 2.9 4 4s.67 2 1.5 2S7 5.1 7 4s-.67-2-1.5-2zM10.5 2C9.67 2 9 2.9 9 4s.67 2 1.5 2S12 5.1 12 4s-.67-2-1.5-2zM3 6.5C2.17 6.5 1.5 7.4 1.5 8.5S2.17 10.5 3 10.5 4.5 9.6 4.5 8.5 3.83 6.5 3 6.5zM13 6.5c-.83 0-1.5.9-1.5 2s.67 2 1.5 2 1.5-.9 1.5-2-.67-2-1.5-2zM8 7c-1.66 0-3 1.79-3 4 0 1.1.45 2 1 2 .35 0 .68-.25 1-.67.32.42.65.67 1 .67s.68-.25 1-.67c.32.42.65.67 1 .67.55 0 1-.9 1-2 0-2.21-1.34-4-3-4z"/>
                  </svg>
                  Pet
                </span>
              </div>
            )}

            {/* Unassigned badge — top-left (only if not a pet, to avoid overlap) */}
            {totalCount === 0 && item.item_type !== 'pet' && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center bg-cream/90 backdrop-blur-sm text-amber text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-sm border border-amber/20">
                  Unassigned
                </span>
              </div>
            )}
            {/* Unassigned badge — below pet badge if pet */}
            {totalCount === 0 && item.item_type === 'pet' && (
              <div className="absolute top-8 left-2">
                <span className="inline-flex items-center bg-cream/90 backdrop-blur-sm text-amber text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-sm border border-amber/20">
                  Unassigned
                </span>
              </div>
            )}

            {/* Recipient avatar — bottom-right */}
            {primary && (
              <div className="absolute bottom-2.5 right-2.5">
                <div className="w-8 h-8 rounded-full bg-teal border-2 border-cream shadow-md flex items-center justify-center">
                  <span className="text-white text-[10px] font-mono font-semibold leading-none">
                    {initials(primary.full_name)}
                  </span>
                </div>
                {totalCount > 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-jungle border border-ink/15 flex items-center justify-center">
                    <span className="text-ink/50 text-[8px] font-mono leading-none">+{totalCount - 1}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4">
            <h3 className="font-sans font-medium text-ink text-sm leading-snug truncate group-hover:text-teal transition-colors">
              {item.name}
            </h3>
            {item.description ? (
              <p className="text-xs text-ink/45 font-sans mt-0.5 truncate">{item.description}</p>
            ) : (
              !primary && (
                <p className="text-xs text-amber/70 font-sans mt-0.5">Assign a recipient →</p>
              )
            )}
            {item.estimated_value != null && (
              <p className="text-xs text-ink/35 font-mono mt-1.5">
                ${item.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* No-photo: centered initials or icon */}
          <div className="aspect-[3/4] relative bg-jet overflow-hidden flex items-center justify-center">
            {primary ? (
              <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-mono font-semibold leading-none">
                  {initials(primary.full_name)}
                </span>
              </div>
            ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-teal/30">
                <rect x="6" y="4" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 14h14M13 20h14M13 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}

            {/* Pet badge — top-left */}
            {item.item_type === 'pet' && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center bg-cream/90 backdrop-blur-sm text-teal text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-sm border border-teal/20 gap-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 2C4.67 2 4 2.9 4 4s.67 2 1.5 2S7 5.1 7 4s-.67-2-1.5-2zM10.5 2C9.67 2 9 2.9 9 4s.67 2 1.5 2S12 5.1 12 4s-.67-2-1.5-2zM3 6.5C2.17 6.5 1.5 7.4 1.5 8.5S2.17 10.5 3 10.5 4.5 9.6 4.5 8.5 3.83 6.5 3 6.5zM13 6.5c-.83 0-1.5.9-1.5 2s.67 2 1.5 2 1.5-.9 1.5-2-.67-2-1.5-2zM8 7c-1.66 0-3 1.79-3 4 0 1.1.45 2 1 2 .35 0 .68-.25 1-.67.32.42.65.67 1 .67s.68-.25 1-.67c.32.42.65.67 1 .67.55 0 1-.9 1-2 0-2.21-1.34-4-3-4z"/>
                  </svg>
                  Pet
                </span>
              </div>
            )}

            {/* Unassigned badge */}
            {totalCount === 0 && (
              <div className={`absolute ${item.item_type === 'pet' ? 'top-8' : 'top-2'} left-2`}>
                <span className="inline-flex items-center bg-cream/90 backdrop-blur-sm text-amber text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-sm border border-amber/20">
                  Unassigned
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4">
            <h3 className="font-sans font-medium text-ink text-sm leading-snug truncate group-hover:text-teal transition-colors">
              {item.name}
            </h3>
            {item.description ? (
              <p className="text-xs text-ink/45 font-sans mt-0.5 truncate">{item.description}</p>
            ) : (
              !primary && (
                <p className="text-xs text-amber/70 font-sans mt-0.5">Assign a recipient →</p>
              )
            )}
            {item.estimated_value != null && (
              <p className="text-xs text-ink/35 font-mono mt-1.5">
                ${item.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
