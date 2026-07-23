import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { BottomNav } from "@/components/vault/BottomNav";
import { TermsModal } from "@/components/vault/TermsModal";
import { VaultGrid } from "@/components/vault/VaultGrid";
import { LeftForMeList } from "@/components/vault/LeftForMeGrid";
import { addItemImageUrls } from "@/lib/items/photos";
import type {
  LeftForMeItem,
  LeftForMeGroup,
} from "@/components/vault/LeftForMeGrid";
import { Greeting } from "./Greeting";
import DandelionMark from "@/components/vault/DandelionMark";
import LogoutButton from "@/components/auth/Logout";

interface BenAck {
  status: string;
}

interface Beneficiary {
  id: string;
  priority: "primary" | "secondary";
  acknowledgments: BenAck[];
}

interface VaultItem {
  id: string;
  name: string;
  description: string;
  photo_url: string | null;
  estimated_value: number | null;
  created_at: string;
  beneficiaries: Beneficiary[];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, terms_accepted_at")
    .eq("id", user.id)
    .single();

  const firstName =
    profile?.full_name?.split(" ")[0] ??
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.user_metadata?.name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";
  const needsTerms = !profile?.terms_accepted_at;
  const userEmail = user.email ?? "";

  // ── Fetch both data sets in parallel ──
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [myItemsResult, myBensResult] = await Promise.all([
    // 1. MY ITEMS
    supabase
      .from("items")
      .select(
        "id, name, description, photo_url, estimated_value, created_at, beneficiaries!left(id, priority, acknowledgments(status))",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),

    // 2. LEFT FOR ME — beneficiary rows matching my email
    userEmail
      ? admin
          .from("beneficiaries")
          .select("id, item_id")
          .ilike("email", userEmail)
      : Promise.resolve({ data: [] as { id: string; item_id: string }[] }),
  ]);

  const myItems = await addItemImageUrls(
    admin,
    (myItemsResult.data ?? []) as unknown as VaultItem[],
  );
  const myBens = myBensResult.data ?? [];

  // ── Build "Left for me" list ──
  let leftForMe: LeftForMeItem[] = [];

  if (myBens.length > 0) {
    const myBenIds = myBens.map((b: { id: string }) => b.id);
    const itemIds = Array.from(
      new Set(myBens.map((b: { item_id: string }) => b.item_id)),
    );

    const [acksResult, itemsResult] = await Promise.all([
      admin
        .from("acknowledgments")
        .select("item_id, status")
        .in("beneficiary_id", myBenIds),
      admin
        .from("items")
        .select("id, name, description, photo_url, owner_id")
        .in("id", itemIds)
        .neq("owner_id", user.id),
    ]);

    const ackMap = new Map<string, string>();
    for (const a of (acksResult.data ?? []) as {
      item_id: string;
      status: string;
    }[]) {
      ackMap.set(a.item_id, a.status);
    }

    const itemsRaw = await addItemImageUrls(admin, itemsResult.data ?? []);
    const ownerIds = Array.from(
      new Set(itemsRaw.map((i: { owner_id: string }) => i.owner_id)),
    );

    const { data: ownerProfiles } =
      ownerIds.length > 0
        ? await admin
            .from("profiles")
            .select("id, full_name, email")
            .in("id", ownerIds)
        : { data: [] as { id: string; full_name: string; email: string }[] };

    const profileMap = new Map(
      (ownerProfiles ?? []).map(
        (p: { id: string; full_name: string; email: string }) => [p.id, p],
      ),
    );

    leftForMe = itemsRaw.map(
      (i: {
        id: string;
        name: string;
        description: string;
        photo_url: string | null;
        owner_id: string;
      }) => {
        const ownerProfile = profileMap.get(i.owner_id);
        return {
          id: i.id,
          name: i.name,
          description: i.description ?? "",
          photo_url: i.photo_url,
          item_description: i.description ?? null,
          owner_id: i.owner_id,
          owner_email: ownerProfile?.email ?? "",
          ownerFullName: ownerProfile?.full_name ?? "Someone",
          ownerFirstName: (ownerProfile?.full_name ?? "Someone").split(" ")[0],
          ackStatus: (ackMap.get(i.id) ?? "pending") as
            | "pending"
            | "accepted"
            | "declined",
        };
      },
    );
  }

