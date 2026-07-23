import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { PetAcknowledgeActions } from './PetAcknowledgeActions';
import { PetSignOutButton } from './PetSignOutButton';
import type { User } from '@supabase/supabase-js';

export default async function AcknowledgePetPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const ackToken = searchParams.token;

  if (!ackToken) {
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

  // Auth check (non-throwing)
  let user: User | null = null;
  try {
    const authClient = await createClient();
    const { data, error } = await authClient.auth.getUser();
    if (error) {
      console.error('[acknowledge-pet] auth.getUser error (treating as logged out):', error.message);
    }
    user = data?.user ?? null;
  } catch (err) {
    console.error('[acknowledge-pet] auth check threw (treating as logged out):', err);
  }

  const isLoggedIn = !!user;

  // If not logged in, redirect to login with return path
  if (!isLoggedIn) {
    const returnPath = `/acknowledge-pet?token=${encodeURIComponent(ackToken)}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(returnPath)}`);
  }

  // Fetch acknowledgment data via service role
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: ack, error: ackError } = await supabase
    .from('pet_acknowledgments')
    .select(`
      id,
      status,
      acknowledged_at,
      token,
      caregiver_id,
      pet_id,
      pet_caregivers (
        full_name,
        email,
        pets (
          id,
          name,
          owner_id
        )
      )
    `)
    .eq('token', ackToken)
    .single();

  if (ackError) {
    console.error('[acknowledge-pet] Supabase query error:', ackError.message, ackError.details, ackError.hint);
  }

  const caregiver = (ack as Record<string, unknown>)?.pet_caregivers as {
    full_name: string;
    email: string;
    pets: { id: string; name: string; owner_id: string } | null;
  } | null;

  const pet = caregiver?.pets ?? null;

  if (!ack || !caregiver || !pet) {
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

  // Fetch owner name
  const { data: owner } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', pet.owner_id)
    .single();

  const ownerName = owner?.full_name ?? 'Someone';
  const ownerFirstName = ownerName.split(' ')[0];
  const caregiverEmail = caregiver.email;
  const currentUserEmail = user!.email ?? '';
  const emailMatches = currentUserEmail.toLowerCase() === caregiverEmail.toLowerCase();
  const alreadyResponded = ack.status !== 'pending';

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#0C1519' }}>
      <div className="w-full max-w-sm">

        {/* Pet preview */}
        <div className="mb-8">
          <div
            className="aspect-[4/3] rounded-xl mb-5 flex items-center justify-center"
            style={{ backgroundColor: '#162127' }}
          >
            <span className="text-5xl opacity-30">🐾</span>
          </div>

          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: '#CF9D7B' }}
          >
            Entrusted to you by {ownerFirstName}
          </p>

          <h1
            className="font-serif text-2xl font-semibold leading-tight"
            style={{ color: '#F5EFE8' }}
          >
            {pet.name}
          </h1>
        </div>

        {/* Action area */}

        {alreadyResponded ? (
          <div className="text-center mt-8">
            {ack.status === 'accepted' ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg" style={{ color: '#3DB87A' }}>&#10003;</span>
                  <p className="text-sm font-medium" style={{ color: '#F5EFE8' }}>
                    You&apos;ve accepted care of {pet.name}
                  </p>
                </div>
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
                You&apos;ve declined this assignment.
              </p>
            )}
          </div>
        ) : emailMatches ? (
          <div className="mt-8">
            <PetAcknowledgeActions
              acknowledgmentId={ack.id}
              petName={pet.name}
            />
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-sm text-center mb-1" style={{ color: 'rgba(245,239,232,0.5)' }}>
              This assignment is for <span style={{ color: '#F5EFE8' }}>{caregiverEmail}</span>.
            </p>
            <p className="text-sm text-center mb-5" style={{ color: 'rgba(245,239,232,0.35)' }}>
              You&apos;re signed in as {currentUserEmail}.
            </p>
            <PetSignOutButton
              caregiverEmail={caregiverEmail}
              ackToken={ackToken}
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
