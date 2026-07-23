import { getFirmBySlug } from "@/lib/service/firm";
import { createClient } from "@/lib/supabase/server";
import { sendAttorneyInviteClientEmail } from "@/lib/email";
import Link from "next/link";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

async function inviteClient(formData: FormData): Promise<void> {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();

  if (!fullName || !email || !slug) {
    throw new Error("Client name, email, and firm are required");
  }

  const firm = await getFirmBySlug(slug);

  if (!firm) {
    throw new Error("Firm not found");
  }

  const token = randomBytes(16).toString("base64url");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl.replace(/\/$/, "")}/join/${firm.slug}/${token}`;

  const { data, error } = await supabase
    .from("client_invites")
    .insert({
      client_name: fullName,
      client_email: email,
      client_phone: phone,
      token: token,
      firm_id: firm.id,
      invited_by: user?.id,
      status: "sent",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const emailResult = await sendAttorneyInviteClientEmail({
    clientEmail: email,
    clientName: fullName,
    firmName: firm.name,
    inviteLink,
    replyTo: firm.replay_to_email || user.email,
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error ?? "Invitation email could not be sent");
  }

  redirect(`/firms/${firm?.slug}/invite-sent?q=${data.id}`);
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;

  return (
    <div>
      {/* Back */}
      <Link
        href={`/firms/${slug}/clients`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans"
      >
        <i className="ti ti-arrow-left" /> Back to roster
      </Link>

      <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
        Add a client
      </div>
      <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0 mb-5">
        Invite a client
      </h2>

      <div className="max-w-[520px]">
        <p className="text-[13.5px] text-[var(--fw-ink-soft)] leading-[1.6] my-1.5 mb-5 max-w-[480px]">
          Enter your client&apos;s details. Heirlo emails them a co-branded
          invitation right away, from your firm, and sets up their account so
          they can start documenting. Their name, phone, and email pre-fill
          their profile.
        </p>

        <form action={inviteClient} className="max-w-[520px]">
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5">
              Full name*
            </label>

            <div className="bg-[var(--fw-card)] border rounded-[9px] px-[13px] py-[11px] flex items-center gap-[9px]">
              <i className="ti ti-user" />
              <input
                name="fullName"
                type="text"
                placeholder="Eleanor Mathers"
                className="flex-1 bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5">Email*</label>

            <div className="bg-[var(--fw-card)] border rounded-[9px] px-[13px] py-[11px] flex items-center gap-[9px]">
              <i className="ti ti-mail" />
              <input
                name="email"
                type="email"
                placeholder="eleanor@email.com"
                className="flex-1 bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5">Phone</label>

            <div className="bg-[var(--fw-card)] border rounded-[9px] px-[13px] py-[11px] flex items-center gap-[9px]">
              <i className="ti ti-phone" />
              <input
                name="phone"
                type="tel"
                placeholder="(404) 555-0173"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <input value={slug} name="slug" type="hidden" required />

          {/* Shield note */}
          <div className="bg-[var(--fw-soft)] rounded-[10px] px-[15px] py-[13px] flex gap-2.5 items-start mt-2">
            <i className="ti ti-shield-check text-[var(--fw-coffee)] text-[17px] mt-[1px]" />
            <div className="text-xs text-[var(--fw-ink-soft)] leading-[1.5]">
              Heirlo emails your client a co-branded invitation the moment you send.
              Her details are bound to the invite, so her record is set up and
              confirmed as your client&apos;s when she opens it.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 mt-[22px]">
            <button className="flex-1 bg-[var(--fw-coffee)] text-[var(--fw-linen)] text-center text-sm font-medium p-3 rounded-[10px] cursor-pointer border-none font-sans flex items-center justify-center gap-1.5">
              <i className="ti ti-send" /> Send invitation
            </button>
            <Link
              href={`/firms/${slug}/clients`}
              className="flex-none sm:basis-[120px] border border-[var(--fw-line)] text-[var(--fw-coffee)] text-center text-sm p-3 rounded-[10px] cursor-pointer bg-transparent font-sans"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
