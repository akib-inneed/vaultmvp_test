# Heirlo Security Audit — Tier 1

**Date:** 2026-04-26
**Auditor:** Claude Code (read-only investigation)
**Scope:** Field-level encryption, RLS, MFA, email authentication, bonus items
**Codebase hash:** `b365c13` (HEAD of `main`)

---

## Executive Summary

Heirlo's current security posture relies almost entirely on Supabase's built-in protections: at-rest disk encryption and Row-Level Security policies. **No application-layer encryption exists for any user data field** — item descriptions, recipient names, email addresses, estimated values, and photos are all stored in plaintext (or as publicly-readable storage objects). RLS policies are correctly defined for all core tables but the `item_events` table has no migration in the codebase and its RLS status is unknown. **MFA is not implemented at all** — no UI, no enforcement, no TOTP/passkey flow. Email authentication (SPF/DKIM/DMARC) is partially configured: DKIM and DMARC are present, but **no SPF record was found**, and Supabase auth emails likely send from a different domain than `heirlo.app`. **EXIF metadata is not stripped from uploaded photos**, meaning GPS coordinates, device identifiers, and timestamps are stored and served publicly. These gaps are significant given the threat model (theft, estate fraud, identity correlation).

---

## 1. Field-Level Encryption

No encryption library (`crypto`, `aes`, `pgp`, `kms`, etc.) is imported anywhere in the codebase. All sensitive data is stored as plaintext in Supabase Postgres, protected only by Supabase's default at-rest disk encryption (AES-256 on the underlying storage volume). This means a database compromise, admin console breach, or service-role key leak exposes all user data in cleartext.

| Table | Field | Current State | User-Facing Surface Area | Risk |
|---|---|---|---|---|
| `items` | `name` | Plaintext | Searched/sorted in dashboard queries | Medium |
| `items` | `description` | Plaintext | Rendered in item detail, PDF, acknowledge page | **High** — may contain deeply personal stories |
| `items` | `estimated_value` | Plaintext | Shown in item detail, included in PDF | **High** — combined with photos = theft target list |
| `items` | `photo_url` | Plaintext URL → **public** bucket | Rendered via `<Image>`, included in acknowledge page | **Critical** — photos are world-readable (see below) |
| `items` | `pet_details` (jsonb) | Plaintext | Rendered in item detail | Medium — contains vet info, care details |
| `beneficiaries` | `full_name` | Plaintext | Shown in item detail, emails, PDF | **High** — PII of non-users |
| `beneficiaries` | `email` | Plaintext | Used for notifications, shown in UI | **High** — PII of non-users |
| `profiles` | `full_name` | Plaintext | Dashboard, PDF, emails | Medium |
| `profiles` | `email` | Plaintext | Login, notifications | Medium |
| `acknowledgments` | `token` | Plaintext hex (64 chars) | Used in URL for unauthenticated access | Medium — token is the sole auth for acknowledge flow |
| `item_events` | `body` | Plaintext | Activity feed messages | Medium — may contain personal messages |
| Storage | `item-photos/*` | **Public bucket, no encryption beyond disk** | Anyone with the URL can view | **Critical** |

### Key concern: Public photo bucket

The `item-photos` storage bucket is configured with `public: true` (see `20260312000002_storage.sql:10`). This means:
- Any person with the storage URL can view any user's item photos without authentication
- URLs follow a predictable pattern: `{SUPABASE_URL}/storage/v1/object/public/item-photos/{user_id}/{timestamp}.{ext}`
- The `user_id` is a UUID (not guessable), but URLs are embedded in emails sent to recipients and rendered in the acknowledge page HTML

### Recommended actions

| Priority | Action |
|---|---|
| P0 | Switch `item-photos` bucket to private; use signed URLs with short TTLs |
| P1 | Implement application-layer encryption for `beneficiaries.email`, `beneficiaries.full_name`, and `items.description` using per-user envelope encryption (e.g., AWS KMS or Supabase Vault) |
| P1 | Encrypt `items.estimated_value` — this field combined with photos creates a high-value theft target |
| P2 | Evaluate encrypting `item_events.body` for message-type events |

---

## 2. Row-Level Security

### Per-table audit

