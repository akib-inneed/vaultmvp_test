import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Join Heirlo",
  description:
    "Confirm your details and begin documenting your personal property.",
};

/**
 * Layout for client join links (/join/[firmSlug]/[token]).
 * Chromeless — no firm app shell. Shares design tokens with the firm portal.
 */
export default function JoinLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Tabler Icons — used on the arrival screen */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.7.0/tabler-icons.min.css"
      />

      <style>{`
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

      <div className="min-h-screen bg-[var(--fw-cream)] font-sans text-[var(--fw-ink-soft)] antialiased leading-[1.55] px-0 py-6 md:px-6 md:py-8">
        {children}
      </div>
    </>
  );
}
