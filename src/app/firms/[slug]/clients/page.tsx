import { CLIENT_STATUS } from "@/lib/constant";
import { getFirmClients } from "@/lib/service/clientRoaster";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
interface Props {
  params: Promise<{ slug: string }>;
}

const STATUS_BADGE: Record<
  string,
  { label: string; icon: string; style: React.CSSProperties }
> = {
  [CLIENT_STATUS.SHARED]: {
    label: "Shared",
    icon: "ti-check",
    style: { background: "var(--fw-soft)", color: "var(--fw-coffee)" },
  },
  [CLIENT_STATUS.IN_PROGRESS]: {
    label: "In progress",
    icon: "ti-progress",
    style: { background: "var(--fw-sage)", color: "var(--fw-sage-tx)" },
  },
  [CLIENT_STATUS.INVITED]: {
    label: "Invited",
    icon: "ti-mail-check",
    style: { background: "var(--fw-cream)", color: "var(--fw-muted)" },
  },
};

export default async function ClientsPage({ params }: Props) {
  const slug = (await params).slug;

  // function onNavigate(view: string) {
  //   if (view === 'invite') router.push(`/firms/${slug}/invite`);
  //   else if (view === 'detail') router.push(`/firms/${slug}/clients/eleanor-mathers`);
  //   else router.push(`/firms/${slug}/clients`);
  // }
  const clients = await getFirmClients(slug);
  const inProgressCount = clients?.reduce(
    (count, client) =>
      count + (client.status === CLIENT_STATUS.IN_PROGRESS ? 1 : 0),
    0,
  );

  const sharedCount = clients?.reduce(
    (count, client) => count + (client.status === CLIENT_STATUS.SHARED ? 1 : 0),
    0,
  );

  const invitedClount = clients?.reduce(
    (count, client) =>
      count + (client.status === CLIENT_STATUS.INVITED ? 1 : 0),
    0,
  );

  return (
    <div>
      {/* Eyebrow + heading */}
      <div className="font-['Fraunces',serif] font-light italic text-[13px] text-[var(--fw-coffee)] mb-[3px]">
        Your clients
      </div>
      <h2 className="font-['Fraunces',serif] font-light text-[26px] text-[var(--fw-ink)] m-0">
        Client roster
      </h2>

      {/* Stat tiles */}
      <div className="flex flex-col sm:flex-row gap-3 my-5">
        {[
          { v: invitedClount, l: "Invited" },
          { v: inProgressCount, l: "In progress" },
          { v: sharedCount, l: "Shared with you", accent: true },
        ].map(({ v, l, accent }) => (
          <div
            key={l}
            className="flex-1 bg-[var(--fw-cream)] rounded-[10px] px-4 py-3.5"
          >
            <div
              className={`text-2xl font-medium ${accent ? "text-[var(--fw-coffee)]" : "text-[var(--fw-ink)]"}`}
            >
              {v}
            </div>
            <div className="text-[11.5px] text-[var(--fw-ink-soft)] tracking-[0.03em]">
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mx-1 mt-1.5 mb-3 gap-2">
        <div className="relative flex-1 max-w-[300px]">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fw-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search clients"
            className="w-full rounded-lg border border-[var(--fw-line)] bg-[var(--fw-linen)] py-2 p-3 text-[13px] text-[var(--fw-ink)] placeholder:text-[var(--fw-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fw-brass)]"
          />
        </div>

        <Link
          href={`/firms/${slug}/invite`}
          className="flex items-center gap-1.5 border border-[var(--fw-brass)] rounded-lg px-3.5 py-2 text-[13px] text-[var(--fw-coffee)] font-medium bg-transparent font-sans whitespace-nowrap"
        >
          <i className="ti ti-plus" /> Invite client
        </Link>
      </div>

      {/* Table */}
      <div className="bg-[var(--fw-card)] border border-[var(--fw-line)] rounded-xl overflow-hidden mt-4 lg:mt-0">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[1.7fr_1fr_0.9fr_0.4fr] gap-3 px-[18px] py-[13px] bg-[var(--fw-linen)] border-b border-[var(--fw-line)] items-center">
          {["Client", "Status", "Last activity", ""].map((h) => (
            <div
              key={h}
              className="text-[10px] tracking-[0.12em] uppercase text-[var(--fw-muted)]"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {clients?.map((c, i) => {
            const badge = STATUS_BADGE[c.status];

            const row = (
              <>
                {/* Person */}
                <div className="flex items-center gap-[11px]">
                  <div className="w-8 h-8 rounded-full bg-[var(--fw-cream)] flex items-center justify-center text-xs font-medium text-[var(--fw-coffee)] shrink-0">
                    {c.initials}
                  </div>
                  <div>
                    <div className="text-sm text-[var(--fw-ink)] font-medium">
                      {c.full_name}
                    </div>
                    <div className="text-[11.5px] text-[var(--fw-muted)]">
                      {c.sub}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-2 lg:mt-0">
                  <span
                    className="inline-flex items-center gap-1.25 text-[11px] font-medium px-2.5 py-1 rounded-[20px]"
                    style={badge?.style}
                  >
                    <i className={`ti ${badge?.icon} mr-1`} />
                    {badge?.label}
                  </span>
                </div>

                {/* Last activity */}
                <div className="text-xs text-[var(--fw-ink-soft)] mt-1 lg:mt-0">
                  {formatDistanceToNow(c.timestamp)}
                </div>

                {/* Chevron */}
                <div
                  className={`hidden lg:block text-right text-[17px] ${
                    c.navigable
                      ? "text-[var(--fw-brass)]"
                      : "text-[var(--fw-line)]"
                  }`}
                >
                  <i className="ti ti-chevron-right" />
                </div>

                {c.navigable && (
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 lg:hidden text-[17px] text-[var(--fw-brass)]">
                    <i className="ti ti-chevron-right" />
                  </div>
                )}
              </>
            );

            const rowClasses = `flex flex-col lg:grid lg:grid-cols-[1.7fr_1fr_0.9fr_0.4fr] gap-3 p-4 lg:px-[18px] lg:py-[13px] ${
              i < clients.length - 1 ? "border-b border-[#F0E9DE]" : ""
            } lg:items-center transition-colors relative`;

            if (c.navigable) {
              return (
                <Link
                  key={c.id}
                  href={`/firms/${slug}/clients/${c.id}`}
                  className={`${rowClasses} cursor-pointer hover:bg-[var(--fw-linen)]`}
                >
                  {row}
                </Link>
              );
            }

            return (
              <div key={c.id} className={`${rowClasses} cursor-default`}>
                {row}
              </div>
            );
          })}
        </div>
      </div>

      {/* Consent note */}
      <div className="flex items-start lg:items-center gap-1.5 px-1.5 py-3 text-[11.5px] text-[var(--fw-muted)] italic font-['Fraunces',serif]">
        <i className="ti ti-lock mt-0.5 lg:mt-0" /> You can open a client's
        items only after they choose to share.
      </div>
    </div>
  );
}
