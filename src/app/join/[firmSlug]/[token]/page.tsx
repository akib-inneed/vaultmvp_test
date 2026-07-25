import { getInvitedClient } from "@/lib/service/clientRoaster";
import { getFirmBySlug } from "@/lib/service/firm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ firmSlug: string; token: string }>;
}

async function getStarted(formData: FormData) {
  "use server";
  // Your server-side logic here
  const supabase = await createClient();
  const firmId = formData.get("firm_id") as string;
  const userId = formData.get("user_id") as string;
  const token = formData.get("token") as string;

  const { error: inviteError } = await supabase
    .from("client_invites")
    .update({
      status: "claimed",
    })
    .eq("token", token)
    .select();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      firm_id: firmId,
    })
    .eq("id", userId)
    .select();

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  redirect("/dashboard");
}

export default async function JoinPage({ params }: Props) {
  const supabase = await createClient();
  const { firmSlug, token } = await params;

  const firm = await getFirmBySlug(firmSlug);

  const client = await getInvitedClient(token);

  // updateInviteOpenStatus(client.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const renderInvitationAction = () => {
    if (!user) {
      return (
        <Link
          href={`/auth/login?create=true&token=${token}`}
          className="mb-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--fw-coffee)] text-sm font-medium text-[var(--fw-linen)] transition hover:opacity-95 active:scale-[0.98]"
        >
          <i className="ti ti-check mr-2" />
          Create Account
        </Link>
      );
    }

    /**
     * only client can join via this link not attorney
     */
    if (profile?.role == "attorney") {
      return (
        <p className="mb-4 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-600">
          Only client can join vai this link
        </p>
      );
    }

    /**
     * for logged in client alredy claimed
     */
    if (user.email === client?.client_email && client?.status === "claimed") {
      return (
        <p className="mb-4 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-600">
          This invitation has already been claimed.{" "}
          <Link className="underline" href="/dashboard">
            Dashboard
          </Link>
        </p>
      );
    }

    /**
     * for logged in client join
     */
    return (
      <form action={getStarted}>
        <input type="hidden" name="firm_id" value={firm.id} />
        <input type="hidden" name="user_id" value={user.id} />
        <input type="hidden" name="token" value={token} />

        <button
          type="submit"
          className="mb-4 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--fw-coffee)] text-sm font-medium text-[var(--fw-linen)] transition hover:opacity-95 active:scale-[0.98]"
        >
          <i className="ti ti-check mr-2" />
          Yes, this is me. Get started
        </button>
      </form>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-xl justify-center px-4 sm:px-6">
      <div className="w-full overflow-hidden rounded-2xl border border-[var(--fw-line)] bg-[var(--fw-card)] shadow-sm">
        {/* Top — dark co-branded header */}
        <div className="bg-[var(--fw-ink)] px-8 py-8 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fw-coffee)]">
              <span className="font-['Fraunces',serif] text-[16px] font-black text-[var(--fw-brass)]">
                W
              </span>
            </div>

            <div className="text-[15px] font-medium text-[var(--fw-linen)]">
              {firm.name}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#EDE5DB]/60">
            invited you to Heirlo
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <h3 className="mb-3 text-center font-['Fraunces',serif] text-[28px] font-light leading-tight text-[var(--fw-ink)]">
            Welcome, {client.client_name}
          </h3>

          <div className="mx-auto mb-8 max-w-md text-center text-[14px] leading-6 text-[var(--fw-ink-soft)]">
            Your attorney set this up for you. Please confirm your details are
            correct, then you can begin documenting your estate.
          </div>

          {/* Confirm block */}
          <div className="mb-6 rounded-xl bg-[var(--fw-linen)] p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-muted)]">
              Is this you?
            </div>

            {[
              {
                icon: "ti-user",
                label: "Name",
                value: client.client_name,
              },
              {
                icon: "ti-mail",
                label: "Email",
                value: client.client_email,
              },
              {
                icon: "ti-phone",
                label: "Phone",
                value: client.client_phone,
              },
            ].map(({ icon, label, value }, i, arr) => (
              <div
                key={label}
                className={`flex items-center gap-3 py-3 ${
                  i < arr.length - 1 ? "border-b border-[#F0E9DE]" : ""
                }`}
              >
                <i
                  className={`ti ${icon} w-5 text-[18px] text-[var(--fw-coffee)]`}
                />

                <span className="w-14 text-[11px] text-[var(--fw-muted)]">
                  {label}
                </span>

                <span className="flex-1 break-all text-[14px] font-medium text-[var(--fw-ink)]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {renderInvitationAction()}

          {/* Alt action */}

          {/* Legal placeholder */}
          <div className="mt-8 border-t border-[var(--fw-line)] pt-5 text-center text-[11px] italic leading-5 text-[var(--fw-muted)]">
            [Placeholder for April: consent and terms language shown here at
            first sign-in, referencing UPC 2-513 and advising the client to
            consult a licensed estate attorney.]
          </div>
        </div>
      </div>
    </div>
  );
}
