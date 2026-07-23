# CLAUDE.md — Vault MVP

This file is the source of truth for every Claude Code session on this project.
Read it fully before writing any code. Do not deviate from the decisions recorded here.

---

## What Vault Is

Vault is a personal property documentation platform. It lets people catalog their
physical belongings, assign them to specific recipients, notify those recipients
before death, and generate a formatted document of intent.

The core legal instrument is a **Personal Property Memorandum (PPM)** under UPC §2-513 —
a statutory instrument designed to be created without an attorney. Vault is NOT a law
firm and does NOT practice law. It is a documentation platform.

**Key positioning:** The document Vault generates is billed as non-binding, but is
built to meet minimum UPC enforceability criteria (written, signed, notarized-ready,
with language of testamentary intent). We deliver more than we promise.

---

## MVP Scope — What We Are Building

This is a 4–6 week MVP targeting **real beta users**, not just an investor demo.

### In Scope

1. **User auth & vault profile** — email/password auth via Supabase
2. **Item catalog** — photo upload, item name, description, estimated value (optional)
3. **Beneficiary assignment** — primary + secondary recipient per item (name + email)
4. **Recipient notification** — email to recipient when assigned to an item
5. **Recipient acknowledgment** — web-based acceptance screen (no app required for recipient)
6. **Document generation** — formatted PDF of all assignments with legal intent language
7. **Basic dashboard** — list of vault items and their assigned recipients
8. **Onboarding flow** — don't drop users on a blank vault; guide first item creation

### Explicitly Out of Scope (Do Not Build)

- RON / notarization integration (Notarize.com, Proof, etc.)
- Subscription billing or payments of any kind
- Attorney referral marketplace
- Family live view / vault sharing
- AI item prompts
- Pet guardianship letter
- Story / voice recording
- Death-trigger / obituary API
- SMS notifications (email only for MVP)
- Social login (Google, Apple)

If a feature is not listed under "In Scope," do not build it, even if it seems helpful.
Ask first.

---

## Tech Stack

Do not deviate from this stack without asking.

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Single repo for frontend + API routes |
| Database & Auth | Supabase | Auth + Postgres + file storage in one |
| Photo storage | Supabase Storage | Integrated with DB, no extra setup |
| Email | Resend | Simple API, good deliverability |
| PDF generation | react-pdf / @react-pdf/renderer | Component-based PDF, easy to template |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Deployment | Vercel | Zero-config with Next.js |
| Language | TypeScript | Type safety on data models |

---

## Data Models

These are the canonical data models. Match the database schema exactly to these.

```typescript
// User — managed by Supabase Auth
// Additional profile stored in `profiles` table
interface Profile {
  id: string           // uuid, matches auth.users.id
  full_name: string
  email: string
  created_at: timestamp
}

// An item in the owner's vault
interface Item {
  id: string           // uuid
  owner_id: string     // references profiles.id
  name: string         // e.g. "Gold Bangles", "1962 Gibson Guitar"
  description: string  // optional short description
  estimated_value: number | null  // in USD, optional
  photo_url: string | null        // Supabase Storage URL
  created_at: timestamp
  updated_at: timestamp
}

// A person assigned to receive an item
interface Beneficiary {
  id: string           // uuid
  item_id: string      // references items.id
  owner_id: string     // references profiles.id (denormalized for easy querying)
  full_name: string
  email: string
  priority: 'primary' | 'secondary'
  created_at: timestamp
}

// The acknowledgment record — Vault's most differentiated feature
interface Acknowledgment {
  id: string              // uuid
  beneficiary_id: string  // references beneficiaries.id
  item_id: string         // references items.id
  status: 'pending' | 'accepted' | 'declined'
  notified_at: timestamp  // when the email was sent
  acknowledged_at: timestamp | null  // when recipient responded
  token: string           // unique URL-safe token for the acknowledgment link
}
```

---

## The Core Loop (North Star)

The metric that determines MVP success is **Loop Completion Rate**:

> % of users who (1) add at least one item, (2) assign it to a recipient,
> and (3) that recipient acknowledges it.

Every UI and UX decision should make this loop easier to complete.
Target: 40%+ of beta users complete the full loop.

---

