import { redirect } from 'next/navigation';

interface FirmPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /firms/[slug] \u2014 redirects to the client roster route.
 * Each view now lives at its own URL:
 *   /firms/[slug]/clients         \u2192 Client roster
 *   /firms/[slug]/invite          \u2192 Invite client
 *   /firms/[slug]/invite-sent     \u2192 Invite sent
 *   /firms/[slug]/clients/[id]    \u2192 Client detail
 */
export default async function FirmPage({ params }: FirmPageProps) {
  const { slug } = await params;
  redirect(`/firms/${slug}/clients`);
}