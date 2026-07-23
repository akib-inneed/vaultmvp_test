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
    const { pet_id, full_name, email } = body;

    if (!pet_id || !full_name || !email) {
      return new Response(JSON.stringify({ error: "missing pet_id, full_name, or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pet, error: petErr } = await admin
      .from("pets")
      .select("id, owner_id, name")
      .eq("id", pet_id)
      .single();

    if (petErr || !pet) {
      return new Response(JSON.stringify({ error: "pet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pet.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "not the owner" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single-caregiver constraint: block if an active (pending/accepted) caregiver exists
    const { data: existingCaregivers } = await admin
      .from("pet_caregivers")
      .select("id, pet_acknowledgments(status)")
      .eq("pet_id", pet_id);

    const hasActiveCaregiver = existingCaregivers?.some((cg) => {
      const acks = cg.pet_acknowledgments ?? [];
      if (acks.length === 0) return true;
      return acks.some((a: { status: string }) => a.status !== "declined");
    });

    if (hasActiveCaregiver) {
      return new Response(
        JSON.stringify({
          error: "This pet already has a caregiver assigned. Remove the current caregiver before assigning a new one."
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const ownerName = ownerProfile?.full_name ?? "Pet owner";

    const { data: caregiver, error: cgErr } = await admin
      .from("pet_caregivers")
      .insert({ pet_id, owner_id: pet.owner_id, full_name, email })
      .select()
      .single();

    if (cgErr || !caregiver) {
      return new Response(JSON.stringify({ error: "failed to create caregiver", details: cgErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: ack, error: ackErr } = await admin
      .from("pet_acknowledgments")
      .insert({
        caregiver_id: caregiver.id,
        pet_id,
        status: "pending",
        notified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (ackErr || !ack) {
      return new Response(JSON.stringify({ error: "failed to create acknowledgment", details: ackErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const acceptLink = `https://app.heirlo.app/acknowledge-pet?token=${ack.token}`;
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Heirlo <hello@heirlo.app>",
        to: email,
        subject: `${ownerName} has named you as a caregiver for ${pet.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1B1612;">
            <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 28px; margin: 0 0 16px;">Caregiver assignment</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hi ${full_name},</p>
            <p style="font-size: 16px; line-height: 1.6;">${ownerName} has named you as a caregiver for <strong>${pet.name}</strong> on Heirlo. This means they're trusting you to provide care for ${pet.name} should something happen to them.</p>
            <p style="font-size: 16px; line-height: 1.6;">Please review the assignment and respond:</p>
            <p style="margin: 32px 0;">
              <a href="${acceptLink}" style="background: #724B39; color: #F5EFE8; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Review on Heirlo</a>
            </p>
            <p style="font-size: 14px; color: #3D332C; line-height: 1.6;">If you'd rather not, you can decline — no hard feelings. ${ownerName} will be notified either way.</p>
            <hr style="border: none; border-top: 1px solid #EDE5DB; margin: 32px 0;" />
            <p style="font-size: 12px; color: #3D332C;">Heirlo — Legacy, clarified.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend failed:", errText);
    }

    const { error: evtErr } = await admin.from("pet_events").insert({
      pet_id,
      actor_id: user.id,
      actor_name: ownerName,
      actor_role: "owner",
      type: "assigned",
      body: `Assigned to ${full_name}`,
    });

    if (evtErr) {
      console.error("Failed to insert event:", evtErr.message);
    }

    return new Response(
      JSON.stringify({ success: true, caregiver, acknowledgment: ack }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