## Document Generation — Legal Language

The generated PDF must include the following elements. Do not change the legal
language without approval from the legal team (April Yang, CLO).

**Required document elements:**
- Owner's full name and date of signing
- Header: "Personal Property Memorandum"
- Body: A table of all assigned items with recipient names
- Statement of intent (use this exact language):

> "I, [OWNER NAME], intend for the personal property listed in this memorandum
> to be distributed to the named recipients upon my death. This document is
> created with testamentary intent and is intended to supplement, not replace,
> any will or trust I may have in effect."

- Disclaimer (use this exact language):

> "This document is a personal record of intent. It is not a substitute for
> legal advice. Heirlo is a documentation platform, not a law firm. Consult a
> licensed estate attorney in your state for legally binding estate planning."

- Signature line with date
- Vault branding in footer

---

## Brand & Design

**Colors (use these CSS variables):**
```css
--teal: #00B89C;        /* primary CTA, accents */
--ink: #0F1C18;         /* dark backgrounds */
--cream: #F5F0E8;       /* warm backgrounds */
--red: #E8341A;         /* errors, warnings */
--amber: #D97706;       /* secondary accents */
```

**Typography:**
- Headings: Playfair Display (serif) — emotional weight
- Body: Inter — clean, readable
- Mono/labels: IBM Plex Mono — technical details, timestamps

**Tone:** Vault feels like a trusted personal space — warm, private, serious but not
cold. Not a legal product. Not a tech product. Something in between.

**UI principles for MVP:**
- Mobile-first. Most users will onboard on their phone.
- Empty states should feel inviting, not empty. Always give the user a clear next action.
- The acknowledgment flow (recipient's screen) should feel like receiving something
  meaningful, not filling out a form.

---

## File Structure

Follow this structure. Do not reorganize without asking.

```
/app
  /auth          — login, signup pages
  /dashboard     — main vault view (item list)
  /items
    /new         — add item flow
    /[id]        — item detail + assignment
  /acknowledge
    /[token]     — recipient acknowledgment page (public, no auth)
  /document      — document preview + download
  /api
    /items       — CRUD
    /beneficiaries
    /acknowledge
    /document    — PDF generation endpoint
    /notify      — send acknowledgment emails

/components
  /ui            — base components (buttons, inputs, cards)
  /vault         — vault-specific components (ItemCard, BeneficiaryRow, etc.)
  /document      — PDF template components

/lib
  /supabase      — client + server Supabase helpers
  /email         — Resend email templates
  /pdf           — PDF generation logic
  /types         — TypeScript types (matches data models above)
```

---

## Environment Variables

These must be set in `.env.local` before any features will work:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Behaviors & Edge Cases

Handle these explicitly — do not leave them as undefined behavior:

- **Recipient declines acknowledgment:** Update status to 'declined'. Show owner a
  notification in their dashboard. Do not delete the assignment.
- **Email bounces:** Log the failure on the Acknowledgment record. Show owner a
  warning badge on the item: "Notification may not have been delivered."
- **Owner tries to delete an item with a pending acknowledgment:** Warn them that
  the recipient will no longer receive the item. Require confirmation.
- **Duplicate email for beneficiary:** A person can be a recipient on multiple items.
  Each item generates a separate acknowledgment. Do not de-duplicate.
- **Unauthenticated acknowledgment page:** `/acknowledge/[token]` must work without
  the recipient having a Vault account. No login wall.

---

## What Not To Do

- Do not add features not listed in scope, even if they seem easy or natural
- Do not use `any` type in TypeScript — always type properly
- Do not store sensitive user data outside Supabase Row Level Security policies
- Do not make the document generation synchronous on the API route — use a background
  approach or stream the response
- Do not use `localStorage` for auth state — use Supabase's built-in session handling
- Do not show attorney referral CTAs, subscription prompts, or upgrade flows — none
  of that exists yet

---

## Session Startup Checklist

At the start of each Claude Code session, confirm:
1. You have read this entire CLAUDE.md
2. Supabase project is initialized and env vars are set
3. You know which part of the build week we're in (Week 1–6)
4. You will not build anything outside the In Scope list above

---

*Last updated: March 2026 — Vault MVP v1*