| Table | RLS Enabled | Policies | Gaps |
|---|---|---|---|
| `profiles` | Yes | `profiles: owner access` — `FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id)` | None — correctly scoped to own row |
| `items` | Yes | `items: owner access` — `FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)` | None — correctly scoped to owner |
| `beneficiaries` | Yes | `beneficiaries: owner access` — `FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)` | None — correctly scoped to owner |
| `acknowledgments` | Yes | Three separate policies for `SELECT`, `INSERT`, `UPDATE` — all check `items.owner_id = auth.uid()` via subquery | Correctly restricted. No `DELETE` policy (good — acknowledgments shouldn't be deletable by owners) |
| `vaults` | Yes | `owners manage vaults` — `FOR ALL USING (auth.uid() = owner_id)` | Correctly scoped |
| `vault_members` | Yes | `owners manage members` — `FOR ALL` via subquery to `vaults.owner_id` | Correctly scoped — only vault owner can manage members |
| `item_events` | **Unknown** | **No migration file defines this table or its RLS policies** | **Gap** — table is used in code (`events.ts`) but created outside version-controlled migrations. RLS status must be verified in Supabase dashboard |
| `storage.objects` | Yes (via bucket policies) | Upload/update/delete restricted to `auth.uid()` matching folder name; **SELECT is public** (`to public`) | **Gap** — public read access on all photos (see encryption section) |

### Service role usage

The service role key (`SUPABASE_SERVICE_ROLE_KEY`) bypasses all RLS. It is used in:
- `src/app/items/actions.ts:41` — photo upload (bypasses storage RLS)
- `src/app/items/[id]/actions.ts:9-14` — acknowledgment CRUD, beneficiary queries during delete
- `src/app/acknowledge/actions.ts:7-12` — acknowledgment response (required: no auth for recipients)
- `src/app/items/[id]/events.ts:19-24` — event insertion and retrieval
- `src/app/items/[id]/page.tsx:30-33` — beneficiary check for recipient view
- `src/app/api/document/route.ts:45-48` — acknowledgment fetch for PDF

The service role is used appropriately in most cases (acknowledge flow requires it). However, some uses could be replaced with RLS-compatible queries:
- Photo upload in `createItem` uses service role unnecessarily — the storage RLS policy already allows authenticated users to upload to their own folder
- Event retrieval in `getItemEvents` uses service role — if `item_events` has proper RLS, this could use the user's session

### Adversarial RLS test method

**Method:** Code review analysis of RLS policies and query patterns. A live adversarial test would require:
1. Creating two test accounts (User A, User B)
2. User A creates items and beneficiaries
3. User B attempts to query User A's data via the Supabase client (anon key + User B's JWT)
4. Verify all queries return empty results

**Result from code review:** The RLS policies are correctly defined. All `FOR ALL` policies use `auth.uid()` checks. The acknowledgments table uses subquery-based policies that join through `items.owner_id`. **However, a live test should be run against the actual database to verify policies were applied correctly** — the migration files show the intended state, but manual SQL editor changes could have altered them.

**Specific concern:** The `item_events` table has no migration. If it was created without `ALTER TABLE item_events ENABLE ROW LEVEL SECURITY`, any authenticated user could read all events from all items.

---

## 3. Multi-Factor Authentication

### Current state

**MFA is not available in any form.** There is:
- No TOTP setup flow
- No passkey/WebAuthn integration
- No SMS-based 2FA
- No MFA enforcement logic in middleware or auth actions
- No reference to `mfa`, `totp`, `factor`, or `2fa` anywhere in the codebase

The security settings page (`/settings/security`) only offers password change functionality.

### Supabase MFA support

Supabase Auth natively supports TOTP-based MFA via the `supabase.auth.mfa.*` API:
- `enroll()` — generate QR code for authenticator app
- `challenge()` — request a TOTP code
- `verify()` — validate the code
- `getAuthenticatorAssuranceLevel()` — check AAL1 vs AAL2

### Path to implementation

1. **Enrollment UI:** Add TOTP setup flow to `/settings/security` (QR code display, verification input)
2. **Challenge UI:** Add TOTP challenge screen shown after password login when MFA is enrolled
3. **Enforcement:** Modify middleware to check `getAuthenticatorAssuranceLevel()` and redirect AAL1 sessions to MFA challenge when AAL2 is required
4. **Breaking changes:**
   - Existing sessions would need to be upgraded or invalidated
   - The acknowledge flow (`/acknowledge/[token]`) now requires signup — if MFA is mandatory, recipients would need to complete MFA enrollment during signup before they can acknowledge
   - Password reset flow would need MFA re-verification

### Recommended approach

