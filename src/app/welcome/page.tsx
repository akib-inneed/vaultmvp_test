'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('vault_welcome_seen')) {
      router.replace('/dashboard');
    }
  }, [router]);

  function handleStart() {
    localStorage.setItem('vault_welcome_seen', '1');
    window.location.href = '/dashboard';
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Header */}
      <header className="border-b border-ink/10 bg-cream/70 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <span className="font-display text-lg font-black tracking-tight" style={{ color: '#CF9D7B' }}>HEIR<span style={{ color: '#724B39' }}>L</span>O</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-lg mx-auto w-full">

        {/* Beta banner */}
        <div className="w-full bg-teal/10 border border-teal/20 rounded-2xl px-5 py-4 mb-10">
          <p className="font-sans text-sm text-teal leading-relaxed">
            <span className="font-semibold">You&apos;re one of our first beta testers.</span>{' '}
            Thank you for helping us build Heirlo — your feedback shapes everything.
          </p>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-8 text-left w-full">
          Every object holds a story.
        </h1>

        {/* Body */}
        <div className="space-y-5 font-sans text-base text-ink/70 leading-relaxed w-full mb-8">
          <p>
            A ring passed down through three generations. A guitar that traveled across continents.
            A coat your mother wore on her wedding day.
          </p>
          <p>
            Most of us never write any of it down. Not because we don&apos;t care — but because it
            always feels complicated, expensive, or too far away.
          </p>
          <p>
            Heirlo was built to change that. A simple, private place to record what your belongings
            mean and who should receive them. No lawyers. No conflict. Just clarity, given as a gift
            to the people you love most.
          </p>
        </div>

        {/* Italic line */}
        <p className="font-serif italic text-ink/50 text-base w-full mb-10">
          It starts with one item. It takes five minutes.
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full bg-teal text-cream font-sans font-semibold py-4 px-6 rounded-xl hover:bg-teal/90 transition text-base"
        >
          Start documenting
        </button>

      </main>
    </div>
  );
}
