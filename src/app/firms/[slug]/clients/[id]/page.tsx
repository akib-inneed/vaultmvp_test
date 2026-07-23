import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClientDetail,
  formatRelativeOrAbsolute,
} from "@/lib/service/clientRoaster";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

function getItemIcon(itemName: string) {
  const name = itemName.toLowerCase();
  if (
    name.includes("ring") ||
    name.includes("jewelry") ||
    name.includes("sapphire") ||
    name.includes("gold") ||
    name.includes("diamond")
  )
    return "ti-diamond";
  if (name.includes("clock") || name.includes("watch") || name.includes("time"))
    return "ti-clock";
  if (
    name.includes("book") ||
    name.includes("recipe") ||
    name.includes("journal")
  )
    return "ti-book";
  if (
    name.includes("photo") ||
    name.includes("portrait") ||
    name.includes("picture") ||
    name.includes("frame")
  )
    return "ti-photo";
  return "ti-box";
}

export default async function ClientDetailPage({ params }: Props) {
  const { slug, id } = await params;

  const detail = await getClientDetail(id);

  if (detail?.status == "unauthorize") {
    return <div>Client didn't shared.</div>;
  }

  if (!detail) {
    notFound();
  }

  const { profile, items } = detail;

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const uniqueRecipients = new Set<string>();
  items?.forEach((item: any) => {
    item.beneficiaries?.forEach((ben: any) => {
      if (ben.email) {
        uniqueRecipients.add(ben.email.toLowerCase());
      } else if (ben.full_name) {
        uniqueRecipients.add(ben.full_name.toLowerCase());
      }
    });
  });
  const recipientsCount = uniqueRecipients.size;

  const sharedText = profile.shared_with_firms_at
    ? formatRelativeOrAbsolute(profile.shared_with_firms_at)
    : "recently";

  return (
    <div>
      {/* Back */}
      <Link
        href={`/firms/${slug}/clients`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fw-coffee)] cursor-pointer bg-transparent border-none mb-3.5 font-sans font-medium"
      >
        <i className="ti ti-arrow-left" /> Back to roster
      </Link>

      {/* Client header */}
      <div className="flex items-center gap-3.5 mb-1">
        <div className="w-[52px] h-[52px] rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-lg font-medium text-[var(--fw-coffee)]">
          {initials}
        </div>
        <div>
          <h2 className="font-['Fraunces',serif] font-light text-[23px] text-[var(--fw-ink)] m-0">
            {profile.full_name}
          </h2>
          <div className="text-[12.5px] text-[var(--fw-muted)]">
            Shared {sharedText} · {items?.length} item
            {items?.length !== 1 ? "s" : ""} · {recipientsCount} recipient
            {recipientsCount !== 1 ? "s" : ""} named
          </div>
        </div>
      </div>

      {/* Read-only pill */}
      <div className="my-[10px] mb-0.5">
        <span className="inline-flex items-center gap-1.5 bg-[var(--fw-cream)] text-[var(--fw-muted)] text-[11px] font-medium px-[11px] py-1 rounded-[20px]">
          <i className="ti ti-eye" /> Read-only · shared by the client
        </span>
      </div>

      {/* Items grid */}
      {items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl mt-[18px] min-h-[180px]">
          {/* <div className="w-[42px] h-[42px] rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-[var(--fw-coffee)] text-xl mb-2.5">
            <i className="ti ti-box" />
          </div> */}
          <h3 className="font-['Fraunces',serif] text-[16px] text-[var(--fw-ink)] font-normal mb-1">
            No items to show
          </h3>
          <p className="font-sans text-[12px] text-[var(--fw-muted)] max-w-[280px] leading-[1.5] m-0">
            This client hasn't catalogued any items in their vault yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-[18px]">
          {items?.map((item: any) => {
            const recipientText =
              item.beneficiaries && item.beneficiaries.length > 0
                ? `For: ${item.beneficiaries.map((b: any) => `${b.full_name} (${b.priority})`).join(", ")}`
                : "No beneficiary named";

            return (
              <div
                key={item.id}
                className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl p-3.5"
              >
                <div className="flex gap-[11px] items-center mb-2.5">
                  <div className="w-[42px] h-[42px] rounded-[9px] bg-[var(--fw-cream)] flex items-center justify-center text-[var(--fw-coffee)] text-xl shrink-0">
                    <i className={`ti ${getItemIcon(item.name)}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--fw-ink)]">
                      {item.name}
                    </div>
                    <div className="text-[11.5px] text-[var(--fw-coffee)]">
                      {recipientText}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[var(--fw-ink-soft)] leading-[1.5] border-t border-[#F0E9DE] pt-[9px]">
                  {item.description || "No description provided."}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