| Priority | Action |
|---|---|
| P1 | Implement optional TOTP-based MFA via Supabase Auth MFA API |
| P2 | Make MFA mandatory for all owner accounts before paid launch |
| P2 | Ensure acknowledge flow handles MFA gracefully (don't block recipients from acknowledging) |

---

## 4. Email Authentication

### SPF

**Status: NOT CONFIGURED (or not publicly resolvable)**

`dig TXT heirlo.app` returned no results. No SPF record (`v=spf1 ...`) was found. This means:
- Receiving mail servers cannot verify that Resend is authorized to send on behalf of `heirlo.app`
- Emails are more likely to be marked as spam or rejected
- The domain is vulnerable to spoofing

**Note:** An MX record exists pointing to `heirlo-app.mail.protection.outlook.com`, suggesting Microsoft 365 is configured for receiving mail. An SPF record should include both Resend and Microsoft 365 sending IPs.

### DKIM

**Status: CONFIGURED**

```
resend._domainkey.heirlo.app TXT "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1V9Ak6E96Jx89YBoVojm8xONS/PHO+eQuP2FhRmZUfMmE3IxszkmJRsaYKJB7P4wfA/fDRwPnHNzBs+UvH8Z9U3CDI6Xt6B+9nLeo957TEt1tsjGYM7mPwQQzr0CAp+oKR8Sh+AqGyYb6smNR8J/dvyU51w0upoVXOTmPtNFbdwIDAQAB"
```

- Selector: `resend`
- Key: 1024-bit RSA (present and valid)
- **Concern:** 1024-bit RSA keys are considered weak. NIST recommends 2048-bit minimum. Resend may need to be asked to provision a 2048-bit key, or a new selector should be configured.

### DMARC

**Status: CONFIGURED (quarantine policy)**

```
_dmarc.heirlo.app TXT "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;"
```

- Policy: `quarantine` (failing messages go to spam — good, but `reject` would be stronger)
- DKIM alignment: relaxed (`adkim=r`)
- SPF alignment: relaxed (`aspf=r`)
- Aggregate reports: sent to `dmarc_rua@onsecureserver.net` (GoDaddy's reporting address)
- Forensic reports (`ruf`): not configured

**Issue:** DMARC with `aspf=r` references SPF, but SPF is not configured. This means SPF alignment always fails, and DMARC relies entirely on DKIM for pass/fail determination.

### Outbound email paths

| Path | Sender | Domain |
|---|---|---|
| Acknowledgment emails | `Heirlo <hello@heirlo.app>` | `heirlo.app` via Resend |
| Cancellation emails (item delete) | `Heirlo <notifications@heirlo.app>` | `heirlo.app` via Resend |
| Decline notification emails | `Heirlo <hello@heirlo.app>` | `heirlo.app` via Resend |
| Supabase auth emails (signup confirmation, password reset) | **Supabase default sender** | Likely `noreply@mail.app.supabase.io` or similar — **not `heirlo.app`** |

**Gap:** Supabase auth emails (email confirmation, password reset) are sent from Supabase's default domain unless a custom SMTP server is configured in the Supabase dashboard. This means users receive emails from two different domains, which:
- Reduces trust/brand consistency
- May confuse recipients
- Could trigger spam filters due to domain mismatch

### Recommended actions

| Priority | Action |
|---|---|
| **P0** | **Add SPF record:** `v=spf1 include:_spf.resend.com include:spf.protection.outlook.com ~all` |
| P1 | Upgrade DKIM key from 1024-bit to 2048-bit RSA |
| P1 | Configure Supabase custom SMTP to send auth emails via Resend from `heirlo.app` |
| P2 | Upgrade DMARC policy from `quarantine` to `reject` after confirming email deliverability |
| P2 | Add `ruf` (forensic reporting) to DMARC record |

---

## 5. Bonus Findings

### 5a. EXIF Stripping on Photo Upload

**Status: NOT IMPLEMENTED**

The photo upload flow (`src/app/items/actions.ts:39-66` and `src/app/items/new/page.tsx:14-29`) does the following:
1. Client-side: `compressorjs` is used to resize images (max 1200x1200, quality 0.7)
2. Server-side: The raw `Buffer` from `photo.arrayBuffer()` is uploaded directly to Supabase Storage

`compressorjs` **does not strip EXIF data by default** — it preserves orientation data and may preserve other EXIF tags including GPS coordinates. The compressed image is then stored in a **public bucket**, meaning:

- **GPS coordinates from phone cameras are stored and publicly accessible**
- Device make/model, software version, and timestamps are preserved
- This creates a location-tracking vector: an attacker who obtains or guesses a photo URL can determine where the item was photographed

**Severity: P0** — This is the highest-priority finding. A public inventory of valuables with GPS coordinates is an active theft risk.

### 5b. Audit Logging

**Status: PARTIALLY IMPLEMENTED**

The `item_events` table provides an activity log for item-level actions:
- Events logged: `assigned`, `notified`, `accepted`, `declined`, `story_edited`, `message`
- Written by: `insertSystemEvent()` (fire-and-forget, via service role)
- Read by: `getItemEvents()` (via service role)

**Gaps:**
- **No migration file exists for `item_events`** — its schema, RLS policies, and indexes are unknown from the codebase
- **Not append-only** — no `DELETE` restriction is enforced (would need a trigger or RLS policy denying deletes)
- **No logging for:** login events, profile changes, PDF generation, account deletion, password changes, failed login attempts
- **Service role writes** — `insertSystemEvent` uses the service role, meaning the system can insert arbitrary events. There's no integrity guarantee.
- Events for user messages (`insertMessage`) do include `actor_id`, but system events have `actor_id: null`

### 5c. Backup Status

**Status: SUPABASE-MANAGED (limited visibility)**

Supabase provides:
- **Daily backups** for Pro plan projects (retained for 7 days)
- **Point-in-time recovery (PITR)** for Pro plan with add-on
- Backups are encrypted at rest (Supabase manages the keys)

**Gaps from the codebase perspective:**
- No documented restore procedure in the repository
- No evidence of a tested restore (no runbook, no test log)
- Storage objects (photos) in Supabase Storage are **not included in database backups** — they would need separate backup procedures
- No backup of the Supabase project configuration (auth settings, storage policies, edge functions)

### 5d. Data Deletion

**Status: CASCADE DELETES ONLY — NO ACCOUNT DELETION FLOW**

When an item is deleted:
- `ON DELETE CASCADE` propagates from `items` → `beneficiaries` → `acknowledgments`
- Item deletion is implemented in `deleteItemWithCheck` with notification emails to affected beneficiaries
- **Photos are NOT deleted from storage** — the item row is deleted but the storage object remains publicly accessible

When a user deletes their account:
- **No account deletion flow exists in the codebase**
- `ON DELETE CASCADE` from `auth.users` → `profiles` → `items` would handle database records
- **Storage objects would be orphaned** — photos remain in the public bucket indefinitely
- **No data retention policy** is documented
- **Backups retain deleted data** for the backup retention period (7 days on Pro plan)

---

## 6. Prioritized Remediation List

| # | Severity | Effort | Description |
|---|---|---|---|
| 1 | **P0** | S | **Strip EXIF data from photos before upload.** Use `compressorjs` with `{ ...options, quality: 0.7, maxWidth: 1200, checkOrientation: true }` and add server-side stripping via `sharp` as a defense-in-depth measure. GPS coordinates on a public inventory of valuables is an active theft vector. |
| 2 | **P0** | S | **Switch `item-photos` bucket from public to private.** Use Supabase signed URLs (short TTL, e.g., 1 hour) for rendering photos. Update all `<Image>` components to use signed URLs. This eliminates URL-guessing attacks and unauthenticated photo access. |
| 3 | **P0** | S | **Add SPF record to `heirlo.app` DNS.** Without SPF, all outbound email is at risk of being marked as spam or rejected. Recommended: `v=spf1 include:_spf.resend.com include:spf.protection.outlook.com ~all` |
| 4 | P1 | M | **Delete storage objects when items are deleted.** Add `supabase.storage.from('item-photos').remove([...])` to `deleteItemWithCheck` before deleting the item row. |
| 5 | P1 | M | **Verify `item_events` table has RLS enabled and correct policies.** Check Supabase dashboard. Add a migration file to version-control the table definition and policies. |
| 6 | P1 | M | **Configure Supabase custom SMTP** to send auth emails (confirmation, password reset) from `heirlo.app` via Resend, instead of Supabase's default sender domain. |
| 7 | P1 | M | **Implement optional TOTP-based MFA** via Supabase Auth MFA API. Add enrollment to `/settings/security` and challenge screen post-login. |
| 8 | P1 | L | **Implement application-layer encryption for high-sensitivity fields:** `beneficiaries.email`, `beneficiaries.full_name`, `items.description`, `items.estimated_value`. Use envelope encryption with per-user keys managed via Supabase Vault or AWS KMS. |
| 9 | P1 | S | **Upgrade DKIM key to 2048-bit RSA.** Current 1024-bit key is below NIST recommendations. |
| 10 | P2 | M | **Build account deletion flow.** Must purge: profile, items, beneficiaries, acknowledgments, events, and storage objects. Add confirmation step and grace period. |
| 11 | P2 | S | **Upgrade DMARC policy to `reject`** after confirming email deliverability is stable with SPF and DKIM. |
| 12 | P2 | M | **Expand audit logging:** login events, failed logins, profile changes, PDF generations, password changes. Make `item_events` append-only (deny `DELETE` via RLS or trigger). |
| 13 | P2 | M | **Document and test backup restore procedure.** Create a runbook. Test restore quarterly. Add storage backup process for photos. |
| 14 | P2 | S | **Reduce service-role key usage.** Replace with RLS-compatible queries where possible (e.g., photo upload in `createItem` already has a compatible storage policy). |
| 15 | P2 | L | **Make MFA mandatory for owner accounts** before paid launch. Ensure acknowledge flow is not blocked for recipients. |

---

**Legend:**
- **P0** = Block beta expansion. Fix before inviting more users.
- **P1** = Fix before 1,000 users.
- **P2** = Fix before paid launch.
- **S** = Small (< 1 day). **M** = Medium (1-3 days). **L** = Large (3-5 days).
