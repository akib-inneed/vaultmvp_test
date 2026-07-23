import { createClient } from "@/lib/supabase/server";

export async function getAttorneyDetail(user: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        firms (*)
    `,
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export async function getFirmBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("firms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.log("err ->", error);
    return null;
  }

  return data;
}
