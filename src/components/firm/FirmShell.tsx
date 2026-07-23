"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { FirmTopBar } from "./FirmTopBar";
import LogoutButton from "@/components/auth/Logout";

interface FirmShellProps {
  children: ReactNode;
  firmName?: string;
  firmEmail?: string;
}

export function FirmShell({
  children,
  firmName = "Whitfield Estate Law",
  firmEmail = "a.whitfield@firm.com",
}: FirmShellProps) {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();

  const slug = params?.slug ?? "whitfield";

  const activeNav = pathname.includes("/questions")
    ? "questions"
    : pathname.includes("/clients")
      ? "clients"
      : null;

  function tabStyle(active: boolean): string {
    return `px-2 py-3.5 text-[13.5px] font-sans flex items-center gap-[7px] cursor-pointer bg-transparent border-none no-underline transition-colors ${
      active
        ? "text-[var(--fw-ink)] font-medium border-b-2 border-b-[var(--fw-coffee)]"
        : "text-[var(--fw-muted)] font-normal border-b-2 border-b-transparent"
    }`;
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 font-sans">
      <div className="bg-[var(--fw-linen)] border border-[var(--fw-line)] rounded-[18px] overflow-hidden animate-[fw-fade_0.3s_ease]">
        <FirmTopBar firmName={firmName} firmEmail={firmEmail} />

        <div className="bg-[var(--fw-card)] border-b border-[var(--fw-line)] flex justify-between px-4 sm:px-[26px] gap-1 overflow-x-auto py-3">
          <div className="flex gap-1 justify-between">
            <Link
              href={`/firms/${slug}/clients`}
              className={tabStyle(activeNav === "clients")}
            >
              <i className="ti ti-users" />
              Clients
            </Link>

            <Link
              href={`/firms/${slug}/questions`}
              className={tabStyle(activeNav === "questions")}
            >
              <i className="ti ti-messages" />
              Questions
              <span className="bg-[var(--fw-red)] text-[var(--fw-linen)] text-[10px] font-bold rounded-[10px] px-[7px] py-[1px] ml-0.5">
                2
              </span>
            </Link>
          </div>
          <LogoutButton></LogoutButton>
        </div>

        <div className="p-4 sm:p-[26px]">{children}</div>
      </div>

      <style>{`
        @keyframes fw-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
