import { getClientInvite } from "@/lib/service/clientRoaster";
import { getFirmInitial } from "@/lib/email";
import { getFirmBySlug } from "@/lib/service/firm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function InviteSentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q } = await searchParams;

  const firm = await getFirmBySlug(slug);
  const invite = await getClientInvite(q!);

  if (!firm || !invite) {
    notFound();
  }

  const clientFirstName = invite.client_name.split(" ")[0] || invite.client_name;
  const replyToEmail = firm.replay_to_email || "hello@heirlo.app";

  return (
    <div>
      {/* Back */}
      <Link
        href={`/firms/${slug}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
      >
        <i className="ti ti-arrow-left" /> Back
      </Link>

      <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
        Invite sent
      </div>
      <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0">
        {invite.client_name} has been invited
      </h2>

      {/* Sent banner */}
      <div className="flex items-center gap-3 bg-[var(--fw-soft)] rounded-[11px] px-4 py-3.5 max-w-[560px] mt-4 mb-2">
        <div className="w-[34px] h-[34px] rounded-full bg-[var(--fw-coffee)] flex items-center justify-center shrink-0">
          <i className="ti ti-mail-check text-[18px] text-[var(--fw-linen)]" />
        </div>
        <div className="text-[13px] text-[var(--fw-ink)] leading-[1.4]">
          A co-branded invitation was emailed to{" "}
          <strong>{invite.client_email}</strong>. They&apos;ll show as{" "}
          <strong>Invited</strong> in your roster until they get started.
        </div>
      </div>

      {/* Email preview label */}
      <div className="text-[11px] tracking-[0.1em] uppercase text-[var(--fw-muted)] mt-[22px] mb-2.5">
        What {invite.client_name} receives
      </div>

      {/* Email preview card */}
      <div className="max-w-[560px] bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-[14px] overflow-hidden">
        {/* Email meta */}
        <div className="px-[18px] py-3.5 border-b border-[#F0E9DE] text-xs text-[var(--fw-muted)]">
          {[
            {
              k: "From",
              v: (
                <>
                  <strong>{firm.name}</strong> via Heirlo
                  &lt;hello@heirlo.app&gt;
                </>
              ),
            },
            { k: "Reply-to", v: replyToEmail },
            {
              k: "Subject",
              v: (
                <strong>
                  {firm.name} invited you to document what matters
                </strong>
              ),
            },
          ].map(({ k, v }) => (
            <div
              key={k}
              className="flex gap-2 mb-[3px] flex-wrap sm:flex-nowrap"
            >
              <span className="w-11 text-[var(--fw-muted)] shrink-0">{k}</span>
              <span className="text-[var(--fw-ink-soft)]">{v}</span>
            </div>
          ))}
        </div>

        {/* Email header */}
        <div className="bg-[var(--fw-ink)] p-5 text-center">
          <div className="inline-flex items-center gap-[9px]">
            <div className="w-7 h-7 rounded-full bg-[var(--fw-coffee)] flex items-center justify-center">
              <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-sm">
                {getFirmInitial(firm.name)}
              </span>
            </div>
            <span className="text-[13px] text-[var(--fw-linen)] font-medium">
              {firm.name}
            </span>
            <span className="text-[#CF9D7B]/40 text-[13px]">×</span>
            <span className="font-['Fraunces',serif] font-black text-[var(--fw-brass)] text-sm tracking-[0.04em]">
              Heirlo
            </span>
          </div>
        </div>

        {/* Email body */}
        <div className="px-[22px] py-6">
          <h3 className="font-['Fraunces',serif] font-light text-[20px] text-[var(--fw-ink)] mb-3 leading-[1.25]">
            {clientFirstName}, your attorney has a gift of clarity for you
          </h3>
          <p className="text-[13px] text-[var(--fw-ink-soft)] leading-[1.6] mb-3.5">
            {firm.name} uses Heirlo to help you document your personal
            belongings, the pieces that carry meaning, and note who each should
            go to. It takes the pressure off the paperwork and makes sure your
            wishes are captured in your own words.
          </p>
          <p className="text-[13px] text-[var(--fw-ink-soft)] leading-[1.6] mb-3.5">
            Your details are already set up. Just tap below to begin, best done
            on your phone, where you can photograph each item as you go.
          </p>
          <div className="bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-[13.5px] font-medium p-3 rounded-md mt-1.5 mb-4">
            Get started with Heirlo
          </div>
          <div className="text-[10.5px] text-[var(--fw-muted)] italic leading-[1.5] border-t border-[#F0E9DE] pt-3">
            This invite was sent to you by via Heirlo. If you have questions about your estate planning, please reply directly to your attorney.
            
          </div>
        </div>
      </div>
    </div>
  );
}
