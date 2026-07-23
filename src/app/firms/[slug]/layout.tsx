import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAttorneyDetail } from "@/lib/service/firm";
import { FirmShell } from "@/components/firm/FirmShell";

export const metadata: Metadata = {
  title: "Heirlo for Firms — Dashboard",
  description:
    "Manage your estate-planning clients through the Heirlo firm portal.",
};

/**
 * Layout for the firm portal (/firm/[slug]).
 *
 * Responsibilities:
 *  • Inject the Tabler Icons stylesheet (used only in this sub-tree)
 *  • Define CSS custom properties (design tokens) scoped to this layout
 *  • Load the DM Sans + Fraunces Google Fonts subset needed here
 */
export default async function FirmLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const attorney = await getAttorneyDetail(user);
  const slug = (await params).slug;

  if (attorney.role != "attorney") {
    redirect("/unauthorized");
  }

  if (attorney.firms.slug != slug) {
    redirect("/unauthorized");

  }

  const firmName = attorney.firms.name;
  const firmEmail = attorney.firms.replay_to_email;

  return (
    <>
      {/* Tabler Icons — only needed in the firm portal */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.7.0/tabler-icons.min.css"
      />

      {/* Firm-scoped design tokens + base reset */}
      <style>{`
        /* ── Firm portal color tokens ── */
        .fw-root, .fw-root * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --fw-linen:    #F5EFE8;
          --fw-cream:    #EDE5DB;
          --fw-ink:      #1B1612;
          --fw-coffee:   #724B39;
          --fw-brass:    #CF9D7B;
          --fw-ink-soft: #3D332C;
          --fw-red:      #8E2C2C;
          --fw-muted:    #9A8C7C;
          --fw-line:     #E0D6C8;
          --fw-card:     #FFFDFA;
          --fw-soft:     #EDE0D3;
          --fw-sage:     #E4EAE0;
          --fw-sage-tx:  #4A5A3C;
        }
      `}</style>

      <div className="bg-[var(--fw-cream)] text-[var(--fw-ink-soft)] font-sans antialiased leading-[1.55] min-h-screen">
        <FirmShell firmName={firmName} firmEmail={firmEmail}>
          {children}
        </FirmShell>
      </div>
    </>
  );
}