  const isCompletelyNew = myItems.length === 0 && leftForMe.length === 0;

  // ── Group "Left for me" by owner ──
  const groupMap = new Map<string, LeftForMeGroup>();
  for (const item of leftForMe) {
    if (!groupMap.has(item.owner_id)) {
      groupMap.set(item.owner_id, {
        owner_id: item.owner_id,
        owner_full_name: item.ownerFullName,
        owner_email: item.owner_email,
        items: [],
      });
    }
    groupMap.get(item.owner_id)!.items.push(item);
  }
  const groupedLeftForMe = Array.from(groupMap.values());

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Top nav */}
      <nav className="border-b border-ink/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex justify-between max-w-3xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <DandelionMark size={28} animate={true} />
            <span
              className="font-display text-lg font-black tracking-tight"
              style={{ color: "#CF9D7B" }}
            >
              HEIR<span style={{ color: "#724B39" }}>L</span>O
            </span>
          </div>
          <LogoutButton></LogoutButton>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* ── GREETING — always at top ── */}
        <div className="mb-7">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink leading-tight">
            <Greeting firstName={firstName} />
          </h2>
          {!isCompletelyNew && myItems.length > 0 && (
            <p className="font-sans text-sm text-ink/40 mt-1">
              {myItems.length} item{myItems.length !== 1 ? "s" : ""} catalogued
            </p>
          )}
        </div>

        {/* ══════════════════════════════════════════
            STATE 1 — COMPLETELY NEW USER
            ══════════════════════════════════════════ */}
        {isCompletelyNew && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ minHeight: "calc(100vh - 280px)" }}
          >
            <DandelionMark size={80} animate={true} />
            <h3
              className="font-serif text-xl font-semibold mt-6 mb-2"
              style={{ color: "#8B6F4E" }}
            >
              Your vault is empty.
            </h3>
            <p className="font-sans text-sm text-ink/45 leading-relaxed max-w-xs mb-8">
              Add the things that matter — so the people you love always know.
            </p>
            <Link
              href="/items/new"
              className="inline-flex items-center justify-center gap-2 text-white font-sans font-medium py-3 px-6 rounded-xl hover:opacity-90 transition text-sm"
              style={{ backgroundColor: "#8B6F4E" }}
            >
              + Add your first item
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STATE 2 & 3 — USER HAS CONTENT
            ══════════════════════════════════════════ */}
        {!isCompletelyNew && (
          <>
            {/* ── YOUR VAULT section ── */}
            <p className="font-mono text-xs text-ink/40 tracking-[0.2em] uppercase mb-4">
              Your vault
            </p>

            {myItems.length > 0 ? (
              <VaultGrid items={myItems} />
            ) : (
              /* Inline empty — user has leftForMe but no own items */
              <Link
                href="/items/new"
                className="group block w-full bg-jungle rounded-2xl border border-dashed border-ink/15 p-10 text-center hover:border-teal/40 hover:shadow-md transition-all duration-200 mb-2"
              >
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-teal/20 transition">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-teal"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="font-sans text-sm text-ink/40 group-hover:text-teal transition">
                  + Add your first item
                </p>
              </Link>
            )}

            {/* ── LEFT FOR YOU section ── */}
            {groupedLeftForMe.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-xs text-ink/40 tracking-[0.2em] uppercase mb-4">
                  Left for you
                </p>
                <LeftForMeList groups={groupedLeftForMe} />
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
      {needsTerms && <TermsModal />}
    </div>
  );
}
