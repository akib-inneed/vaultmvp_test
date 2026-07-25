"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getUserByToken, login, signup } from "../actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet/50 text-ink placeholder-ink/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const searchParams = useSearchParams();

  const create = searchParams.get("create");
  const token = searchParams.get("token");

  return <AuthForm params={{ create, token }} />;
}

function AuthForm({
  params,
}: {
  params: {
    create: string | null;
    token: string | null;
  };
}) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? searchParams.get("redirect");
  const prefillEmail = searchParams.get("email") ?? "";
  const isBeneficiaryFlow = next?.includes("/dashboard");
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle() {
    setMode((m) => (m === "signup" ? "login" : "signup"));
    setError(null);
  }

  async function handleSignup(formData: FormData) {
    const password = formData.get("password") as string;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData, next ?? undefined);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firmRef = useRef<HTMLInputElement>(null);
  const token = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.create) {
      setMode("signup");

      const verify = async () => {
        if (!params.token) return;
        try {
          const result = await getUserByToken(params.token);
          console.log(result);
          if (nameRef.current) nameRef.current.value = result.client_name;
          if (emailRef.current) emailRef.current.value = result.client_email;
          if (firmRef.current) firmRef.current.value = result.firm_id;
          if (token.current) token.current.value = result.token;

          // Update state based on result
        } catch (err) {
          console.error(err);
        }
      };

      setTimeout(() => {
        verify();
      }, 100);
    }
  }, [params.create, params.token]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-1">
            <span
              className="font-display text-2xl font-black tracking-tight"
              style={{ color: "#CF9D7B" }}
            >
              HEIR<span style={{ color: "#724B39" }}>L</span>O
            </span>
          </div>
          <p className="font-sans text-sm text-ink/45 mt-1">
            {mode === "signup"
              ? isBeneficiaryFlow
                ? "Someone has shared something meaningful with you."
                : "Your personal legacy, documented."
              : "Welcome back."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-jungle rounded-2xl shadow-sm border border-ink/10 p-8">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-6">
            {mode === "signup"
              ? isBeneficiaryFlow
                ? "Create your account to view what\u2019s been left for you"
                : "Create your account"
              : "Sign in"}
          </h2>

          {/* ── SIGNUP FORM ── */}
          {mode === "signup" && (
            <form action={handleSignup} className="space-y-5">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-ink mb-1.5 font-sans"
                >
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="su_email"
                  className="block text-sm font-medium text-ink mb-1.5 font-sans"
                >
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="su_email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={prefillEmail}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="su_password"
                  className="block text-sm font-medium text-ink mb-1.5 font-sans"
                >
                  Password
                </label>
                <input
                  id="su_password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="At least 8 characters"
                />

                <input ref={firmRef} name="firm_id" type="hidden" />
                <input ref={token} name="token" type="hidden" />
              </div>
              {error && (
                <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-3">
                  <p className="text-vault-red text-sm font-sans">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account…" : "Create your account"}
              </button>
            </form>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form action={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="li_email"
                  className="block text-sm font-medium text-ink mb-1.5 font-sans"
                >
                  Email address
                </label>
                <input
                  id="li_email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={prefillEmail}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="li_password"
                  className="block text-sm font-medium text-ink mb-1.5 font-sans"
                >
                  Password
                </label>
                <input
                  id="li_password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="••••••••"
                />
                <div className="mt-1.5 text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-teal hover:text-teal/80 font-sans transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-3">
                  <p className="text-vault-red text-sm font-sans">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal text-cream font-sans font-medium py-3 px-6 rounded-xl hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-ink/55 mt-6 font-sans">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggle}
                className="text-teal hover:text-teal/80 font-medium transition"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={toggle}
                className="text-teal hover:text-teal/80 font-medium transition"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
