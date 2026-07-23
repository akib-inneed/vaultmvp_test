import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function appUrl(path: string) {
  return `${APP_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getFirmInitial(firmName: string) {
  return firmName.trim().charAt(0).toUpperCase();
}

interface SendAcknowledgmentEmailParams {
  recipientEmail: string;
  recipientName: string;
  ownerName: string;
  token: string;
}

export async function sendAcknowledgmentEmail({
  recipientEmail,
  recipientName,
  ownerName,
  token,
}: SendAcknowledgmentEmailParams): Promise<{ success: boolean; error?: string }> {
  const acknowledgeUrl = appUrl(`/acknowledge/${token}`);
  const firstName = recipientName.split(' ')[0];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You've been named in ${ownerName}'s Heirlo</title>
</head>
<body style="margin:0;padding:0;background-color:#0C1519;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0C1519;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:600;color:#E8E0D4;letter-spacing:-0.3px;">Heirlo</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#162127;border-radius:16px;padding:40px 36px;border:1px solid rgba(207,157,123,0.08);">

              <p style="margin:0 0 8px 0;font-size:13px;color:#CF9D7B;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">A message for you</p>
              <h1 style="margin:0 0 20px 0;font-size:26px;font-weight:700;color:#E8E0D4;line-height:1.25;">
                ${ownerName} is thinking about you
              </h1>
              <p style="margin:0 0 32px 0;font-size:16px;color:#E8E0D4;line-height:1.6;opacity:0.75;">
                Hi ${firstName}, ${ownerName} has been thinking about you and has something meaningful they'd like you to have. They've kept a private record of their wishes — and you're part of it. Sign in to Heirlo to see what they've set aside for you.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${acknowledgeUrl}"
                       style="display:inline-block;background-color:#CF9D7B;color:#0C1519;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.1px;">
                      View &amp; acknowledge
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0 0;font-size:13px;color:#E8E0D4;opacity:0.4;line-height:1.5;text-align:center;">
                Or copy this link:<br/>
                <a href="${acknowledgeUrl}" style="color:#CF9D7B;word-break:break-all;">${acknowledgeUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#E8E0D4;opacity:0.35;line-height:1.6;">
                Heirlo is a personal documentation platform, not a law firm.<br/>
                You received this because ${ownerName} named you as a recipient.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const payload = {
    from: 'Heirlo <hello@heirlo.app>',
    to: recipientEmail,
    subject: `${ownerName} has named you in their personal property memorandum`,
    html,
  };

  try {
    const response = await resend.emails.send(payload);

    if (response.error) {
      console.error('[Resend] Error object:', JSON.stringify(response.error, null, 2));
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Resend] Caught exception:', err);
    const message = err instanceof Error ? err.message : 'Unknown email error';
    return { success: false, error: message };
  }
}

interface SendAttorneyInviteClientEmailParams {
  clientEmail: string;
  clientName: string;
  firmName: string;
  inviteLink: string;
  replyTo?: string | null;
}

export async function sendAttorneyInviteClientEmail({
  clientEmail,
  clientName,
  firmName,
  inviteLink,
  replyTo,
}: SendAttorneyInviteClientEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: 'Heirlo <hello@heirlo.app>',
      to: clientEmail,
      subject: `${firmName} invited you to Heirlo`,
      replyTo: replyTo || undefined,
      template: {
        id: 'attorney_invite_client',
        variables: {
          client_name: clientName,
          firm_iinital: getFirmInitial(firmName),
          firm_name: firmName,
          invite_link: inviteLink,
        },
      },
    });

    if (result.error) {
      console.error('[Resend] Attorney invite error:', JSON.stringify(result.error, null, 2));
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Resend] Attorney invite exception:', err);
    const message = err instanceof Error ? err.message : 'Unknown email error';
    return { success: false, error: message };
  }
}

interface SendDeclineNotificationEmailParams {
  ownerEmail: string;
  ownerName: string;
  beneficiaryName: string;
  itemName: string;
}

export async function sendDeclineNotificationEmail({
  ownerEmail,
  ownerName,
  beneficiaryName,
  itemName,
}: SendDeclineNotificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const ownerFirstName = ownerName.split(' ')[0];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Someone declined an item on Heirlo</title>
</head>
<body style="margin:0;padding:0;background-color:#0C1519;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0C1519;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:600;color:#E8E0D4;letter-spacing:-0.3px;">Heirlo</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#162127;border-radius:16px;padding:40px 36px;border:1px solid rgba(207,157,123,0.08);">
              <p style="margin:0 0 8px 0;font-size:13px;color:#D97706;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Item declined</p>
              <h1 style="margin:0 0 20px 0;font-size:26px;font-weight:700;color:#E8E0D4;line-height:1.25;">
                Someone declined your item
              </h1>
              <p style="margin:0;font-size:16px;color:#E8E0D4;line-height:1.6;opacity:0.75;">
                Hi ${ownerFirstName}, <strong style="color:#E8E0D4;">${beneficiaryName}</strong> has declined the item <strong style="color:#E8E0D4;">'${itemName}'</strong> that you assigned to them on Heirlo.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#E8E0D4;opacity:0.35;line-height:1.6;">
                Heirlo is a personal documentation platform, not a law firm.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: 'Heirlo <hello@heirlo.app>',
      to: ownerEmail,
      subject: 'Someone declined an item on Heirlo',
      html,
    });
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    return { success: false, error: message };
  }
}
