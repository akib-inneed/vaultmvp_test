import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isValidUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

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
    if (userErr || !user || !user.email) {
      return new Response(JSON.stringify({ error: "invalid auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { acknowledgment_id, action } = body;

    if (!isValidUuid(acknowledgment_id)) {
      return new Response(JSON.stringify({ error: "invalid acknowledgment_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "accepted" && action !== "declined") {
      return new Response(JSON.stringify({ error: "invalid action (must be 'accepted' or 'declined')" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch acknowledgment + caregiver + pet in one join
    const { data: ack, error: ackErr } = await admin
      .from("pet_acknowledgments")
      .select(`
        id,
        status,
        pet_id,
        caregiver_id,
        pet_caregivers (
          id,
          full_name,
          email,
          pets (
            id,
            name,
            owner_id
          )
        )
      `)
      .eq("id", acknowledgment_id)
      .single();

    if (ackErr || !ack) {
      return new Response(JSON.stringify({ error: "acknowledgment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const caregiver = (ack as any).pet_caregivers;
    const pet = caregiver?.pets;

    if (!caregiver || !pet) {
      return new Response(JSON.stringify({ error: "caregiver or pet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Recipient gate: caller's email must match the caregiver email
    if (caregiver.email.toLowerCase() !== user.email.toLowerCase()) {
      return new Response(JSON.stringify({ error: "not the caregiver for this assignment" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: if already responded, reject
    if (ack.status !== "pending") {
      return new Response(JSON.stringify({ error: "already responded", status: ack.status }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    // Atomic-ish: update acknowledgment, then insert event (awaited)
    const { error: updErr } = await admin
      .from("pet_acknowledgments")
      .update({ status: action, acknowledged_at: nowIso })
      .eq("id", acknowledgment_id)
      .eq("status", "pending"); // double-check at write time to avoid race

    if (updErr) {
      return new Response(JSON.stringify({ error: "failed to update acknowledgment", details: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: evtErr } = await admin.from("pet_events").insert({
      pet_id: pet.id,
      actor_id: user.id,
      actor_name: caregiver.full_name,
      actor_role: "caregiver",
      type: action,
      body: `${caregiver.full_name} ${action}`,
    });

    if (evtErr) {
      console.error("Failed to insert event:", evtErr.message);
      // Non-fatal — the ack update already succeeded
    }

    // Email the owner
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", pet.owner_id)
      .single();

    if (ownerProfile?.email) {
      const actionVerb = action === "accepted" ? "accepted" : "declined";
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Heirlo <hello@heirlo.app>",
          to: ownerProfile.email,
          subject: `${caregiver.full_name} ${actionVerb} caregiving for ${pet.name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1B1612;">
              <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0 0 16px;">A response from ${caregiver.full_name}</h1>
              <p style="font-size: 16px; line-height: 1.6;">Hi ${ownerProfile.full_name ?? "there"},</p>
              <p style="font-size: 16px; line-height: 1.6;"><strong>${caregiver.full_name}</strong> has ${actionVerb} caregiving for <strong>${pet.name}</strong>.</p>
              ${action === "accepted"
                ? `<p style="font-size: 16px; line-height: 1.6;">${pet.name} is in good hands. You can view the full activity timeline on Heirlo.</p>`
                : `<p style="font-size: 16px; line-height: 1.6;">No worries — you can assign ${pet.name} to someone else whenever you're ready.</p>`}
              <hr style="border: none; border-top: 1px solid #EDE5DB; margin: 32px 0;" />
              <p style="font-size: 12px; color: #3D332C;">Heirlo — Legacy, clarified.</p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Resend failed:", errText);
        // Non-fatal
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: action, acknowledged_at: nowIso }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
