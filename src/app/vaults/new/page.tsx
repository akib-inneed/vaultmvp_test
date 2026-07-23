'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createVault } from '../actions';
import { BottomNav } from '@/components/vault/BottomNav';

type VaultType = 'family' | 'shared';

function FamilyIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M3.5 12.25L14 3.5l10.5 8.75V24.5a1.17 1.17 0 01-1.167 1.167H17.5v-7H10.5v7H4.667A1.17 1.17 0 013.5 24.5V12.25z"
        stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
    </svg>
  );
}

function SharedIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="10.5" cy="9.33" r="4.08" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M2.33 23.33c0-3.865 3.657-7 8.167-7s8.167 3.135 8.167 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <circle cx="19.83" cy="9.33" r="2.92" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M22.75 21c1.75-.933 2.917-2.567 2.917-4.433 0-2.333-2.1-4.317-4.667-4.317" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  );
}

function NewVaultContent() {
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') as VaultType | null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(preselectedType ? 2 : 1);
  const [vaultType, setVaultType] = useState<VaultType | null>(preselectedType);
  const [vaultName, setVaultName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function addMember() {
    const email = memberInput.trim().toLowerCase();
    if (!email || members.includes(email)) {
      setMemberInput('');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setMembers((prev) => [...prev, email]);
    setMemberInput('');
  }

  function removeMember(email: string) {
    setMembers((prev) => prev.filter((m) => m !== email));
  }

  async function handleCreate() {
    if (!vaultType || !vaultName.trim()) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set('name', vaultName.trim());
    fd.set('type', vaultType);
    fd.set('members', members.join(','));
    const result = await createVault(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, server action redirects
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Nav */}
      <nav className="border-b border-ink/10 bg-cream/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === 1) router.push('/vaults');
              else setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
            }}
            className="text-ink/40 hover:text-ink transition"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-serif text-lg font-semibold text-ink">Create Vault</span>
          {/* Step indicator */}
          <div className="ml-auto flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition ${s <= step ? 'bg-teal' : 'bg-ink/15'}`}
              />
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Step 1 — Choose type */}
        {step === 1 && (
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1.5">Step 1 of 4</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">Choose vault type</h2>
            <div className="space-y-3">
              {(['family', 'shared'] as VaultType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setVaultType(t); setStep(2); }}
                  className="w-full flex items-center gap-5 bg-jungle rounded-2xl border-2 border-ink/10 px-6 py-5 hover:border-teal/50 hover:shadow-sm transition text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal/8 flex items-center justify-center text-teal shrink-0 group-hover:bg-teal/15 transition">
                    {t === 'family' ? <FamilyIcon /> : <SharedIcon />}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-ink text-base mb-1">
                      {t === 'family' ? 'Family Vault' : 'Shared Vault'}
                    </p>
                    <p className="font-sans text-sm text-ink/45 leading-relaxed">
                      {t === 'family'
                        ? 'Share your legacy with family members'
                        : 'Collaborate with anyone you choose'}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto text-ink/20 shrink-0">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Name */}
        {step === 2 && (
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1.5">Step 2 of 4</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-2">Name your vault</h2>
            <p className="font-sans text-sm text-ink/45 mb-8">
              Give this {vaultType === 'family' ? 'family' : 'shared'} vault a meaningful name.
            </p>
            <label htmlFor="vault-name" className="block text-sm font-medium text-ink mb-1.5 font-sans">
              Vault name <span className="text-vault-red">*</span>
            </label>
            <input
              id="vault-name"
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              maxLength={100}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet text-ink placeholder-ink/35 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
              placeholder={vaultType === 'family' ? 'e.g. The Johnson Family' : 'e.g. Our Home Together'}
              onKeyDown={(e) => { if (e.key === 'Enter' && vaultName.trim()) setStep(3); }}
            />
            <button
              type="button"
              disabled={!vaultName.trim()}
              onClick={() => setStep(3)}
              className="mt-6 w-full bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3 — Add members */}
        {step === 3 && (
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1.5">Step 3 of 4</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-2">Add members</h2>
            <p className="font-sans text-sm text-ink/45 mb-8">
              Enter email addresses. Invites will be sent when vault sharing launches.
            </p>

            <label htmlFor="member-email" className="block text-sm font-medium text-ink mb-1.5 font-sans">
              Email address <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="member-email"
                type="email"
                value={memberInput}
                onChange={(e) => { setMemberInput(e.target.value); setError(null); }}
                className="flex-1 px-4 py-3 rounded-xl border border-ink/20 bg-jet text-ink placeholder-ink/35 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="name@example.com"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember(); } }}
              />
              <button
                type="button"
                onClick={addMember}
                className="px-4 py-3 bg-teal/10 text-teal rounded-xl hover:bg-teal/20 transition font-sans text-sm font-medium"
              >
                Add
              </button>
            </div>

            {error && <p className="text-xs text-vault-red font-sans mt-2">{error}</p>}

            {/* Member chips */}
            {members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {members.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 bg-teal/10 text-teal text-xs font-sans px-3 py-1.5 rounded-full"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeMember(email)}
                      className="text-teal/60 hover:text-teal transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 bg-jungle text-ink/60 border border-ink/15 font-sans font-medium py-3 px-6 rounded-xl hover:bg-ink/5 transition text-sm"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 transition text-sm"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1.5">Step 4 of 4</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mb-8">Review & create</h2>

            <div className="bg-jungle rounded-2xl border border-ink/10 overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-ink/6">
                <p className="text-xs text-ink/40 font-sans mb-0.5">Vault name</p>
                <p className="font-sans font-semibold text-ink text-sm">{vaultName}</p>
              </div>
              <div className="px-5 py-4 border-b border-ink/6">
                <p className="text-xs text-ink/40 font-sans mb-0.5">Type</p>
                <p className="font-sans font-semibold text-ink text-sm capitalize">{vaultType} Vault</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-ink/40 font-sans mb-0.5">Members</p>
                {members.length === 0 ? (
                  <p className="font-sans text-sm text-ink/35">No members added</p>
                ) : (
                  <div className="space-y-1 mt-1">
                    {members.map((email) => (
                      <p key={email} className="font-sans text-sm text-ink">{email}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {members.length > 0 && (
              <div className="bg-amber/8 border border-amber/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-amber shrink-0 mt-0.5">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.25"/>
                  <path d="M7.5 4.5v3.25M7.5 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-xs font-sans text-ink/55 leading-relaxed">
                  Invite emails will be sent when vault sharing launches. Members are saved now.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-3 mb-4">
                <p className="text-vault-red text-sm font-sans">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/vaults"
                className="flex-1 text-center bg-jungle text-ink/60 border border-ink/15 font-sans font-medium py-3 px-6 rounded-xl hover:bg-ink/5 transition text-sm"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={loading}
                onClick={handleCreate}
                className="flex-1 bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Creating…' : 'Create Vault'}
              </button>
            </div>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}

export default function NewVaultPage() {
  return (
    <Suspense>
      <NewVaultContent />
    </Suspense>
  );
}
