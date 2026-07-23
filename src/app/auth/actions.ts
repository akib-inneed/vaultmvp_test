"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientInvite, getInvitedClient } from "@/lib/service/clientRoaster";

export async function login(formData: FormData, redirectTo?: string) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: auth, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (profile.role == "attorney") {
    console.log("profile firm id -> ", profile.firm_id);
    const { data: firm, error } = await supabase
      .from("firms")
      .select("*")
      .eq("id", profile.firm_id)
      .single();

    if (error) {
      return { error: error.message };
    }

    redirect(`/firms/${firm.slug}`);
  }

  revalidatePath("/", "layout");

  // Only allow relative paths to prevent open redirect
  const target =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  redirect(target);
}

export async function signup(formData: FormData, redirectTo?: string) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const firm_id = formData.get("firm_id") as string;
  const token = formData.get("token") as string;

  const callbackUrl =
    redirectTo && redirectTo.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile record
  if (data.user) {
    let payload = {
      id: data.user.id,
      full_name,
      email,
      firm_id: null,
      role: null,
    };

    if (firm_id) {
      payload.firm_id = firm_id;
      payload.role = "user";
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(payload);

    if (token) {
      const { data: updateData, error: updateError } = await supabase
        .from("client_invites")
        .update({
          status: "claimed",
        })
        .eq("token", token)
        .select();
      console.log(updateData, updateError);
    }

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }

  revalidatePath("/", "layout");
  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function getUserByToken(token: string) {
  return getInvitedClient(token);
}
