import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { AcknowledgeActions } from './AcknowledgeActions';
import { SignOutButton } from './SignOutButton';
import { getItemImageUrl } from '@/lib/items/photos';
import type { User } from '@supabase/supabase-js';

export default async function AcknowledgePage({ params }: { params: { token: string } }) {
  // ── Auth check — non-throwing ──
  let user: User | null = null;
  try {
    const authClient = await createClient();
    const { data, error } = await authClient.auth.getUser();
    if (error) {
      console.error('[acknowledge] auth.getUser error (treating as logged out):', error.message);
    }
    user = data?.user ?? null;
  } catch (err) {
    console.error('[acknowledge] auth check threw (treating as logged out):', err);
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Fetch acknowledgment + related data via joins ──
  const { data: ack, error: ackError } = await supabase
    .from('acknowledgments')
    .select(`
      id,
      status,
      acknowledged_at,
      token,
      beneficiary_id,
      item_id,
      beneficiaries (
        full_name,
        email,
        priority,
        owner_id
      ),
      items (
        name,
        description,
        photo_url,
        estimated_value
      )
    `)
    .eq('token', params.token)
    .single();

  if (ackError) {
    console.error('[acknowledge] Supabase query error:', ackError.message, ackError.details, ackError.hint);
  }

  if (!ack || !ack.beneficiaries || !ack.items) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#0C1519' }}>
        <div className="w-full max-w-sm text-center">
          <p className="text-sm" style={{ color: 'rgba(245,239,232,0.5)' }}>
            This link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-sm transition"
            style={{ color: '#CF9D7B' }}
          >
            Go to Heirlo
          </Link>
        </div>
      </div>
    );
  }

  const ben = (Array.isArray(ack.beneficiaries) ? ack.beneficiaries[0] : ack.beneficiaries) as unknown as {
    full_name: string;
    email: string;
    priority: string;
    owner_id: string;
  };
  const item = (Array.isArray(ack.items) ? ack.items[0] : ack.items) as unknown as {
    name: string;
    description: string;
    photo_url: string | null;
    estimated_value: number | null;
  };
  item.photo_url = await getItemImageUrl(supabase, item.photo_url);

  // Fetch owner name
  const { data: owner, error: ownerError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', ben.owner_id)
    .single();

  if (ownerError) {
    console.error('[acknowledge] Owner profile query error:', ownerError.message);
  }

  const ownerName = owner?.full_name ?? 'Someone';
  const ownerFirstName = ownerName.split(' ')[0];
  const recipientEmail = ben.email;
  const alreadyResponded = ack.status !== 'pending';

  // Determine auth state
  const isLoggedIn = !!user;
  const currentUserEmail = user?.email ?? '';
  const emailMatches = isLoggedIn && currentUserEmail.toLowerCase() === recipientEmail.toLowerCase();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#0C1519' }}>
      <div className="w-full max-w-sm">

        {/* ── Item preview card — always visible ── */}
        <div className="mb-8">
          {/* Photo */}
          {item.photo_url ? (
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden mb-5">
              <Image
                src={item.photo_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 384px"
              />
            </div>
          ) : (
            <div
              className="aspect-[4/3] rounded-xl mb-5 flex items-center justify-center"
              style={{ backgroundColor: '#162127' }}
            >
              <span className="text-5xl opacity-30">📦</span>
            </div>
          )}

          {/* "Left for you by" label */}
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: '#CF9D7B' }}
          >
            Left for you by {ownerFirstName}
          </p>

          {/* Item name */}
          <h1
            className="font-serif text-2xl font-semibold leading-tight"
            style={{ color: '#F5EFE8' }}
          >
            {item.name}
          </h1>

          {/* Description */}
          {item.description && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(245,239,232,0.5)' }}>
              {item.description}
            </p>
          )}
        </div>

        {/* ── Action area ── */}

        {alreadyResponded ? (
          /* Already responded */
          <div className="text-center mt-8">
            {ack.status === 'accepted' ? (
              <>
                <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
                  You&apos;ve already accepted this item.
                </p>
                {ack.acknowledged_at && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(245,239,232,0.35)' }}>
                    {new Date(ack.acknowledged_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
                You&apos;ve already declined this item.
              </p>
            )}
          </div>
        ) : !isLoggedIn ? (
          /* STATE 1 — Not logged in */
          <div className="mt-8">
            <p className="text-sm text-center mb-5" style={{ color: 'rgba(245,239,232,0.5)' }}>
              Create an account to accept
            </p>
            <Link
              href={`/auth/signup?email=${encodeURIComponent(recipientEmail)}&redirect=${encodeURIComponent(`/acknowledge/${params.token}`)}`}
              className="block w-full rounded-full py-3 text-sm font-semibold text-center transition hover:opacity-90"
              style={{ backgroundColor: '#CF9D7B', color: '#0C1519' }}
            >
              Create an account
            </Link>
            <p className="text-center mt-4">
              <Link
                href={`/auth/login?email=${encodeURIComponent(recipientEmail)}&redirect=${encodeURIComponent(`/acknowledge/${params.token}`)}`}
                className="text-sm transition"
                style={{ color: 'rgba(245,239,232,0.4)' }}
              >
                Already have an account? Log in
              </Link>
            </p>
          </div>
        ) : emailMatches ? (
          /* STATE 2 — Logged in, email matches */
          <div className="mt-8">
            <AcknowledgeActions token={params.token} />
          </div>
        ) : (
          /* STATE 3 — Logged in, email does NOT match */
          <div className="mt-8">
            <p className="text-sm text-center mb-1" style={{ color: 'rgba(245,239,232,0.5)' }}>
              This item was left for <span style={{ color: '#F5EFE8' }}>{recipientEmail}</span>.
            </p>
            <p className="text-sm text-center mb-5" style={{ color: 'rgba(245,239,232,0.35)' }}>
              You&apos;re signed in as {currentUserEmail}.
            </p>
            <SignOutButton
              recipientEmail={recipientEmail}
              token={params.token}
            />
            <p className="text-center mt-4">
              <Link
                href="/dashboard"
                className="text-sm transition"
                style={{ color: 'rgba(245,239,232,0.4)' }}
              >
                Go to my dashboard
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
