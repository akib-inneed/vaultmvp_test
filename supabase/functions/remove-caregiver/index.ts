import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "invalid auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { caregiver_id } = body;

    if (!caregiver_id) {
      return new Response(JSON.stringify({ error: "missing caregiver_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: caregiver, error: cgErr } = await admin
      .from("pet_caregivers")
      .select("id, pet_id, full_name, email, pets(id, name, owner_id)")
      .eq("id", caregiver_id)
      .single();

    if (cgErr || !caregiver) {
      return new Response(JSON.stringify({ error: "caregiver not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pet = (caregiver as any).pets;
    if (!pet || pet.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "not the owner" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const ownerName = ownerProfile?.full_name ?? "Pet owner";

    // Send informational email FIRST (no CTA — just letting them know)
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Heirlo <hello@heirlo.app>",
        to: caregiver.email,
        subject: `Update from ${ownerName} regarding ${pet.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1B1612;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0 0 16px;">A small update</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hi ${caregiver.full_name},</p>
            <p style="font-size: 16px; line-height: 1.6;">${ownerName} has updated their caregiver arrangements for <strong>${pet.name}</strong> on Heirlo. You're no longer listed as a caregiver.</p>
            <p style="font-size: 16px; line-height: 1.6;">No action is needed on your end. If you have questions, please reach out to ${ownerName} directly.</p>
            <hr style="border: none; border-top: 1px solid #EDE5DB; margin: 32px 0;" />
            <p style="font-size: 12px; color: #3D332C;">Heirlo — Legacy, clarified.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend failed:", errText);
      // Non-fatal — proceed with delete
    }

    // Insert 'removed' event BEFORE delete (pet_events references pet_id, not caregiver, so this survives)
    const { error: evtErr } = await admin.from("pet_events").insert({
      pet_id: pet.id,
      actor_id: user.id,
      actor_name: ownerName,
      actor_role: "owner",
      type: "removed",
      body: `Removed ${caregiver.full_name}`,
    });

    if (evtErr) {
      console.error("Failed to insert removed event:", evtErr.message);
    }

    // Delete the caregiver row (cascades to pet_acknowledgments)
    const { error: delErr } = await admin
      .from("pet_caregivers")
      .delete()
      .eq("id", caregiver_id);

    if (delErr) {
      return new Response(JSON.stringify({ error: "failed to delete caregiver", details: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
