import { createClient } from "@/lib/supabase/server";
import { CLIENT_STATUS } from "../constant";
import { genInitials } from "../utils";

export function formatRelativeOrAbsolute(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export async function getFirmClients(slug: string) {
  const supabase = await createClient();

  const { data: firm, error: firmError } = await supabase
    .from("firms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (firmError || !firm) {
    console.error("Error fetching firm:", firmError);
    return [];
  }

  const { data: profilesData, error: userError } = await supabase
    .from("profiles")
    .select("*, item_count:items!owner_id(count)")
    .eq("firm_id", firm.id)
    .eq("role", "user");

  // console.log(profilesData)

  if (userError) {
    console.error("Error fetching profiles:", userError);
  }

  const { data: invites, error: inviteError } = await supabase
    .from("client_invites")
    .select("*")
    .in("status", ["sent", "opened"]);

  const registeredClients = profilesData?.map((profile) => {
    const count = profile.item_count.at(0)?.count ?? 0;

    const status =
      profile.shared_with_firms_at !== null
        ? CLIENT_STATUS.SHARED
        : CLIENT_STATUS.IN_PROGRESS;

    const initials = profile.full_name ? genInitials(profile.full_name) : "";

    return {
      id: profile.id,
      full_name: profile.full_name,
      initials,
      status,
      sub: `${count} item${count !== 1 ? "s" : ""} documented`,
      navigable: status === CLIENT_STATUS.SHARED,
      timestamp:
        status === CLIENT_STATUS.SHARED
          ? profile.shared_with_firms_at
          : profile.created_at,
    };
  });

  const invitesData = invites?.map((el) => {
    return {
      id: el.id,
      full_name: el.client_name,
      initials: genInitials(el.client_name),
      status: CLIENT_STATUS.INVITED,
      sub: "Invitation emailed",
      navigable: false,
      timestamp: el.created_at,
    };
  });

  let data = [...registeredClients, ...invitesData];

  data.sort((a, b) => a.timestamp - b.timestamp);

  console.log(data);

  return data;
}

export async function getClientDetail(id: string) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  if (profile.shared_with_firms_at == null) {
    return {
      status: "unauthorize",
    };
  }

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*, beneficiaries (*)")
    .eq("owner_id", id);

  if (itemsError) {
    console.error("Error fetching items:", itemsError);
  }

  return {
    status: "success",
    profile,
    items: items || [],
  };
}

export async function getClientInvite(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_invites")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getInvitedClient(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (error) {
    console.log(error);
    return null;
  }

  return data;
}

export async function updateInviteOpenStatus(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_invites")
    .update({
      status: "opened",
    })
    .eq("id", id)
    .select();

  if (error) return { status: "error", error };

  return { status: "success" };
}
