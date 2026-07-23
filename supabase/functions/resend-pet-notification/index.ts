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

    // Fetch caregiver + pet
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

    // Fetch existing acknowledgment
    const { data: ack, error: ackErr } = await admin
      .from("pet_acknowledgments")
      .select("id, status, token")
      .eq("caregiver_id", caregiver_id)
      .single();

    if (ackErr || !ack) {
      return new Response(JSON.stringify({ error: "acknowledgment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ack.status !== "pending") {
      return new Response(JSON.stringify({ error: "already responded", status: ack.status }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch owner profile
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const ownerName = ownerProfile?.full_name ?? "Pet owner";

    // Resend email reusing existing token
    const acceptLink = `https://app.heirlo.app/acknowledge-pet?token=${ack.token}`;
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Heirlo <hello@heirlo.app>",
        to: caregiver.email,
        subject: `Reminder: ${ownerName} named you as a caregiver for ${pet.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1B1612;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0 0 16px;">A gentle reminder</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hi ${caregiver.full_name},</p>
            <p style="font-size: 16px; line-height: 1.6;">${ownerName} previously named you as a caregiver for <strong>${pet.name}</strong> on Heirlo. They're hoping you can take a moment to respond.</p>
            <p style="margin: 32px 0;">
              <a href="${acceptLink}" style="background: #724B39; color: #F5EFE8; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Review on Heirlo</a>
            </p>
            <hr style="border: none; border-top: 1px solid #EDE5DB; margin: 32px 0;" />
            <p style="font-size: 12px; color: #3D332C;">Heirlo — Legacy, clarified.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend failed:", errText);
      return new Response(JSON.stringify({ error: "email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update notified_at timestamp
    await admin
      .from("pet_acknowledgments")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", ack.id);

    // Insert 'notified' event
    await admin.from("pet_events").insert({
      pet_id: pet.id,
      actor_id: user.id,
      actor_name: ownerName,
      actor_role: "owner",
      type: "notified",
      body: `Resent notification to ${caregiver.full_name}`,
    });

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
